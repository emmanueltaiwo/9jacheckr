import crypto from 'crypto';
import { ApiKeyModel } from '../models/apiKeyModel.js';
import { resolveApiPlan } from './apiPlanService.js';
import { PRO_MAX_API_KEYS } from '../constants/billingConstants.js';

function requireApiKeySecret(): string {
  const secret = process.env.API_KEY_SECRET ?? '';
  if (!secret) throw new Error('API_KEY_SECRET is required');
  return secret;
}

function hmacKeyHash(rawKey: string): string {
  return crypto
    .createHmac('sha256', requireApiKeySecret())
    .update(rawKey)
    .digest('hex');
}

function legacySha256(rawKey: string): string {
  return crypto.createHash('sha256').update(rawKey).digest('hex');
}

function timingSafeEqualHex(a: string, b: string): boolean {
  try {
    const ba = Buffer.from(a, 'hex');
    const bb = Buffer.from(b, 'hex');
    if (ba.length !== bb.length) return false;
    return crypto.timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}

function newRawKeyMaterial() {
  const rawKey = `njc_${crypto.randomBytes(24).toString('hex')}`;
  const keyPrefix = rawKey.slice(0, 12);
  const keyHash = hmacKeyHash(rawKey);
  return { rawKey, keyPrefix, keyHash };
}

/** Mongoose doc returned from ApiKeyModel.findOne — used after successful auth. */
export type ApiKeyAuthDocument = {
  _id: unknown;
  userId: string;
  revokedAt: Date | null;
  lastUsedAt: Date | null;
  save(): Promise<unknown>;
};

export type ApiKeyAuthResult =
  | { ok: true; key: ApiKeyAuthDocument }
  | { ok: false; reason: 'invalid' | 'plan_blocked' };

/**
 * Oldest non-revoked key for the user — same “primary” as the dashboard.
 */
export async function getOldestActiveApiKeyId(
  userId: string,
): Promise<string | null> {
  const row = await ApiKeyModel.findOne({ userId, revokedAt: null })
    .sort({ createdAt: 1 })
    .select('_id')
    .lean();
  return row?._id != null ? String(row._id) : null;
}

/** Pro: any active key. Free: only the primary (oldest) may be used for API calls or dashboard rotate/revoke. */
export async function isApiKeyPermittedForCurrentPlan(
  userId: string,
  keyId: string,
): Promise<boolean> {
  const plan = await resolveApiPlan(userId);
  if (plan === 'pro_api') return true;
  const primaryId = await getOldestActiveApiKeyId(userId);
  return primaryId != null && keyId === primaryId;
}

function throwKeyPlanDisabled(): never {
  const e = new Error('KEY_PLAN_DISABLED');
  (e as Error & { code: string }).code = 'KEY_PLAN_DISABLED';
  throw e;
}

/** Resolve key by raw secret; on Free plan only the primary (oldest) key is accepted for API calls. */
export async function authenticateApiKeyForProductApi(
  rawKey: string,
): Promise<ApiKeyAuthResult> {
  const keyPrefix = rawKey.slice(0, 12);
  const hmac = hmacKeyHash(rawKey);
  const legacy = legacySha256(rawKey);

  const doc = await ApiKeyModel.findOne({ keyPrefix });
  if (!doc || doc.revokedAt) return { ok: false, reason: 'invalid' };

  if (
    !timingSafeEqualHex(doc.keyHash, hmac) &&
    !timingSafeEqualHex(doc.keyHash, legacy)
  ) {
    return { ok: false, reason: 'invalid' };
  }

  const permitted = await isApiKeyPermittedForCurrentPlan(
    doc.userId,
    String(doc._id),
  );
  if (!permitted) return { ok: false, reason: 'plan_blocked' };

  return { ok: true, key: doc as unknown as ApiKeyAuthDocument };
}

export async function listActiveApiKeysForUser(userId: string) {
  return ApiKeyModel.find({ userId, revokedAt: null })
    .sort({ createdAt: 1 })
    .lean();
}

export async function getApiKeyForUser(userId: string) {
  return ApiKeyModel.findOne({ userId, revokedAt: null }).sort({
    createdAt: 1,
  });
}

export async function createOrRotatePrimaryApiKey(userId: string) {
  const { rawKey, keyPrefix, keyHash } = newRawKeyMaterial();
  let doc = await ApiKeyModel.findOne({ userId, revokedAt: null }).sort({
    createdAt: 1,
  });
  if (doc) {
    doc.keyHash = keyHash;
    doc.keyPrefix = keyPrefix;
    await doc.save();
  } else {
    doc = await ApiKeyModel.create({
      userId,
      keyPrefix,
      keyHash,
      label: 'default',
    });
  }
  return { doc, rawKey };
}

export async function createAdditionalApiKey(userId: string, label?: string) {
  const plan = await resolveApiPlan(userId);
  if (plan !== 'pro_api') {
    const e = new Error('PRO_REQUIRED');
    (e as Error & { code: string }).code = 'PRO_REQUIRED';
    throw e;
  }
  const n = await ApiKeyModel.countDocuments({ userId, revokedAt: null });
  if (n >= PRO_MAX_API_KEYS) {
    const e = new Error('KEY_LIMIT');
    (e as Error & { code: string }).code = 'KEY_LIMIT';
    throw e;
  }
  const { rawKey, keyPrefix, keyHash } = newRawKeyMaterial();
  const doc = await ApiKeyModel.create({
    userId,
    keyPrefix,
    keyHash,
    label: label?.trim() || `Key ${n + 1}`,
  });
  return { doc, rawKey };
}

export async function rotateApiKeyById(userId: string, keyId: string) {
  const doc = await ApiKeyModel.findOne({
    _id: keyId,
    userId,
    revokedAt: null,
  });
  if (!doc) return null;
  if (!(await isApiKeyPermittedForCurrentPlan(userId, keyId))) {
    throwKeyPlanDisabled();
  }
  const { rawKey, keyPrefix, keyHash } = newRawKeyMaterial();
  doc.keyHash = keyHash;
  doc.keyPrefix = keyPrefix;
  await doc.save();
  return { doc, rawKey };
}

export async function revokeApiKeyById(userId: string, keyId: string) {
  const existing = await ApiKeyModel.findOne({
    _id: keyId,
    userId,
    revokedAt: null,
  });
  if (!existing) return null;
  if (!(await isApiKeyPermittedForCurrentPlan(userId, keyId))) {
    throwKeyPlanDisabled();
  }
  return ApiKeyModel.findOneAndUpdate(
    { _id: keyId, userId, revokedAt: null },
    { $set: { revokedAt: new Date() } },
    { returnDocument: 'after' },
  );
}

export async function revokeAllApiKeysForUser(userId: string) {
  await ApiKeyModel.updateMany(
    { userId, revokedAt: null },
    { $set: { revokedAt: new Date() } },
  );
}

const LABEL_MAX = 64;

export async function updateApiKeyLabel(
  userId: string,
  keyId: string,
  rawLabel: string,
) {
  const label = rawLabel.trim().slice(0, LABEL_MAX);
  const doc = await ApiKeyModel.findOne({
    _id: keyId,
    userId,
    revokedAt: null,
  });
  if (!doc) return null;
  doc.label = label;
  await doc.save();
  return doc;
}
