import { BotBillingPaymentModel } from '../models/botBillingPaymentModel.js';
import { logger } from '../utils/logger.js';
import {
  pickAmount,
  pickChannel,
  pickCurrency,
  pickDescription,
  pickPaidAt,
  pickReference,
} from './apiBillingPaymentService.js';
import type { BillingPaymentRow } from './apiBillingPaymentService.js';

export async function recordBotProPaymentFromWebhook(params: {
  telegramId: string;
  event: string;
  d: Record<string, unknown>;
}): Promise<void> {
  const ref = pickReference(params.d);
  if (!ref) {
    logger.debug('BotBillingPayment: skip (no reference)', {
      event: params.event,
    });
    return;
  }
  const amount = pickAmount(params.d);
  if (amount == null) {
    logger.debug('BotBillingPayment: skip (no amount)', {
      event: params.event,
      reference: ref,
    });
    return;
  }

  await BotBillingPaymentModel.updateOne(
    { paystackReference: ref },
    {
      $set: {
        telegramId: params.telegramId,
        amountKobo: amount,
        currency: pickCurrency(params.d),
        status: 'success',
        channel: pickChannel(params.d),
        paidAt: pickPaidAt(params.d),
        description: pickDescription(params.d),
        sourceEvent: params.event,
      },
    },
    { upsert: true },
  );
}

export async function listTelegramBotBillingPayments(params: {
  telegramId: string;
  page: number;
  perPage: number;
}): Promise<{
  transactions: BillingPaymentRow[];
  meta: { total: number; page: number; pageCount: number };
}> {
  const perPage = Math.min(50, Math.max(1, params.perPage));
  const page = Math.max(1, params.page);
  const skip = (page - 1) * perPage;

  const filter = { telegramId: params.telegramId };
  const [rows, total] = await Promise.all([
    BotBillingPaymentModel.find(filter)
      .sort({ paidAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(perPage)
      .lean(),
    BotBillingPaymentModel.countDocuments(filter),
  ]);

  const transactions: BillingPaymentRow[] = rows.map((r) => ({
    reference: r.paystackReference,
    amountKobo: r.amountKobo,
    currency: r.currency,
    status: r.status,
    paidAt: r.paidAt ? r.paidAt.toISOString() : null,
    createdAt: r.createdAt ? r.createdAt.toISOString() : null,
    channel: r.channel,
    description: r.description,
  }));

  return {
    transactions,
    meta: {
      total,
      page,
      pageCount: Math.max(1, Math.ceil(total / perPage)),
    },
  };
}
