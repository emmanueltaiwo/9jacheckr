import type { NextFunction, Request, Response } from 'express';
import type { BotTelegramPayload, VerifyApiErrorBody } from '../types/types.js';
import { getOrFetchProduct } from '../services/verifyService.js';
import { extractNafdacFromOcrTextWithGemini } from '../services/geminiNafdacExtractService.js';
import { detectTextInImage } from '../services/googleVisionTextService.js';
import {
  extractNafdacCandidatesFromVisionAnnotation,
  formatVisionOcrForGemini,
} from '../utils/nafdacFromOcrText.js';
import { resolveBotPlan } from '../services/botPlanService.js';
import { recordBotVerifyMetrics } from '../services/botMetricsService.js';
import { respondAfterProductLookup } from './verifyNafdacController.js';
import { logger } from '../utils/logger.js';

function telegramHeaderDecoded(raw: string | undefined): string | undefined {
  const v = raw?.trim();
  if (!v) return undefined;
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}

function botTelegramFromHeaders(req: Request): BotTelegramPayload | undefined {
  const tid = req.header('x-telegram-user-id')?.trim();
  if (!tid) return undefined;
  return {
    id: tid,
    username: telegramHeaderDecoded(req.header('x-telegram-username')),
    firstName: telegramHeaderDecoded(req.header('x-telegram-first-name')),
    lastName: telegramHeaderDecoded(req.header('x-telegram-last-name')),
  };
}

export async function botVerifyImageController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const botTelegram = botTelegramFromHeaders(req);

  try {
    if (!botTelegram?.id) {
      res.status(400).json({
        ok: false,
        code: 'INVALID_BODY',
        message: 'x-telegram-user-id header is required',
      } satisfies VerifyApiErrorBody);
      return;
    }

    const plan = await resolveBotPlan(botTelegram.id);
    if (plan !== 'pro_bot') {
      res.status(403).json({
        ok: false,
        code: 'FEATURE_REQUIRES_BOT_PRO',
        message:
          'Photo verify is a Bot Pro feature. Use /upgrade or send the number with /verify.',
      } satisfies VerifyApiErrorBody);
      return;
    }

    const buf = req.body;
    if (!Buffer.isBuffer(buf) || buf.length === 0) {
      res.status(415).json({
        ok: false,
        code: 'UNSUPPORTED_MEDIA_TYPE',
        message: 'Send a JPEG, PNG, or WebP image body.',
      } satisfies VerifyApiErrorBody);
      return;
    }

    const vision = await detectTextInImage(buf);
    if (!vision.ok) {
      res.status(503).json({
        ok: false,
        code: 'OCR_FAILED',
        message:
          'Could not read the image. Try again or use /verify with text.',
      } satisfies VerifyApiErrorBody);
      return;
    }

    const ocrBundle = formatVisionOcrForGemini(vision.fullTextAnnotation);
    const geminiConfigured = Boolean(process.env.GEMINI_API_KEY?.trim());
    const gemini = await extractNafdacFromOcrTextWithGemini(ocrBundle);

    if (geminiConfigured) {
      if (gemini.kind === 'unavailable') {
        res.status(503).json({
          ok: false,
          code: 'EXTRACTION_FAILED',
          message:
            'Could not read the registration from the photo. Try again or use /verify with text.',
        } satisfies VerifyApiErrorBody);
        return;
      }
      if (gemini.kind === 'ambiguous') {
        res.status(422).json({
          ok: false,
          code: 'AMBIGUOUS_NAFDAC',
          message:
            'Multiple numbers found. Reply with one number as text or use /verify.',
          candidates: gemini.candidates,
        } satisfies VerifyApiErrorBody);
        return;
      }
      if (gemini.kind === 'one') {
        const nafdac = gemini.nafdac;
        logger.info('bot verify-image', { nafdac, source: 'gemini' });
        const product = await getOrFetchProduct(nafdac);
        await respondAfterProductLookup(res, {
          product,
          isBot: true,
          botTelegram,
          keyUserId: undefined,
          notFoundNafdac: nafdac,
        });
        return;
      }
      res.status(422).json({
        ok: false,
        code: 'NO_NAFDAC_IN_IMAGE',
        message:
          'No NAFDAC registration number found. Send a clearer photo or type the number with /verify.',
      } satisfies VerifyApiErrorBody);
      return;
    }

    const candidates = extractNafdacCandidatesFromVisionAnnotation(
      vision.fullTextAnnotation,
    );

    if (candidates.length === 0) {
      res.status(422).json({
        ok: false,
        code: 'NO_NAFDAC_IN_IMAGE',
        message:
          'No NAFDAC registration number found. Send a clearer photo or type the number with /verify.',
      } satisfies VerifyApiErrorBody);
      return;
    }

    if (candidates.length > 1) {
      res.status(422).json({
        ok: false,
        code: 'AMBIGUOUS_NAFDAC',
        message:
          'Multiple numbers found. Reply with one number as text or use /verify.',
        candidates,
      } satisfies VerifyApiErrorBody);
      return;
    }

    const nafdac = candidates[0]!;
    logger.info('bot verify-image', { nafdac, source: 'vision-regex' });
    const product = await getOrFetchProduct(nafdac);
    await respondAfterProductLookup(res, {
      product,
      isBot: true,
      botTelegram,
      keyUserId: undefined,
      notFoundNafdac: nafdac,
    });
  } catch (err) {
    await recordBotVerifyMetrics(botTelegram, 'failed').catch(() => {});
    logger.error('botVerifyImage failed', { message: String(err) });
    next(err);
  }
}
