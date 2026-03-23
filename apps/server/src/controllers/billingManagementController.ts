import type { Request, Response } from 'express';
import { ApiSubscriptionModel } from '../models/apiSubscriptionModel.js';
import {
  monthlyVerifyLimitForPlan,
  resolveApiPlan,
} from '../services/apiPlanService.js';
import {
  currentUtcMonthKey,
  getMonthlyUsageBreakdown,
} from '../services/monthlyApiQuotaService.js';
import { listUserApiBillingPayments } from '../services/apiBillingPaymentService.js';
import {
  disablePaystackSubscription,
  fetchPaystackSubscriptionLive,
  fetchPaystackSubscriptionManageLink,
} from '../services/paystackService.js';
import { logger } from '../utils/logger.js';

export async function getBillingAccountController(req: Request, res: Response) {
  const userId = req.authUser!.id;
  const plan = await resolveApiPlan(userId);
  const periodKey = currentUtcMonthKey();
  const usageBreakdown = await getMonthlyUsageBreakdown(userId, periodKey);
  const monthlyUsed = usageBreakdown.verify + usageBreakdown.search;
  const monthlyLimit = monthlyVerifyLimitForPlan(plan);

  const doc = await ApiSubscriptionModel.findOne({ userId }).lean();
  const hasCustomerProfile = Boolean(doc?.paystackCustomerCode);

  const base = {
    plan,
    monthlyUsed,
    monthlyLimit,
    ...(plan === 'pro_api'
      ? {
          monthlyVerifyUsed: usageBreakdown.verify,
          monthlySearchUsed: usageBreakdown.search,
        }
      : {}),
    hasCustomerProfile,
    subscription: null as null | {
      paystackStatus: string | null;
      nextPaymentDate: string | null;
      amountKobo: number | null;
      currency: string;
      planName: string | null;
      planInterval: string | null;
      currentPeriodEnd: string | null;
      updatePaymentMethodUrl: string | null;
      canCancel: boolean;
      syncError: string | null;
    },
  };

  if (!doc?.paystackSubscriptionCode) {
    res.status(200).json({ ok: true, account: base });
    return;
  }

  const live = await fetchPaystackSubscriptionLive(
    doc.paystackSubscriptionCode,
  );
  if (!live.ok) {
    res.status(200).json({
      ok: true,
      account: {
        ...base,
        subscription: {
          paystackStatus: null,
          nextPaymentDate: null,
          amountKobo: null,
          currency: 'NGN',
          planName: null,
          planInterval: null,
          currentPeriodEnd: doc.currentPeriodEnd
            ? doc.currentPeriodEnd.toISOString()
            : null,
          updatePaymentMethodUrl: null,
          canCancel: false,
          syncError: live.message,
        },
      },
    });
    return;
  }

  let updatePaymentMethodUrl: string | null = null;
  if (live.data.status === 'active') {
    const link = await fetchPaystackSubscriptionManageLink(
      doc.paystackSubscriptionCode,
    );
    if (link.ok) {
      updatePaymentMethodUrl = link.url;
    } else {
      logger.warn('Paystack manage link unavailable', {
        message: link.message,
      });
    }
  }

  const canCancel =
    plan === 'pro_api' &&
    live.data.emailToken.length > 0 &&
    live.data.status === 'active';

  res.status(200).json({
    ok: true,
    account: {
      ...base,
      subscription: {
        paystackStatus: live.data.status,
        nextPaymentDate: live.data.nextPaymentDate,
        amountKobo: live.data.amountKobo,
        currency: live.data.currency,
        planName: live.data.planName,
        planInterval: live.data.planInterval,
        currentPeriodEnd: doc.currentPeriodEnd
          ? doc.currentPeriodEnd.toISOString()
          : null,
        updatePaymentMethodUrl,
        canCancel,
        syncError: null,
      },
    },
  });
}

export async function getBillingTransactionsController(
  req: Request,
  res: Response,
) {
  const userId = req.authUser!.id;

  const rawPage = Number(req.query.page);
  const page = Number.isFinite(rawPage) ? Math.max(1, Math.floor(rawPage)) : 1;

  const { transactions, meta } = await listUserApiBillingPayments({
    userId,
    page,
    perPage: 20,
  });

  res.status(200).json({
    ok: true,
    transactions,
    meta,
  });
}

export async function postCancelApiSubscriptionController(
  req: Request,
  res: Response,
) {
  const userId = req.authUser!.id;
  const doc = await ApiSubscriptionModel.findOne({ userId }).lean();
  if (!doc?.paystackSubscriptionCode) {
    res.status(400).json({
      ok: false,
      code: 'NO_SUBSCRIPTION',
      message: 'No Paystack subscription is linked to this account.',
    });
    return;
  }

  const live = await fetchPaystackSubscriptionLive(
    doc.paystackSubscriptionCode,
  );
  if (!live.ok) {
    res.status(503).json({
      ok: false,
      code: 'BILLING_UNAVAILABLE',
      message: live.message,
    });
    return;
  }

  if (!live.data.emailToken) {
    res.status(503).json({
      ok: false,
      code: 'SUBSCRIPTION_INCOMPLETE',
      message: 'Could not load subscription credentials from Paystack.',
    });
    return;
  }

  if (live.data.status !== 'active') {
    res.status(400).json({
      ok: false,
      code: 'NOT_ACTIVE',
      message: `Subscription is not active (status: ${live.data.status}).`,
    });
    return;
  }

  const disabled = await disablePaystackSubscription({
    code: doc.paystackSubscriptionCode,
    token: live.data.emailToken,
  });

  if (!disabled.ok) {
    res.status(503).json({
      ok: false,
      code: 'CANCEL_FAILED',
      message: disabled.message,
    });
    return;
  }

  await ApiSubscriptionModel.updateOne(
    { userId },
    {
      $set: {
        plan: 'free',
        status: 'inactive',
        currentPeriodEnd: null,
      },
    },
  );

  logger.info('API Pro subscription cancelled by user', { userId });

  res.status(200).json({ ok: true });
}
