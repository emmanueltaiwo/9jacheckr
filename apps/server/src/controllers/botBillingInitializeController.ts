import type { Request, Response } from 'express';
import { initializeBotProTransaction } from '../services/paystackService.js';

function absoluteAppUrl(raw: string): string | null {
  const base = raw.replace(/\/$/, '').trim();
  if (!base) return null;
  try {
    const u = new URL(base);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    return u.origin;
  } catch {
    return null;
  }
}

/**
 * Paystack validates email strictly — synthetic addresses must use a real,
 * publicly resolvable domain (not `.local`). One unique “customer” per Telegram user.
 */
function botCheckoutEmail(telegramId: string): string {
  const domain =
    process.env.PAYSTACK_BOT_CHECKOUT_EMAIL_DOMAIN?.trim() || '9jacheckr.xyz';
  return `bot-tg-${telegramId}@${domain}`;
}

export async function botBillingInitializeController(
  req: Request,
  res: Response,
) {
  const telegramId = String(
    (req.body as { telegramId?: string })?.telegramId ?? '',
  ).trim();
  if (!telegramId) {
    res.status(400).json({
      ok: false,
      code: 'INVALID_BODY',
      message: 'telegramId is required',
    });
    return;
  }
  const origin = absoluteAppUrl(process.env.WEB_APP_URL ?? '');
  if (!origin) {
    res.status(503).json({
      ok: false,
      code: 'BILLING_UNAVAILABLE',
      message:
        'WEB_APP_URL must be a full URL (e.g. https://yoursite.com) for Paystack callbacks.',
    });
    return;
  }
  const callbackUrl = `${origin}/bot/billing/success?via=telegram`;
  const result = await initializeBotProTransaction({
    email: botCheckoutEmail(telegramId),
    telegramId,
    callbackUrl,
  });
  if (!result.ok) {
    res.status(503).json({
      ok: false,
      code: 'BILLING_UNAVAILABLE',
      message: result.message,
    });
    return;
  }
  res.status(200).json({
    ok: true,
    authorizationUrl: result.authorizationUrl,
  });
}
