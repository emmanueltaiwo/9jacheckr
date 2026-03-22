import { UserApiUsageModel } from '../models/userApiUsageModel.js';

export type UserVerifyOutcome = 'found' | 'not_found' | 'error';

export async function recordUserApiVerify(
  userId: string,
  outcome: UserVerifyOutcome,
) {
  const now = new Date();
  const inc: Record<string, number> = {
    totalVerifications: 1,
  };
  if (outcome === 'found') inc.foundCount = 1;
  else if (outcome === 'not_found') inc.notFoundCount = 1;
  else inc.errorCount = 1;

  await UserApiUsageModel.findOneAndUpdate(
    { userId },
    {
      $inc: inc,
      $set: { lastVerifyAt: now },
      $setOnInsert: { userId },
    },
    { upsert: true, returnDocument: 'after' },
  );
}

export async function recordUserApiSearch(userId: string) {
  const now = new Date();
  await UserApiUsageModel.findOneAndUpdate(
    { userId },
    {
      $inc: { searchCount: 1 },
      $set: { lastSearchAt: now },
      $setOnInsert: { userId },
    },
    { upsert: true, returnDocument: 'after' },
  );
}

export async function getUsageForUser(userId: string) {
  const doc = await UserApiUsageModel.findOne({ userId }).lean();
  if (!doc) {
    return {
      totalVerifications: 0,
      foundCount: 0,
      notFoundCount: 0,
      errorCount: 0,
      lastVerifyAt: null as Date | null,
      searchCount: 0,
      lastSearchAt: null as Date | null,
    };
  }
  return {
    totalVerifications: doc.totalVerifications ?? 0,
    foundCount: doc.foundCount ?? 0,
    notFoundCount: doc.notFoundCount ?? 0,
    errorCount: doc.errorCount ?? 0,
    lastVerifyAt: doc.lastVerifyAt ?? null,
    searchCount: doc.searchCount ?? 0,
    lastSearchAt: doc.lastSearchAt ?? null,
  };
}
