import type { Request, Response } from 'express';
import { resolveApiPlan, monthlyVerifyLimitForPlan } from '../services/apiPlanService.js';
import {
  currentUtcMonthKey,
  getMonthlyVerifyCount,
} from '../services/monthlyApiQuotaService.js';

export async function getBillingStatusController(req: Request, res: Response) {
  const userId = req.authUser!.id;
  const plan = await resolveApiPlan(userId);
  const periodKey = currentUtcMonthKey();
  const monthlyUsed = await getMonthlyVerifyCount(userId, periodKey);
  const monthlyLimit = monthlyVerifyLimitForPlan(plan);
  res.status(200).json({
    ok: true,
    billing: {
      plan,
      monthlyUsed,
      monthlyLimit,
    },
  });
}
