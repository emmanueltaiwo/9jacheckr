import rateLimit from 'express-rate-limit';
import type { Request } from 'express';

function key(req: Request): string {
  const tg = req.header('x-telegram-user-id')?.trim() ?? '';
  const ip = req.ip ?? 'unknown';
  return tg ? `bot-verify-img:${tg}` : `bot-verify-img:${ip}`;
}

export const botVerifyImageRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 40,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  keyGenerator: (req) => key(req),
  message: {
    ok: false,
    code: 'RATE_LIMITED',
    message: 'Too many image verifications.',
  },
});
