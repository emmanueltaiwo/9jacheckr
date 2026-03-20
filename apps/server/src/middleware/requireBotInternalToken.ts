import type { NextFunction, Request, Response } from 'express';

export function requireBotInternalToken(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.header('x-internal-bot-token');
  const expected = process.env.BOT_INTERNAL_TOKEN ?? '';

  if (!expected || token !== expected) {
    res.status(401).json({
      ok: false,
      code: 'UNAUTHORIZED',
      message: 'Invalid bot token',
    });
    return;
  }

  next();
}
