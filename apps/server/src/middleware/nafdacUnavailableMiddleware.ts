import type { NextFunction, Request, Response } from 'express';
import {
  isNafdacUnavailable,
  NAFDAC_UNAVAILABLE_MESSAGE,
} from '../config/nafdacAvailability.js';

export function nafdacUnavailableMiddleware(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!isNafdacUnavailable()) {
    next();
    return;
  }
  res.status(503).json({
    ok: false,
    code: 'NAFDAC_UNAVAILABLE',
    message: NAFDAC_UNAVAILABLE_MESSAGE,
  });
}
