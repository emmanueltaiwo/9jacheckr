import type { Request, Response } from 'express';
import {
  createOrRotateApiKey,
  getApiKeyForUser,
  revokeApiKey,
} from '../services/apiKeyService.js';

export async function getMyApiKey(req: Request, res: Response) {
  const userId = req.authUser!.id;
  const doc = await getApiKeyForUser(userId);
  if (!doc || doc.revokedAt) {
    res.status(200).json({ ok: true, apiKey: null });
    return;
  }
  res.status(200).json({
    ok: true,
    apiKey: {
      keyPrefix: doc.keyPrefix,
      lastUsedAt: doc.lastUsedAt,
      createdAt: doc.createdAt,
    },
  });
}

export async function createMyApiKey(req: Request, res: Response) {
  const userId = req.authUser!.id;
  const { doc, rawKey } = await createOrRotateApiKey(userId);
  res.status(200).json({
    ok: true,
    rawKey,
    apiKey: {
      keyPrefix: doc.keyPrefix,
      lastUsedAt: doc.lastUsedAt,
      createdAt: doc.createdAt,
    },
  });
}

export async function revokeMyApiKey(req: Request, res: Response) {
  const userId = req.authUser!.id;
  const doc = await revokeApiKey(userId);
  if (!doc) {
    res.status(404).json({
      ok: false,
      code: 'NOT_FOUND',
      message: 'No API key for this user',
    });
    return;
  }
  res.status(200).json({ ok: true, revokedAt: doc.revokedAt });
}
