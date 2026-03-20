import type { Request, Response } from 'express';
import { recordBotStart } from '../services/botMetricsService.js';

export async function postBotActivityController(req: Request, res: Response) {
  const body = req.body as {
    event?: string;
    telegramId?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
  };

  if (body.event !== 'start' || !body.telegramId?.trim()) {
    res.status(400).json({
      ok: false,
      code: 'INVALID_BODY',
      message: 'event=start and telegramId required',
    });
    return;
  }

  await recordBotStart({
    id: body.telegramId.trim(),
    username: body.username?.trim() || undefined,
    firstName: body.firstName?.trim() || undefined,
    lastName: body.lastName?.trim() || undefined,
  });

  res.json({ ok: true });
}
