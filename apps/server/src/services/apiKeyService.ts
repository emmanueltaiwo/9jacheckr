import crypto from 'crypto';
import { ApiKeyModel } from '../models/apiKeyModel.js';

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

export async function findApiKeyByRaw(rawKey: string) {
  const keyPrefix = rawKey.slice(0, 12);
  const hmac = hmacKeyHash(rawKey);
  const legacy = legacySha256(rawKey);

  const doc = await ApiKeyModel.findOne({ keyPrefix });
  if (!doc || doc.revokedAt) return null;

  if (
    timingSafeEqualHex(doc.keyHash, hmac) ||
    timingSafeEqualHex(doc.keyHash, legacy)
  ) {
    return doc;
  }

  return null;
}

export async function getApiKeyForUser(userId: string) {
  return ApiKeyModel.findOne({ userId });
}

export async function createOrRotateApiKey(userId: string) {
  const rawKey = `njc_${crypto.randomBytes(24).toString('hex')}`;
  const keyPrefix = rawKey.slice(0, 12);
  const keyHash = hmacKeyHash(rawKey);

  const doc = await ApiKeyModel.findOneAndUpdate(
    { userId },
    {
      $set: {
        keyHash,
        keyPrefix,
        revokedAt: null,
      },
      $setOnInsert: { userId },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  return { doc, rawKey };
}

export async function revokeApiKey(userId: string) {
  const doc = await ApiKeyModel.findOneAndUpdate(
    { userId },
    { $set: { revokedAt: new Date() } },
    { new: true },
  );
  return doc;
}
