import type { Request, Response, NextFunction } from 'express';
import type {
  BotTelegramPayload,
  ProductPlain,
  VerifyApiErrorBody,
  VerifyApiSuccess,
} from '../types/types.js';
import { getOrFetchProduct } from '../services/verifyService.js';
import { recordBotVerifyMetrics } from '../services/botMetricsService.js';
import { recordUserApiVerify } from '../services/userApiUsageService.js';
import {
  assertMonthlyApiQuotaAllows,
  incrementMonthlyApiVerify,
} from '../services/monthlyApiQuotaService.js';
import {
  assertBotDailyQuotaAllows,
  incrementBotDailyVerify,
} from '../services/botPlanService.js';
import { logger } from '../utils/logger.js';

function apiKeyUserId(req: Request): string | undefined {
  if (req.authContext?.source !== 'api_key') return undefined;
  return req.authContext.userId;
}

function toBotTelegramPayload(req: Request): BotTelegramPayload | undefined {
  if (req.authContext?.source !== 'bot' || !req.botTelegram) return undefined;
  const t = req.botTelegram;
  return {
    id: t.id,
    username: t.username,
    firstName: t.firstName,
    lastName: t.lastName,
  };
}

export async function verifyNafdacController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const isBot = req.authContext?.source === 'bot';
  const botTelegram = toBotTelegramPayload(req);
  const keyUserId = apiKeyUserId(req);

  try {
    const rawParam = req.params.nafdac;
    const raw = Array.isArray(rawParam) ? rawParam[0] : rawParam;
    if (!raw?.trim()) {
      if (keyUserId) {
        await recordUserApiVerify(keyUserId, 'error').catch(() => {});
      }
      const body: VerifyApiErrorBody = {
        ok: false,
        code: 'INVALID_NAFDAC',
        message: 'NAFDAC number is required',
      };
      res.status(400).json(body);
      return;
    }

    if (keyUserId) {
      const quota = await assertMonthlyApiQuotaAllows(keyUserId);
      if (!quota.ok) {
        const body: VerifyApiErrorBody = {
          ok: false,
          code: 'PLAN_QUOTA_EXCEEDED',
          message: `Monthly verify limit reached (${quota.limit}). Upgrade to API Pro for a higher quota.`,
        };
        res.status(429).json(body);
        return;
      }
    }

    if (isBot && botTelegram?.id) {
      const bq = await assertBotDailyQuotaAllows(botTelegram.id);
      if (!bq.ok) {
        const body: VerifyApiErrorBody = {
          ok: false,
          code: 'BOT_DAILY_LIMIT',
          message: `Without Bot Pro, this bot allows up to ${bq.limit} checks per UTC day (resets at midnight UTC). /upgrade for Bot Pro (no daily cap). /status shows your plan and usage.`,
        };
        res.status(429).json(body);
        return;
      }
    }

    logger.info('verifyController request received', { nafdac: raw });
    const product: ProductPlain | null = await getOrFetchProduct(raw);
    if (!product) {
      if (isBot) {
        await recordBotVerifyMetrics(botTelegram, 'not_found').catch(() => {});
      }
      if (keyUserId) {
        await recordUserApiVerify(keyUserId, 'not_found').catch(() => {});
        await incrementMonthlyApiVerify(keyUserId).catch(() => {});
      }
      if (isBot && botTelegram?.id) {
        await incrementBotDailyVerify(botTelegram.id).catch(() => {});
      }
      const body: VerifyApiErrorBody = {
        ok: false,
        code: 'NOT_FOUND',
        message: 'Product not found for this NAFDAC number',
      };
      res.status(404).json(body);
      return;
    }

    if (isBot) {
      await recordBotVerifyMetrics(botTelegram, 'found').catch(() => {});
    }
    if (keyUserId) {
      await recordUserApiVerify(keyUserId, 'found').catch(() => {});
      await incrementMonthlyApiVerify(keyUserId).catch(() => {});
    }
    if (isBot && botTelegram?.id) {
      await incrementBotDailyVerify(botTelegram.id).catch(() => {});
    }
    const body: VerifyApiSuccess = { ok: true, product };
    res.status(200).json(body);
  } catch (err) {
    if (isBot) {
      await recordBotVerifyMetrics(botTelegram, 'failed').catch(() => {});
    }
    if (keyUserId) {
      await recordUserApiVerify(keyUserId, 'error').catch(() => {});
    }
    logger.error('verifyByNafdac failed', { message: String(err) });
    next(err);
  }
}
