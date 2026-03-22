import type { Request, Response, NextFunction } from 'express';
import { resolveApiPlan } from '../services/apiPlanService.js';
import {
  runProductSearch,
  tokenizeSearchQuery,
} from '../services/productSearchService.js';
import type { VerifyApiErrorBody } from '../types/types.js';

export async function productSearchController(
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
      message: 'Product search requires API Pro.',
    } as VerifyApiErrorBody);
    return;
  }
  const q = String(req.query.q ?? '').trim();
  if (q.length < 2) {
    res.status(400).json({
      ok: false,
      code: 'INVALID_QUERY',
      message: 'Query q must be at least 2 characters.',
    } as VerifyApiErrorBody);
    return;
  }

  const tokens = tokenizeSearchQuery(q);
  if (tokens.length === 0) {
    res.status(400).json({
      ok: false,
      code: 'INVALID_QUERY',
      message:
        'Use at least one keyword of 2 or more characters (letters or numbers).',
    } as VerifyApiErrorBody);
    return;
  }

  const limit = Math.min(
    50,
    Math.max(1, Number(req.query.limit) || 20),
  );
  try {
    const results = await runProductSearch(q, limit);

    res.status(200).json({
      ok: true,
      results: results.map((d) => ({
        nafdac: d.nafdac,
        name: d.name,
        category: d.category,
        manufacturer: d.manufacturer,
      })),
    });
  } catch (e) {
    next(e);
  }
}
