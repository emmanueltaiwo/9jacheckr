import { rateLimit } from 'express-rate-limit';

export const apiRateLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,

  limit: Number(process.env.RATE_LIMIT_MAX) || 60,

  standardHeaders: 'draft-8',

  legacyHeaders: false,

  message: {
    ok: false,
    code: 'RATE_LIMITED',
    message: 'Too many requests. Please wait a moment and try again.',
  },
});
