import { ApiSubscriptionModel } from '../models/apiSubscriptionModel.js';
import {
  API_FREE_MONTHLY_LIMIT,
  API_PRO_MONTHLY_LIMIT,
} from '../constants/billingConstants.js';

export type ResolvedApiPlan = 'free' | 'pro_api';

export async function resolveApiPlan(userId: string): Promise<ResolvedApiPlan> {
  const doc = await ApiSubscriptionModel.findOne({ userId }).lean();
  if (!doc) return 'free';
  if (doc.plan !== 'pro_api' || doc.status !== 'active') return 'free';
  if (doc.currentPeriodEnd && doc.currentPeriodEnd < new Date()) return 'free';
  return 'pro_api';
}

export function monthlyVerifyLimitForPlan(plan: ResolvedApiPlan): number {
  return plan === 'pro_api' ? API_PRO_MONTHLY_LIMIT : API_FREE_MONTHLY_LIMIT;
}
