import mongoose from 'mongoose';
import { ApiSubscriptionModel } from '../models/apiSubscriptionModel.js';
import { BotSubscriptionModel } from '../models/botSubscriptionModel.js';
import { recordApiProPaymentFromWebhook } from './apiBillingPaymentService.js';
import { recordBotProPaymentFromWebhook } from './botBillingPaymentService.js';
import { logger } from '../utils/logger.js';

function asRecord(v: unknown): Record<string, unknown> | null {
  if (v && typeof v === 'object' && !Array.isArray(v)) {
    return v as Record<string, unknown>;
  }
  return null;
}

function normalizeMetaObject(raw: unknown): Record<string, unknown> {
  if (raw == null) return {};
  if (typeof raw === 'string') {
    const t = raw.trim();
    if (!t) return {};
    try {
      const p = JSON.parse(t) as unknown;
      return asRecord(p) ?? {};
    } catch {
      return {};
    }
  }
  return asRecord(raw) ?? {};
}

function readMeta(d: Record<string, unknown>): {
  userId: string;
  telegramId: string;
  tier: string;
} {
  const meta = normalizeMetaObject(d.metadata);
  const cust = asRecord(d.customer) ?? {};
  const custMeta = normalizeMetaObject(cust.metadata);
  return {
    userId: String(meta.userId || custMeta.userId || ''),
    telegramId: String(meta.telegramId || custMeta.telegramId || ''),
    tier: String(meta.tier || custMeta.tier || ''),
  };
}

function collectPlanCodes(d: Record<string, unknown>): string[] {
  const out: string[] = [];
  const add = (c: unknown) => {
    if (typeof c === 'string' && c.trim().startsWith('PLN_')) {
      out.push(c.trim());
    }
  };
  add(d.plan_code);
  const plan = asRecord(d.plan);
  if (plan) add(plan.plan_code);
  const sub = asRecord(d.subscription);
  if (sub) {
    add(sub.plan_code);
    const sp = asRecord(sub.plan);
    if (sp) add(sp.plan_code);
  }
  return [...new Set(out)];
}

function tierFromPlanCodes(codes: string[]): 'api_pro' | 'bot_pro' | '' {
  const api = process.env.PAYSTACK_PLAN_API_PRO?.trim();
  const bot = process.env.PAYSTACK_PLAN_BOT_PRO?.trim();
  for (const c of codes) {
    if (api && c === api) return 'api_pro';
    if (bot && c === bot) return 'bot_pro';
  }
  return '';
}

function customerEmailFromData(d: Record<string, unknown>): string {
  const cust = asRecord(d.customer);
  const e = cust?.email;
  return typeof e === 'string' ? e.trim() : '';
}

async function findBetterAuthUserIdByEmail(
  email: string,
): Promise<string | null> {
  const db = mongoose.connection.db;
  if (!db || !email.trim()) return null;
  const safe = email.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const doc = await db
    .collection('user')
    .findOne(
      { email: new RegExp(`^${safe}$`, 'i') },
      { projection: { id: 1, _id: 1 } },
    );
  if (!doc) return null;
  const row = doc as { id?: string; _id?: unknown };
  if (typeof row.id === 'string' && row.id) return row.id;
  if (row._id != null) return String(row._id);
  return null;
}

function parseDate(v: unknown): Date | null {
  if (typeof v !== 'string') return null;
  const dt = new Date(v);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

const DEFAULT_PERIOD_MS = 30 * 24 * 60 * 60 * 1000;

function subscriptionPeriodEndFromData(d: Record<string, unknown>): Date {
  const now = Date.now();
  const fallback = new Date(now + DEFAULT_PERIOD_MS);
  const candidates: Date[] = [];
  const push = (v: unknown) => {
    const dt = parseDate(v);
    if (dt) candidates.push(dt);
  };
  push(d.next_payment_date);
  push(d.period_end);
  const sub = asRecord(d.subscription);
  if (sub) {
    push(sub.next_payment_date);
    push(sub.period_end);
  }
  for (const dt of candidates) {
    if (dt.getTime() > now) return dt;
  }
  return fallback;
}

function isLikelyBotCheckoutEmail(email: string): boolean {
  return /^tg\d+@/i.test(email.trim());
}

function webhookDataRoot(payload: unknown): Record<string, unknown> | null {
  if (!payload || typeof payload !== 'object') return null;
  const p = payload as Record<string, unknown>;
  const data = p.data;
  return asRecord(data);
}

export async function processPaystackWebhookPayload(
  payload: unknown,
): Promise<void> {
  const p =
    payload && typeof payload === 'object'
      ? (payload as Record<string, unknown>)
      : null;
  const event = String(p?.event ?? '');

  const d = webhookDataRoot(payload);
  if (!d) {
    logger.warn('Paystack webhook: missing or invalid data object', { event });
    return;
  }

  const {
    userId: metaUserId,
    telegramId: metaTg,
    tier: metaTier,
  } = readMeta(d);
  const planCodes = collectPlanCodes(d);
  const tierFromPlan = tierFromPlanCodes(planCodes);
  const effectiveTier =
    metaTier === 'api_pro' || metaTier === 'bot_pro' ? metaTier : tierFromPlan;

  const cust = asRecord(d.customer) ?? {};
  const subscriptionCode =
    typeof d.subscription_code === 'string' ? d.subscription_code : '';
  const subNested = asRecord(d.subscription);
  const subCodeFromNested =
    subNested && typeof subNested.subscription_code === 'string'
      ? subNested.subscription_code
      : '';
  const resolvedSubCode = subscriptionCode || subCodeFromNested;

  const customerCode =
    typeof cust.customer_code === 'string' ? cust.customer_code : '';
  const periodEnd = subscriptionPeriodEndFromData(d);

  const customerEmail = customerEmailFromData(d);
  const reference = typeof d.reference === 'string' ? d.reference : undefined;
  const dataKeys = Object.keys(d).sort();

  const envApiPlan = process.env.PAYSTACK_PLAN_API_PRO?.trim();
  const envBotPlan = process.env.PAYSTACK_PLAN_BOT_PRO?.trim();

  let resolvedUserId = '';
  if (
    effectiveTier === 'api_pro' &&
    customerEmail &&
    !isLikelyBotCheckoutEmail(customerEmail)
  ) {
    resolvedUserId = (await findBetterAuthUserIdByEmail(customerEmail)) ?? '';
    if (!resolvedUserId) {
      logger.warn('Paystack webhook: email lookup found no user', {
        event,
        customerEmail,
      });
    } else {
      logger.info('Paystack webhook: resolved userId from email', {
        event,
        userId: resolvedUserId,
      });
    }
  }
  if (!resolvedUserId && metaUserId) {
    resolvedUserId = metaUserId;
  }

  logger.info('Paystack webhook parsed', {
    event,
    effectiveTier: effectiveTier || '(none)',
    tierFromMeta: metaTier || undefined,
    tierFromPlanCodes: tierFromPlan || undefined,
    planCodes,
    expectedPlanCodes: { api: envApiPlan, bot: envBotPlan },
    reference,
    subscriptionCode: resolvedSubCode || undefined,
    customerCode: customerCode || undefined,
    customerEmail: customerEmail || undefined,
    metaUserId: metaUserId || undefined,
    resolvedUserId: resolvedUserId || undefined,
    telegramId: metaTg || undefined,
    periodEnd: periodEnd.toISOString(),
    dataKeys,
  });

  const maybeRecordApiProPayment = async () => {
    if (effectiveTier !== 'api_pro' || !resolvedUserId) return;
    if (event === 'invoice.update' || event === 'invoice.create') {
      const paid =
        d.paid === true ||
        d.paid === 1 ||
        String(d.status ?? '').toLowerCase() === 'success';
      if (!paid) return;
    } else if (event !== 'charge.success') {
      return;
    }
    try {
      await recordApiProPaymentFromWebhook({
        userId: resolvedUserId,
        event,
        d,
      });
    } catch (e) {
      logger.warn('ApiBillingPayment record failed', { message: String(e) });
    }
  };

  const maybeRecordBotProPayment = async () => {
    if (effectiveTier !== 'bot_pro' || !metaTg) return;
    if (event === 'invoice.update' || event === 'invoice.create') {
      const paid =
        d.paid === true ||
        d.paid === 1 ||
        String(d.status ?? '').toLowerCase() === 'success';
      if (!paid) return;
    } else if (event !== 'charge.success') {
      return;
    }
    try {
      await recordBotProPaymentFromWebhook({
        telegramId: metaTg,
        event,
        d,
      });
    } catch (e) {
      logger.warn('BotBillingPayment record failed', { message: String(e) });
    }
  };

  const activateApi = async () => {
    if (!resolvedUserId) {
      logger.warn('Paystack webhook: API Pro not activated (no user id)', {
        event,
        customerEmail: customerEmail || undefined,
        planCodes,
        expectedApiPlan: envApiPlan,
        metaTier: metaTier || undefined,
        hadMetaUserId: Boolean(metaUserId),
        effectiveTier,
      });
      return;
    }
    await ApiSubscriptionModel.findOneAndUpdate(
      { userId: resolvedUserId },
      {
        $set: {
          plan: 'pro_api',
          status: 'active',
          paystackSubscriptionCode: resolvedSubCode || undefined,
          paystackCustomerCode: customerCode || undefined,
          currentPeriodEnd: periodEnd,
        },
      },
      { upsert: true },
    );
    logger.info('Paystack activated API Pro', {
      userId: resolvedUserId,
      event,
    });
  };

  const activateBot = async () => {
    const tg = metaTg;
    if (!tg) {
      logger.warn('Paystack webhook: Bot Pro not activated (no telegramId)', {
        event,
        planCodes,
      });
      return;
    }
    await BotSubscriptionModel.findOneAndUpdate(
      { telegramId: tg },
      {
        $set: {
          plan: 'pro_bot',
          status: 'active',
          paystackSubscriptionCode: resolvedSubCode || undefined,
          currentPeriodEnd: periodEnd,
        },
      },
      { upsert: true },
    );
    logger.info('Paystack activated Bot Pro', { telegramId: tg, event });
  };

  const activationEvents = new Set([
    'subscription.create',
    'subscription.enable',
    'charge.success',
    'invoice.update',
    'invoice.create',
  ]);

  const runActivations = async (source: string) => {
    if (!effectiveTier) {
      if (activationEvents.has(event)) {
        logger.warn('Paystack webhook: activation skipped (no tier match)', {
          event,
          source,
          planCodes,
          expectedApiPlan: envApiPlan,
          expectedBotPlan: envBotPlan,
        });
      }
      return;
    }
    logger.info('Paystack webhook: running activations', {
      event,
      source,
      effectiveTier,
    });
    if (effectiveTier === 'api_pro') await activateApi();
    if (effectiveTier === 'bot_pro') await activateBot();
  };

  if (event === 'subscription.create' || event === 'subscription.enable') {
    await runActivations('subscription');
  }

  if (event === 'subscription.disable') {
    if (resolvedSubCode) {
      const [apiRes, botRes] = await Promise.all([
        ApiSubscriptionModel.updateMany(
          { paystackSubscriptionCode: resolvedSubCode },
          {
            $set: {
              plan: 'free',
              status: 'inactive',
              currentPeriodEnd: null,
            },
          },
        ),
        BotSubscriptionModel.updateMany(
          { paystackSubscriptionCode: resolvedSubCode },
          {
            $set: {
              plan: 'free',
              status: 'inactive',
              currentPeriodEnd: null,
            },
          },
        ),
      ]);
      logger.info('Paystack webhook: subscription disabled', {
        subscriptionCode: resolvedSubCode,
        apiModified: apiRes.modifiedCount,
        botModified: botRes.modifiedCount,
      });
    } else {
      logger.warn(
        'Paystack webhook: subscription.disable without subscription_code',
        {
          event,
          dataKeys,
        },
      );
    }
  }

  if (event === 'charge.success') {
    await runActivations('charge.success');
    await maybeRecordApiProPayment();
    await maybeRecordBotProPayment();
  }

  if (event === 'invoice.update' || event === 'invoice.create') {
    const paid =
      d.paid === true ||
      d.paid === 1 ||
      String(d.status ?? '').toLowerCase() === 'success';
    logger.info('Paystack webhook: invoice event', {
      event,
      paid,
      invoiceStatus: d.status,
      paidField: d.paid,
    });
    if (paid) {
      await runActivations(event);
      await maybeRecordApiProPayment();
      await maybeRecordBotProPayment();
    }
  }

  const handled = new Set([
    'subscription.create',
    'subscription.enable',
    'subscription.disable',
    'charge.success',
    'invoice.update',
    'invoice.create',
  ]);
  if (!handled.has(event)) {
    logger.debug('Paystack webhook: no specific handler (ack only)', { event });
  }
}
