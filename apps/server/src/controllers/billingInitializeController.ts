import type { Request, Response } from 'express';
import { initializeApiProTransaction } from '../services/paystackService.js';

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

export async function initializeApiProController(req: Request, res: Response) {
  const user = req.authUser!;
  const email = user.email?.trim();
  if (!email) {
    res.status(400).json({
      ok: false,
      code: 'EMAIL_REQUIRED',
      message: 'Your account needs an email to subscribe.',
    });
    return;
  }
  const origin = absoluteAppUrl(process.env.WEB_APP_URL ?? '');
  if (!origin) {
    res.status(503).json({
      ok: false,
      code: 'BILLING_UNAVAILABLE',
      message:
        'Set WEB_APP_URL to your full site URL (e.g. https://yoursite.com or http://localhost:3000). Paystack requires an absolute callback URL.',
    });
    return;
  }
  const callbackUrl = `${origin}/dashboard/settings?billing=success`;
  const result = await initializeApiProTransaction({
    email,
    userId: user.id,
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
