import { rateLimit } from 'express-rate-limit';

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  limit: 60,

  standardHeaders: 'draft-8',

  legacyHeaders: false,

  message: {
    ok: false,
    code: 'RATE_LIMITED',
    message: 'Too many requests. Please wait a moment and try again.',
  },
});
