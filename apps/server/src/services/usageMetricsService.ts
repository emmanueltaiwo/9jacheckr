import { UsageMonthlyModel } from '../models/usageMonthlyModel.js';

export type VerifyOutcome = 'found' | 'not_found' | 'failed';

export function formatYearMonthUtc(d = new Date()): string {
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + 1;
  return `${y}-${String(m).padStart(2, '0')}`;
}

export function parseYearMonthParam(value: string | undefined): string | null {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) return null;
  const [y, mo] = value.split('-').map(Number);
  if (mo < 1 || mo > 12) return null;
  return `${y}-${String(mo).padStart(2, '0')}`;
}

export async function recordVerifyOutcome(
  userId: string,
  outcome: VerifyOutcome,
  yearMonth: string = formatYearMonthUtc(),
) {
  const inc: Record<string, number> = { total: 1 };
  if (outcome === 'found') inc.found = 1;
  else if (outcome === 'not_found') inc.notFound = 1;
  else inc.failed = 1;

  await UsageMonthlyModel.findOneAndUpdate(
    { userId, yearMonth },
    {
      $inc: inc,
      $setOnInsert: { userId, yearMonth },
    },
    { upsert: true, new: true },
  );
}

export async function getMonthlyMetricsForUser(
  userId: string,
  yearMonth: string,
) {
  const doc = await UsageMonthlyModel.findOne({ userId, yearMonth }).lean();
  return {
    total: doc?.total ?? 0,
    found: doc?.found ?? 0,
    notFound: doc?.notFound ?? 0,
    failed: doc?.failed ?? 0,
  };
}
