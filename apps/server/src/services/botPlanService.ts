import { BotSubscriptionModel } from '../models/botSubscriptionModel.js';
import { BotDailyUsageModel } from '../models/botDailyUsageModel.js';
import { BotTelegramUserModel } from '../models/botTelegramUserModel.js';
import { BOT_FREE_DAILY_LIMIT } from '../constants/billingConstants.js';

export type ResolvedBotPlan = 'free' | 'pro_bot';

export type BotStatusSnapshot = {
  plan: ResolvedBotPlan;
  /** Lookups completed today (UTC) — tracked for all users; only free tier is capped */
  dailyUsed: number;
  /** Today (UTC): /verify-style text lookups */
  dailyTextUsed: number;
  /** Today (UTC): photo verify lookups */
  dailyImageUsed: number;
  dailyLimit: number;
  /** All-time bot lookups recorded for this Telegram user */
  totalVerifyCount: number;
  /** ISO 8601 when Bot Pro is active; null if free or unknown */
  periodEnd: string | null;
};

async function syncExpiredBotProToFree(
  telegramId: string,
  now: Date,
): Promise<void> {
  await BotSubscriptionModel.updateOne(
    {
      telegramId,
      plan: 'pro_bot',
      status: 'active',
      currentPeriodEnd: { $lt: now },
    },
    {
      $set: {
        plan: 'free',
        status: 'inactive',
        currentPeriodEnd: null,
      },
    },
  );
}

/**
 * Plan, today’s usage (UTC), lifetime lookup count, and Pro billing window.
 */
export async function getBotStatusSnapshot(
  telegramId: string,
): Promise<BotStatusSnapshot> {
  const now = new Date();
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
    if (end && end < now) {
      await syncExpiredBotProToFree(telegramId, now);
    } else if (!end || end >= now) {
      plan = 'pro_bot';
      periodEnd = end ? end.toISOString() : null;
    }
  }

  const verifyCount = usageDoc?.verifyCount ?? 0;
  const text = usageDoc?.textVerifyCount ?? 0;
  const image = usageDoc?.imageVerifyCount ?? 0;
  const unattributed = Math.max(0, verifyCount - text - image);
  const dailyUsed = verifyCount;
  const dailyTextUsed = text + unattributed;
  const dailyImageUsed = image;
  const dailyLimit = BOT_FREE_DAILY_LIMIT;
  const totalVerifyCount = profile?.verifyCount ?? 0;

  return {
    plan,
    dailyUsed,
    dailyTextUsed,
    dailyImageUsed,
    dailyLimit,
    periodEnd,
    totalVerifyCount,
  };
}

export async function resolveBotPlan(
  telegramId: string,
): Promise<ResolvedBotPlan> {
  const now = new Date();
  const doc = await BotSubscriptionModel.findOne({ telegramId }).lean();
  if (!doc) return 'free';
  if (doc.plan !== 'pro_bot' || doc.status !== 'active') return 'free';
  if (doc.currentPeriodEnd && doc.currentPeriodEnd < now) {
    await syncExpiredBotProToFree(telegramId, now);
    return 'free';
  }
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

export type BotDailyVerifyChannel = 'text' | 'image';

/** Counts every completed bot lookup per UTC day (for /status). Quota still enforced only for free tier. */
export async function incrementBotDailyVerify(
  telegramId: string,
  channel: BotDailyVerifyChannel,
): Promise<void> {
  const dateKey = currentUtcDayKey();
  const inc =
    channel === 'image'
      ? { verifyCount: 1, imageVerifyCount: 1 }
      : { verifyCount: 1, textVerifyCount: 1 };
  await BotDailyUsageModel.findOneAndUpdate(
    { telegramId, dateKey },
    { $inc: inc, $setOnInsert: { telegramId, dateKey } },
    { upsert: true },
  );
}
