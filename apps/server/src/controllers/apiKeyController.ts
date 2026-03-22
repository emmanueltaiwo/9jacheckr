import type { Request, Response } from 'express';
import {
  createAdditionalApiKey,
  createOrRotatePrimaryApiKey,
  listActiveApiKeysForUser,
  revokeAllApiKeysForUser,
  revokeApiKeyById,
  rotateApiKeyById,
  updateApiKeyLabel,
} from '../services/apiKeyService.js';
import { resolveApiPlan } from '../services/apiPlanService.js';

function serializeKey(
  doc: {
    _id: unknown;
    keyPrefix: string;
    label?: string;
    lastUsedAt: Date | null;
    createdAt?: Date;
  },
  isPrimary: boolean,
) {
  return {
    id: String(doc._id),
    keyPrefix: doc.keyPrefix,
    label: doc.label ?? '',
    isPrimary,
    lastUsedAt: doc.lastUsedAt,
    createdAt: doc.createdAt ?? new Date(),
  };
}

export async function getMyApiKey(req: Request, res: Response) {
  const userId = req.authUser!.id;
  const keys = await listActiveApiKeysForUser(userId);
  const primaryId = keys[0] ? String(keys[0]._id) : '';
  const first = keys[0];
  res.status(200).json({
    ok: true,
    apiKey: first
      ? serializeKey(first, primaryId === String(first._id))
      : null,
    keys: keys.map((k) => serializeKey(k, primaryId === String(k._id))),
  });
}

type CreateBody = { additional?: boolean; rotateKeyId?: string; label?: string };

export async function createMyApiKey(req: Request, res: Response) {
  const userId = req.authUser!.id;
  const body = (req.body ?? {}) as CreateBody;

  try {
    if (body.rotateKeyId?.trim()) {
      const rotated = await rotateApiKeyById(userId, body.rotateKeyId.trim());
      if (!rotated) {
        res.status(404).json({
          ok: false,
          code: 'NOT_FOUND',
          message: 'Key not found.',
        });
        return;
      }
      const keys = await listActiveApiKeysForUser(userId);
      const pid = keys[0] ? String(keys[0]._id) : '';
      res.status(200).json({
        ok: true,
        rawKey: rotated.rawKey,
        apiKey: serializeKey(rotated.doc, pid === String(rotated.doc._id)),
        keys: keys.map((k) => serializeKey(k, pid === String(k._id))),
      });
      return;
    }

    if (body.additional) {
      const plan = await resolveApiPlan(userId);
      if (plan !== 'pro_api') {
        res.status(403).json({
          ok: false,
          code: 'FEATURE_REQUIRES_PRO',
          message: 'Multiple API keys require API Pro.',
        });
        return;
      }
      const { doc, rawKey } = await createAdditionalApiKey(
        userId,
        body.label,
      );
      const keys = await listActiveApiKeysForUser(userId);
      const pid = keys[0] ? String(keys[0]._id) : '';
      res.status(200).json({
        ok: true,
        rawKey,
        apiKey: serializeKey(doc, pid === String(doc._id)),
        keys: keys.map((k) => serializeKey(k, pid === String(k._id))),
      });
      return;
    }

    const { doc, rawKey } = await createOrRotatePrimaryApiKey(userId);
    const keys = await listActiveApiKeysForUser(userId);
    const pid = keys[0] ? String(keys[0]._id) : '';
    res.status(200).json({
      ok: true,
      rawKey,
      apiKey: serializeKey(doc, pid === String(doc._id)),
      keys: keys.map((k) => serializeKey(k, pid === String(k._id))),
    });
  } catch (e) {
    const code = (e as Error & { code?: string }).code;
    if (code === 'KEY_LIMIT') {
      res.status(400).json({
        ok: false,
        code: 'KEY_LIMIT',
        message: 'Maximum number of API keys reached.',
      });
      return;
    }
    throw e;
  }
}

export async function revokeMyApiKey(req: Request, res: Response) {
  const userId = req.authUser!.id;
  await revokeAllApiKeysForUser(userId);
  res.status(200).json({ ok: true, revoked: true });
}

export async function revokeOneApiKey(req: Request, res: Response) {
  const userId = req.authUser!.id;
  const raw = req.params.keyId;
  const keyId = (Array.isArray(raw) ? raw[0] : raw)?.trim();
  if (!keyId) {
    res.status(400).json({
      ok: false,
      code: 'INVALID_PARAMS',
      message: 'keyId required',
    });
    return;
  }
  const doc = await revokeApiKeyById(userId, keyId);
  if (!doc) {
    res.status(404).json({
      ok: false,
      code: 'NOT_FOUND',
      message: 'Key not found.',
    });
    return;
  }
  res.status(200).json({ ok: true, revokedAt: doc.revokedAt });
}

type PatchLabelBody = { label?: string };

export async function patchApiKeyLabel(req: Request, res: Response) {
  const userId = req.authUser!.id;
  const plan = await resolveApiPlan(userId);
  if (plan !== 'pro_api') {
    res.status(403).json({
      ok: false,
      code: 'FEATURE_REQUIRES_PRO',
      message: 'Renaming API keys requires API Pro.',
    });
    return;
  }
  const raw = req.params.keyId;
  const keyId = (Array.isArray(raw) ? raw[0] : raw)?.trim();
  if (!keyId) {
    res.status(400).json({
      ok: false,
      code: 'INVALID_PARAMS',
      message: 'keyId required',
    });
    return;
  }
  const body = (req.body ?? {}) as PatchLabelBody;
  const label = typeof body.label === 'string' ? body.label : '';
  const doc = await updateApiKeyLabel(userId, keyId, label);
  if (!doc) {
    res.status(404).json({
      ok: false,
      code: 'NOT_FOUND',
      message: 'Key not found.',
    });
    return;
  }
  const keys = await listActiveApiKeysForUser(userId);
  const primaryId = keys[0] ? String(keys[0]._id) : '';
  const first = keys[0];
  res.status(200).json({
    ok: true,
    apiKey: first
      ? serializeKey(first, primaryId === String(first._id))
      : null,
    keys: keys.map((k) => serializeKey(k, primaryId === String(k._id))),
  });
}
