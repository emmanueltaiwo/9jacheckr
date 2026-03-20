import type { Request, Response } from 'express';
import {
  formatYearMonthUtc,
  getMonthlyMetricsForUser,
  parseYearMonthParam,
} from '../services/usageMetricsService.js';

export async function getMyMetricsController(req: Request, res: Response) {
  const userId = req.authUser?.id;
  if (!userId) {
    res.status(401).json({
      ok: false,
      code: 'UNAUTHORIZED',
      message: 'Sign in required',
    });
    return;
  }

  const raw = typeof req.query.month === 'string' ? req.query.month : undefined;
  const yearMonth = parseYearMonthParam(raw) ?? formatYearMonthUtc();

  const metrics = await getMonthlyMetricsForUser(userId, yearMonth);

  res.json({
    ok: true,
    month: yearMonth,
    metrics,
  });
}
