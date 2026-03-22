import { BotTelegramUserModel } from '../models/botTelegramUserModel.js';
import { BotUsageMonthlyModel } from '../models/botUsageMonthlyModel.js';
import type { BotTelegramPayload, VerifyOutcome } from '../types/types.js';

export function formatYearMonthUtc(d = new Date()): string {
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + 1;
  return `${y}-${String(m).padStart(2, '0')}`;
}

export async function recordBotStart(payload: BotTelegramPayload) {
  const now = new Date();
  const profile: Record<string, string> = {};
  if (payload.username !== undefined) profile.username = payload.username;
  if (payload.firstName !== undefined) profile.firstName = payload.firstName;
  if (payload.lastName !== undefined) profile.lastName = payload.lastName;

  await BotTelegramUserModel.findOneAndUpdate(
    { telegramId: payload.id },
    {
      $set: { ...profile, lastActiveAt: now },
      $inc: { startsCount: 1 },
      $setOnInsert: {
        telegramId: payload.id,
        firstSeenAt: now,
        verifyCount: 0,
      },
    },
    { upsert: true, returnDocument: 'after' },
  );
}

export async function recordBotVerifyMetrics(
  telegram: BotTelegramPayload | undefined,
  outcome: VerifyOutcome,
  yearMonth: string = formatYearMonthUtc(),
) {
  const inc: Record<string, number> = { total: 1 };
  if (outcome === 'found') inc.found = 1;
  else if (outcome === 'not_found') inc.notFound = 1;
  else inc.failed = 1;

  await BotUsageMonthlyModel.findOneAndUpdate(
    { yearMonth },
    {
      $inc: inc,
      $setOnInsert: { yearMonth },
    },
    { upsert: true, returnDocument: 'after' },
  );

  if (!telegram?.id) return;

  const now = new Date();
  const profile: Record<string, string> = {};
  if (telegram.username !== undefined) profile.username = telegram.username;
  if (telegram.firstName !== undefined) profile.firstName = telegram.firstName;
  if (telegram.lastName !== undefined) profile.lastName = telegram.lastName;

  await BotTelegramUserModel.findOneAndUpdate(
    { telegramId: telegram.id },
    {
      $set: { ...profile, lastActiveAt: now },
      $inc: { verifyCount: 1 },
      $setOnInsert: {
        telegramId: telegram.id,
        firstSeenAt: now,
        startsCount: 0,
      },
    },
    { upsert: true, returnDocument: 'after' },
  );
}
