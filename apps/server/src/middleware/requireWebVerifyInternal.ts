import { createHash, timingSafeEqual } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { logger } from '../utils/logger.js';

function hashUtf8(s: string): Buffer {
  return createHash('sha256').update(s, 'utf8').digest();
}

function constantTimeEqualStrings(a: string, b: string): boolean {
  const ha = hashUtf8(a);
  const hb = hashUtf8(b);
  return timingSafeEqual(ha, hb);
}

export function requireWebVerifyInternal(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const expected = process.env.WEB_VERIFY_INTERNAL_SECRET ?? '';
  if (!expected) {
    logger.warn(
      'WEB_VERIFY_INTERNAL_SECRET is not set; refusing public web verify',
    );
    res.status(503).json({
      ok: false,
      code: 'SERVICE_UNAVAILABLE',
      message: 'Service temporarily unavailable.',
    });
    return;
  }

  const provided = (req.header('x-web-verify-internal') ?? '').trim();
  if (!provided || !constantTimeEqualStrings(provided, expected)) {
    res.status(401).json({
      ok: false,
      code: 'UNAUTHORIZED',
      message: 'Unauthorized',
    });
    return;
  }

  next();
}
