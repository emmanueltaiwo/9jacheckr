import type { Request, Response, NextFunction } from 'express';
import type { ProductPlain, VerifyApiErrorBody } from '../types/types.js';
import { getOrFetchProduct } from '../services/verifyService.js';
import { resolveApiPlan } from '../services/apiPlanService.js';
import {
  assertMonthlyApiQuotaAllowsAdditional,
  incrementMonthlyApiVerify,
} from '../services/monthlyApiQuotaService.js';
import { recordUserApiVerify } from '../services/userApiUsageService.js';
import { logger } from '../utils/logger.js';

const BATCH_MAX = 40;

type BatchItem =
  | { nafdac: string; ok: true; product: ProductPlain }
  | { nafdac: string; ok: false; code: string; message: string };

export async function verifyBatchController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = req.authContext?.userId;
  if (!userId) {
    res.status(401).json({
      ok: false,
      code: 'UNAUTHORIZED',
      message: 'Unauthorized',
    } as VerifyApiErrorBody);
    return;
  }
  const plan = await resolveApiPlan(userId);
  if (plan !== 'pro_api') {
    res.status(403).json({
      ok: false,
      code: 'FEATURE_REQUIRES_PRO',
      message: 'Batch verify requires API Pro.',
    } as VerifyApiErrorBody);
    return;
  }

  const body = req.body as { nafdac?: unknown };
  const raw = body?.nafdac;
  if (!Array.isArray(raw)) {
    res.status(400).json({
      ok: false,
      code: 'INVALID_BODY',
      message: 'Body must include nafdac string array.',
    } as VerifyApiErrorBody);
    return;
  }
  const list = raw
    .map((x) => String(x ?? '').trim())
    .filter(Boolean)
    .slice(0, BATCH_MAX);
  if (list.length === 0) {
    res.status(400).json({
      ok: false,
      code: 'INVALID_BODY',
      message: 'Provide at least one NAFDAC number.',
    } as VerifyApiErrorBody);
    return;
  }

  const quota = await assertMonthlyApiQuotaAllowsAdditional(userId, list.length);
  if (!quota.ok) {
    res.status(429).json({
      ok: false,
      code: 'PLAN_QUOTA_EXCEEDED',
      message: `Not enough monthly quota for ${list.length} checks.`,
    } as VerifyApiErrorBody);
    return;
  }

  const results: BatchItem[] = [];
  try {
    for (const nafdac of list) {
      const product = await getOrFetchProduct(nafdac);
      if (!product) {
        await recordUserApiVerify(userId, 'not_found').catch(() => {});
        await incrementMonthlyApiVerify(userId).catch(() => {});
        results.push({
          nafdac,
          ok: false,
          code: 'NOT_FOUND',
          message: 'Product not found for this NAFDAC number',
        });
      } else {
        await recordUserApiVerify(userId, 'found').catch(() => {});
        await incrementMonthlyApiVerify(userId).catch(() => {});
        results.push({ nafdac, ok: true, product });
      }
    }
    res.status(200).json({ ok: true, results });
  } catch (e) {
    logger.error('verifyBatch failed', { message: String(e) });
    next(e);
  }
}
