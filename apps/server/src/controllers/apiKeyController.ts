import type { Request, Response } from 'express';
import { maskApiKeyPrefix } from '../utils/maskApiKeyPrefix.js';
import {
  createOrRotateApiKey,
  getApiKeyForUser,
  revokeApiKey,
} from '../services/apiKeyService.js';

export async function getMyApiKeyController(req: Request, res: Response) {
  const userId = req.authUser?.id;
  if (!userId) {
    res.status(401).json({
      ok: false,
      code: 'UNAUTHORIZED',
      message: 'Sign in required',
    });
    return;
  }

  const doc = await getApiKeyForUser(userId);
  if (!doc || doc.revokedAt) {
    res.json({ ok: true, key: null });
    return;
  }

  res.json({
    ok: true,
    key: {
      id: String(doc._id),
      keyPrefix: doc.keyPrefix,
      maskedKey: maskApiKeyPrefix(doc.keyPrefix),
      lastUsedAt: doc.lastUsedAt ? doc.lastUsedAt.toISOString() : null,
    },
  });
}

export async function createApiKeyController(req: Request, res: Response) {
  const userId = req.authUser?.id;
  if (!userId) {
    res.status(401).json({
      ok: false,
      code: 'UNAUTHORIZED',
      message: 'Sign in required',
    });
    return;
  }

  const { doc, rawKey } = await createOrRotateApiKey(userId);

  res.json({
    ok: true,
    key: {
      id: String(doc._id),
      rawKey,
      keyPrefix: doc.keyPrefix,
      maskedKey: maskApiKeyPrefix(doc.keyPrefix),
      lastUsedAt: doc.lastUsedAt ? doc.lastUsedAt.toISOString() : null,
    },
  });
}

export async function revokeApiKeyController(req: Request, res: Response) {
  const userId = req.authUser?.id;
  if (!userId) {
    res.status(401).json({
      ok: false,
      code: 'UNAUTHORIZED',
      message: 'Sign in required',
    });
    return;
  }

  await revokeApiKey(userId);
  res.json({ ok: true });
}
