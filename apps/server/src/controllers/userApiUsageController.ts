import type { Request, Response } from 'express';
import { getUsageForUser } from '../services/userApiUsageService.js';
import { resolveApiPlan } from '../services/apiPlanService.js';

export async function getMyUsageMetrics(req: Request, res: Response) {
  const userId = req.authUser!.id;
  const plan = await resolveApiPlan(userId);
  if (plan !== 'pro_api') {
    res.status(403).json({
      ok: false,
      code: 'METRICS_NOT_AVAILABLE',
      message: 'Usage metrics are available on API Pro.',
    });
    return;
  }
  const metrics = await getUsageForUser(userId);
  res.status(200).json({
    ok: true,
    metrics: {
      ...metrics,
      lastVerifyAt: metrics.lastVerifyAt
        ? metrics.lastVerifyAt.toISOString()
        : null,
    },
  });
}
