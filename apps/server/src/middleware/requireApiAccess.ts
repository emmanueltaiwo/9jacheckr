import type { NextFunction, Request, Response } from 'express';
import { findApiKeyByRaw } from '../services/apiKeyService.js';

export async function requireApiAccess(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const path = (req.originalUrl ?? req.url ?? '').split('?')[0];
  if (
    path.startsWith('/api/keys') ||
    path.startsWith('/api/metrics') ||
    path.startsWith('/api/bot')
  ) {
    next();
    return;
  }

  const internalToken = req.header('x-internal-bot-token');
  const expected = process.env.BOT_INTERNAL_TOKEN ?? '';
  if (expected && internalToken === expected) {
    req.authContext = { source: 'bot' };
    const tid = req.header('x-telegram-user-id')?.trim();
    if (tid) {
      req.botTelegram = {
        id: tid,
        username: req.header('x-telegram-username')?.trim() || undefined,
        firstName: req.header('x-telegram-first-name')?.trim() || undefined,
        lastName: req.header('x-telegram-last-name')?.trim() || undefined,
      };
    }
    next();
    return;
  }

  const rawApiKey = (req.header('x-api-key') ?? '').trim();
  if (!rawApiKey) {
    res.status(401).json({
      ok: false,
      code: 'MISSING_API_KEY',
      message: 'Provide x-api-key to use this endpoint',
    });
    return;
  }

  const key = await findApiKeyByRaw(rawApiKey);
  if (!key || key.revokedAt) {
    res.status(401).json({
      ok: false,
      code: 'INVALID_API_KEY',
      message: 'Invalid API key',
    });
    return;
  }

  key.lastUsedAt = new Date();
  await key.save();

  req.authContext = { source: 'api_key', userId: key.userId };

  next();
}
