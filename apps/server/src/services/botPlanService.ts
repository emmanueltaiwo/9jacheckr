import { BotSubscriptionModel } from '../models/botSubscriptionModel.js';
import { BotDailyUsageModel } from '../models/botDailyUsageModel.js';
import { BotTelegramUserModel } from '../models/botTelegramUserModel.js';
import { BOT_FREE_DAILY_LIMIT } from '../constants/billingConstants.js';

export type ResolvedBotPlan = 'free' | 'pro_bot';

export type BotStatusSnapshot = {
  plan: ResolvedBotPlan;
  /** Lookups completed today (UTC) — tracked for all users; only free tier is capped */
  dailyUsed: number;
  dailyLimit: number;
  /** All-time bot lookups recorded for this Telegram user */
  totalVerifyCount: number;
  /** ISO 8601 when Bot Pro is active; null if free or unknown */
  periodEnd: string | null;
};

/**
 * Plan, today’s usage (UTC), lifetime lookup count, and Pro billing window.
 */
export async function getBotStatusSnapshot(
  telegramId: string,
): Promise<BotStatusSnapshot> {
  const dateKey = currentUtcDayKey();
  const [sub, usageDoc, profile] = await Promise.all([
    BotSubscriptionModel.findOne({ telegramId }).lean(),
    BotDailyUsageModel.findOne({ telegramId, dateKey }).lean(),
    BotTelegramUserModel.findOne({ telegramId }).lean(),
  ]);

  let plan: ResolvedBotPlan = 'free';
  let periodEnd: string | null = null;
  if (sub?.plan === 'pro_bot' && sub.status === 'active') {
    const end = sub.currentPeriodEnd;
    if (!end || end >= new Date()) {
      plan = 'pro_bot';
      periodEnd = end ? end.toISOString() : null;
    }
  }

  const dailyUsed = usageDoc?.verifyCount ?? 0;
  const dailyLimit = BOT_FREE_DAILY_LIMIT;
  const totalVerifyCount = profile?.verifyCount ?? 0;

  return { plan, dailyUsed, dailyLimit, periodEnd, totalVerifyCount };
}

export async function resolveBotPlan(telegramId: string): Promise<ResolvedBotPlan> {
  const doc = await BotSubscriptionModel.findOne({ telegramId }).lean();
  if (!doc) return 'free';
  if (doc.plan !== 'pro_bot' || doc.status !== 'active') return 'free';
  if (doc.currentPeriodEnd && doc.currentPeriodEnd < new Date()) return 'free';
  return 'pro_bot';
}

export function currentUtcDayKey(): string {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export async function assertBotDailyQuotaAllows(
  telegramId: string,
): Promise<
  | { ok: true; plan: ResolvedBotPlan; used: number; limit: number }
  | { ok: false; plan: ResolvedBotPlan; used: number; limit: number }
> {
  const plan = await resolveBotPlan(telegramId);
  if (plan === 'pro_bot') {
    return { ok: true, plan, used: 0, limit: Number.MAX_SAFE_INTEGER };
  }
  const dateKey = currentUtcDayKey();
  const doc = await BotDailyUsageModel.findOne({ telegramId, dateKey }).lean();
  const used = doc?.verifyCount ?? 0;
  const limit = BOT_FREE_DAILY_LIMIT;
  if (used >= limit) {
    return { ok: false, plan, used, limit };
  }
  return { ok: true, plan, used, limit };
}

/** Counts every completed bot lookup per UTC day (for /status). Quota still enforced only for free tier. */
export async function incrementBotDailyVerify(telegramId: string): Promise<void> {
  const dateKey = currentUtcDayKey();
  await BotDailyUsageModel.findOneAndUpdate(
    { telegramId, dateKey },
    { $inc: { verifyCount: 1 }, $setOnInsert: { telegramId, dateKey } },
    { upsert: true },
  );
}
