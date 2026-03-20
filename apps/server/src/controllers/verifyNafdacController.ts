import type { Request, Response, NextFunction } from 'express';
import type {
  VerifyApiErrorBody,
  VerifyApiSuccess,
} from '../types/productTypes.js';
import type { ProductPlain } from '../types/productTypes.js';
import { getOrFetchProduct } from '../services/verifyService.js';
import { recordVerifyOutcome } from '../services/usageMetricsService.js';
import { logger } from '../utils/logger.js';

export async function verifyNafdacController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const trackUserId =
    req.authContext?.source === 'api_key' ? req.authContext.userId : undefined;

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
    const body: VerifyApiSuccess = { ok: true, product };
    res.status(200).json(body);
  } catch (err) {
    if (trackUserId) {
      await recordVerifyOutcome(trackUserId, 'failed').catch(() => {});
    }
    logger.error('verifyByNafdac failed', { message: String(err) });
    next(err);
  }
}
