import type { Request, Response } from 'express';
import { verifyPaystackSignature } from '../services/paystackService.js';
import { processPaystackWebhookPayload } from '../services/paystackWebhookService.js';
import { logger } from '../utils/logger.js';

export async function billingWebhookController(req: Request, res: Response) {
  const sig = req.header('x-paystack-signature') ?? '';
  const raw = req.body as Buffer;
  if (!Buffer.isBuffer(raw) || raw.length === 0) {
    logger.warn('Paystack webhook rejected: empty body');
    res.status(400).send('empty body');
    return;
  }

  logger.info('Paystack webhook received', {
    bytes: raw.length,
    signaturePresent: Boolean(sig),
  });

  if (!verifyPaystackSignature(raw, sig)) {
    logger.warn('Paystack webhook rejected: invalid signature', {
      bytes: raw.length,
      signatureLength: sig.length,
    });
    res.status(400).send('invalid signature');
    return;
  }

  try {
    const payload = JSON.parse(raw.toString('utf8')) as unknown;
    const peek =
      payload && typeof payload === 'object'
        ? (payload as Record<string, unknown>)
        : null;
    logger.info('Paystack webhook verified, handling', {
      event: String(peek?.event ?? 'missing'),
    });
    await processPaystackWebhookPayload(payload);
    logger.info('Paystack webhook handler finished', {
      event: String(peek?.event ?? 'missing'),
    });
  } catch (e) {
    const err = e as Error;
    logger.error('Paystack webhook parse/handle failed', {
      message: err?.message ?? String(e),
      name: err?.name,
      stack: err?.stack,
      bodySnippet: raw.toString('utf8').slice(0, 400),
    });
  }
  res.status(200).json({ ok: true });
}
