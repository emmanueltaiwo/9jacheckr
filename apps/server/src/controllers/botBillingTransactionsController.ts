import type { Request, Response } from 'express';
import { listTelegramBotBillingPayments } from '../services/botBillingPaymentService.js';

export async function botBillingTransactionsController(
  req: Request,
  res: Response,
) {
  const telegramId = String(
    (req.body as { telegramId?: string })?.telegramId ?? '',
  ).trim();
  if (!telegramId) {
    res.status(400).json({ ok: false, message: 'telegramId is required.' });
    return;
  }

  const body = (req.body ?? {}) as { page?: unknown; perPage?: unknown };
  const pageRaw = body.page;
  const perPageRaw = body.perPage;
  const page =
    typeof pageRaw === 'number' && Number.isFinite(pageRaw)
      ? Math.floor(pageRaw)
      : 1;
  const perPage =
    typeof perPageRaw === 'number' && Number.isFinite(perPageRaw)
      ? Math.floor(perPageRaw)
      : 20;

  try {
    const { transactions, meta } = await listTelegramBotBillingPayments({
      telegramId,
      page,
      perPage,
    });
    res.json({ ok: true, transactions, meta });
  } catch {
    res.status(500).json({ ok: false, message: 'Could not load payments.' });
  }
}
