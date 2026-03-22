import { ApiBillingPaymentModel } from '../models/apiBillingPaymentModel.js';
import { logger } from '../utils/logger.js';

export function asRecord(v: unknown): Record<string, unknown> | null {
  if (v && typeof v === 'object' && !Array.isArray(v)) {
    return v as Record<string, unknown>;
  }
  return null;
}

function parseDate(v: unknown): Date | null {
  if (typeof v !== 'string') return null;
  const dt = new Date(v);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

export function pickReference(d: Record<string, unknown>): string | null {
  if (typeof d.reference === 'string' && d.reference.trim()) {
    return d.reference.trim();
  }
  const tx = asRecord(d.transaction);
  if (tx && typeof tx.reference === 'string' && tx.reference.trim()) {
    return tx.reference.trim();
  }
  if (typeof d.request_reference === 'string' && d.request_reference.trim()) {
    return d.request_reference.trim();
  }
  if (typeof d.invoice_code === 'string' && d.invoice_code.trim()) {
    return d.invoice_code.trim();
  }
  return null;
}

export function pickAmount(d: Record<string, unknown>): number | null {
  if (typeof d.amount === 'number' && Number.isFinite(d.amount)) {
    return d.amount;
  }
  const tx = asRecord(d.transaction);
  if (tx && typeof tx.amount === 'number' && Number.isFinite(tx.amount)) {
    return tx.amount;
  }
  if (
    typeof d.requested_amount === 'number' &&
    Number.isFinite(d.requested_amount)
  ) {
    return d.requested_amount;
  }
  return null;
}

export function pickCurrency(d: Record<string, unknown>): string {
  if (typeof d.currency === 'string' && d.currency.trim()) {
    return d.currency.trim();
  }
  const tx = asRecord(d.transaction);
  if (tx && typeof tx.currency === 'string' && tx.currency.trim()) {
    return tx.currency.trim();
  }
  return 'NGN';
}

export function pickChannel(d: Record<string, unknown>): string | null {
  if (typeof d.channel === 'string' && d.channel.trim()) {
    return d.channel.trim();
  }
  const tx = asRecord(d.transaction);
  if (tx && typeof tx.channel === 'string' && tx.channel.trim()) {
    return tx.channel.trim();
  }
  return null;
}

export function pickPaidAt(d: Record<string, unknown>): Date {
  const fromRoot = parseDate(d.paid_at) ?? parseDate(d.paidAt);
  if (fromRoot) return fromRoot;
  const tx = asRecord(d.transaction);
  if (tx) {
    const fromTx = parseDate(tx.paid_at) ?? parseDate(tx.paidAt);
    if (fromTx) return fromTx;
  }
  return new Date();
}

export function pickDescription(d: Record<string, unknown>): string | null {
  if (typeof d.gateway_response === 'string' && d.gateway_response.trim()) {
    return d.gateway_response.trim();
  }
  const tx = asRecord(d.transaction);
  if (
    tx &&
    typeof tx.gateway_response === 'string' &&
    tx.gateway_response.trim()
  ) {
    return tx.gateway_response.trim();
  }
  return null;
}

/**
 * Idempotent ledger row from Paystack webhook `data` (charge or paid invoice).
 */
export async function recordApiProPaymentFromWebhook(params: {
  userId: string;
  event: string;
  d: Record<string, unknown>;
}): Promise<void> {
  const ref = pickReference(params.d);
  if (!ref) {
    logger.debug('ApiBillingPayment: skip (no reference)', {
      event: params.event,
    });
    return;
  }
  const amount = pickAmount(params.d);
  if (amount == null) {
    logger.debug('ApiBillingPayment: skip (no amount)', {
      event: params.event,
      reference: ref,
    });
    return;
  }

  await ApiBillingPaymentModel.updateOne(
    { paystackReference: ref },
    {
      $set: {
        userId: params.userId,
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

export type BillingPaymentRow = {
  reference: string;
  amountKobo: number;
  currency: string;
  status: string;
  paidAt: string | null;
  createdAt: string | null;
  channel: string | null;
  description: string | null;
};

export async function listUserApiBillingPayments(params: {
  userId: string;
  page: number;
  perPage: number;
}): Promise<{
  transactions: BillingPaymentRow[];
  meta: { total: number; page: number; pageCount: number };
}> {
  const perPage = Math.min(50, Math.max(1, params.perPage));
  const page = Math.max(1, params.page);
  const skip = (page - 1) * perPage;

  const filter = { userId: params.userId };
  const [rows, total] = await Promise.all([
    ApiBillingPaymentModel.find(filter)
      .sort({ paidAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(perPage)
      .lean(),
    ApiBillingPaymentModel.countDocuments(filter),
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
