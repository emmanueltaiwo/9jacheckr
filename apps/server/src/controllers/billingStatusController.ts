import type { Request, Response } from 'express';
import {
  resolveApiPlan,
  monthlyVerifyLimitForPlan,
} from '../services/apiPlanService.js';
import {
  currentUtcMonthKey,
  getMonthlyUsageBreakdown,
} from '../services/monthlyApiQuotaService.js';

export async function getBillingStatusController(req: Request, res: Response) {
  const userId = req.authUser!.id;
  const plan = await resolveApiPlan(userId);
  const periodKey = currentUtcMonthKey();
  const breakdown = await getMonthlyUsageBreakdown(userId, periodKey);
  const monthlyUsed = breakdown.verify + breakdown.search;
  const monthlyLimit = monthlyVerifyLimitForPlan(plan);
  res.status(200).json({
    ok: true,
    billing: {
      plan,
      monthlyUsed,
      monthlyLimit,
      ...(plan === 'pro_api'
        ? {
            monthlyVerifyUsed: breakdown.verify,
            monthlySearchUsed: breakdown.search,
          }
        : {}),
    },
  });
}
