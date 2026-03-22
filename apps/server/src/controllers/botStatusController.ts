import type { Request, Response } from 'express';
import { getBotStatusSnapshot } from '../services/botPlanService.js';

export async function botStatusController(req: Request, res: Response) {
  const telegramId = String(
    (req.body as { telegramId?: string })?.telegramId ?? '',
  ).trim();
  if (!telegramId) {
    res.status(400).json({ ok: false, message: 'telegramId is required.' });
    return;
  }

  try {
    const snapshot = await getBotStatusSnapshot(telegramId);
    res.json({ ok: true, ...snapshot });
  } catch {
    res.status(500).json({ ok: false, message: 'Could not load status.' });
  }
}
