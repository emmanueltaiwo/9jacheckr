import { ErrorRequestHandler } from 'express';
import type { VerifyApiErrorBody } from '../types/productTypes.js';
import { logger } from '../utils/logger.js';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  logger.error('Unhandled error', {
    message: err instanceof Error ? err.message : String(err),
  });
  const body: VerifyApiErrorBody = {
    ok: false,
    code: 'INTERNAL_ERROR',
    message: 'Something went wrong',
  };
  res.status(500).json(body);
};
