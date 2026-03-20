import type { Request, Response, NextFunction } from 'express';
import type {
  VerifyApiErrorBody,
  VerifyApiSuccess,
} from '../types/productTypes.js';
import type { ProductPlain } from '../types/productTypes.js';
import { getOrFetchProduct } from '../services/verifyService.js';
import { recordVerifyOutcome } from '../services/usageMetricsService.js';
import { recordBotVerifyMetrics } from '../services/botMetricsService.js';
import type { BotTelegramPayload } from '../services/botMetricsService.js';
import { logger } from '../utils/logger.js';

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
  const trackUserId =
    req.authContext?.source === 'api_key' ? req.authContext.userId : undefined;
  const isBot = req.authContext?.source === 'bot';
  const botTelegram = toBotTelegramPayload(req);

  try {
    const rawParam = req.params.nafdac;
    const raw = Array.isArray(rawParam) ? rawParam[0] : rawParam;
    if (!raw?.trim()) {
      const body: VerifyApiErrorBody = {
        ok: false,
        code: 'INVALID_NAFDAC',
        message: 'NAFDAC number is required',
      };
      res.status(400).json(body);
      return;
    }

    logger.info('verifyController request received', { nafdac: raw });
    const product: ProductPlain | null = await getOrFetchProduct(raw);
    if (!product) {
      if (trackUserId) {
        await recordVerifyOutcome(trackUserId, 'not_found');
      }
      if (isBot) {
        await recordBotVerifyMetrics(botTelegram, 'not_found').catch(() => {});
      }
      const body: VerifyApiErrorBody = {
        ok: false,
        code: 'NOT_FOUND',
        message: 'Product not found for this NAFDAC number',
      };
      res.status(404).json(body);
      return;
    }

    if (trackUserId) {
      await recordVerifyOutcome(trackUserId, 'found');
    }
    if (isBot) {
      await recordBotVerifyMetrics(botTelegram, 'found').catch(() => {});
    }
    const body: VerifyApiSuccess = { ok: true, product };
    res.status(200).json(body);
  } catch (err) {
    if (trackUserId) {
      await recordVerifyOutcome(trackUserId, 'failed').catch(() => {});
    }
    if (isBot) {
      await recordBotVerifyMetrics(botTelegram, 'failed').catch(() => {});
    }
    logger.error('verifyByNafdac failed', { message: String(err) });
    next(err);
  }
}
