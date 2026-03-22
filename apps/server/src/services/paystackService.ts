import crypto from 'node:crypto';
import axios, { isAxiosError } from 'axios';
import { logger } from '../utils/logger.js';

type PaystackEnvelope = {
  status: boolean;
  message: string;
  data?: { authorization_url: string; access_code: string };
};

function readPaystackFailure(
  httpStatus: number,
  body: unknown,
): { message: string; logPayload: Record<string, unknown> } {
  const o =
    body && typeof body === 'object'
      ? (body as Record<string, unknown>)
      : undefined;
  const msg =
    typeof o?.message === 'string' && o.message.trim()
      ? o.message.trim()
      : `Paystack error (HTTP ${httpStatus})`;
  return {
    message: msg,
    logPayload: { httpStatus, body: o ?? body },
  };
}

function secretKey(): string {
  return process.env.PAYSTACK_SECRET_KEY?.trim() ?? '';
}

export function verifyPaystackSignature(rawBody: Buffer, signature: string): boolean {
  const sk = secretKey();
  if (!sk || !signature) return false;
  const hash = crypto.createHmac('sha512', sk).update(rawBody).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
  } catch {
    return false;
  }
}

type InitializeResult =
  | { ok: true; authorizationUrl: string; accessCode: string }
  | { ok: false; message: string };

export async function initializeApiProTransaction(params: {
  email: string;
  userId: string;
  callbackUrl: string;
}): Promise<InitializeResult> {
  const sk = secretKey();
  const plan = process.env.PAYSTACK_PLAN_API_PRO?.trim();
  if (!sk) {
    return { ok: false, message: 'Billing is not configured.' };
  }
  if (!plan) {
    return { ok: false, message: 'API Pro plan is not configured.' };
  }
  try {
    const res = await axios.post<PaystackEnvelope>(
      'https://api.paystack.co/transaction/initialize',
      {
        email: params.email,
        amount: 1_000_000,
        plan,
        callback_url: params.callbackUrl,
        metadata: {
          userId: params.userId,
          tier: 'api_pro',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${sk}`,
          'Content-Type': 'application/json',
        },
        timeout: 15_000,
        validateStatus: (s) => s >= 200 && s < 500,
      },
    );
    const { data } = res;
    if (res.status >= 400 || !data.status || !data.data?.authorization_url) {
      const { message, logPayload } = readPaystackFailure(res.status, data);
      logger.warn('Paystack API Pro initialize rejected', logPayload);
      return { ok: false, message };
    }
    return {
      ok: true,
      authorizationUrl: data.data.authorization_url,
      accessCode: data.data.access_code,
    };
  } catch (e) {
    if (isAxiosError(e) && e.response) {
      const { message, logPayload } = readPaystackFailure(
        e.response.status,
        e.response.data,
      );
      logger.warn('Paystack API Pro initialize failed', logPayload);
      return { ok: false, message };
    }
    logger.error('Paystack API Pro initialize failed', { message: String(e) });
    return { ok: false, message: 'Could not start checkout.' };
  }
}

export async function initializeBotProTransaction(params: {
  email: string;
  telegramId: string;
  callbackUrl: string;
}): Promise<InitializeResult> {
  const sk = secretKey();
  const plan = process.env.PAYSTACK_PLAN_BOT_PRO?.trim();
  if (!sk) {
    return { ok: false, message: 'Billing is not configured.' };
  }
  if (!plan) {
    return { ok: false, message: 'Bot Pro plan is not configured.' };
  }
  try {
    const res = await axios.post<PaystackEnvelope>(
      'https://api.paystack.co/transaction/initialize',
      {
        email: params.email,
        amount: 100_000,
        plan,
        callback_url: params.callbackUrl,
        metadata: {
          telegramId: params.telegramId,
          tier: 'bot_pro',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${sk}`,
          'Content-Type': 'application/json',
        },
        timeout: 15_000,
        validateStatus: (s) => s >= 200 && s < 500,
      },
    );
    const { data } = res;
    if (res.status >= 400 || !data.status || !data.data?.authorization_url) {
      const { message, logPayload } = readPaystackFailure(res.status, data);
      logger.warn('Paystack Bot Pro initialize rejected', logPayload);
      return { ok: false, message };
    }
    return {
      ok: true,
      authorizationUrl: data.data.authorization_url,
      accessCode: data.data.access_code,
    };
  } catch (e) {
    if (isAxiosError(e) && e.response) {
      const { message, logPayload } = readPaystackFailure(
        e.response.status,
        e.response.data,
      );
      logger.warn('Paystack Bot Pro initialize failed', logPayload);
      return { ok: false, message };
    }
    logger.error('Paystack Bot Pro initialize failed', { message: String(e) });
    return { ok: false, message: 'Could not start checkout.' };
  }
}

export type PaystackSubscriptionLive = {
  subscriptionCode: string;
  status: string;
  emailToken: string;
  nextPaymentDate: string | null;
  amountKobo: number;
  currency: string;
  planName: string | null;
  planInterval: string | null;
};

type PaystackDataEnvelope<T> = {
  status: boolean;
  message: string;
  data?: T;
};

function paystackAuthHeaders(): { Authorization: string } | null {
  const sk = secretKey();
  if (!sk) return null;
  return { Authorization: `Bearer ${sk}` };
}

export async function fetchPaystackSubscriptionLive(
  subscriptionCode: string,
): Promise<
  { ok: true; data: PaystackSubscriptionLive } | { ok: false; message: string }
> {
  const auth = paystackAuthHeaders();
  if (!auth) {
    return { ok: false, message: 'Billing is not configured.' };
  }
  const code = subscriptionCode.trim();
  if (!code) {
    return { ok: false, message: 'Missing subscription.' };
  }
  try {
    const res = await axios.get<
      PaystackDataEnvelope<Record<string, unknown>>
    >(`https://api.paystack.co/subscription/${encodeURIComponent(code)}`, {
      headers: { ...auth },
      timeout: 15_000,
      validateStatus: (s) => s >= 200 && s < 500,
    });
    const { data } = res;
    if (res.status >= 400 || !data.status || !data.data) {
      const { message } = readPaystackFailure(res.status, data);
      return { ok: false, message };
    }
    const d = data.data;
    const emailToken =
      typeof d.email_token === 'string' ? d.email_token.trim() : '';
    const plan = d.plan && typeof d.plan === 'object' && !Array.isArray(d.plan)
      ? (d.plan as Record<string, unknown>)
      : null;
    const planName =
      plan && typeof plan.name === 'string' ? plan.name.trim() : null;
    const planInterval =
      plan && typeof plan.interval === 'string' ? plan.interval.trim() : null;
    const next =
      typeof d.next_payment_date === 'string'
        ? d.next_payment_date.trim()
        : null;
    const amount =
      typeof d.amount === 'number' && Number.isFinite(d.amount) ? d.amount : 0;
    const planCurrency =
      plan && typeof plan.currency === 'string' ? plan.currency.trim() : '';
    const currency =
      typeof d.currency === 'string' && d.currency.trim()
        ? d.currency.trim()
        : planCurrency || 'NGN';
    const status =
      typeof d.status === 'string' ? d.status.trim().toLowerCase() : '';
    return {
      ok: true,
      data: {
        subscriptionCode: code,
        status: status || 'unknown',
        emailToken,
        nextPaymentDate: next,
        amountKobo: amount,
        currency,
        planName,
        planInterval,
      },
    };
  } catch (e) {
    if (isAxiosError(e) && e.response) {
      const { message } = readPaystackFailure(e.response.status, e.response.data);
      return { ok: false, message };
    }
    logger.error('Paystack fetch subscription failed', { message: String(e) });
    return { ok: false, message: 'Could not load subscription.' };
  }
}

export async function disablePaystackSubscription(params: {
  code: string;
  token: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const auth = paystackAuthHeaders();
  if (!auth) {
    return { ok: false, message: 'Billing is not configured.' };
  }
  const code = params.code.trim();
  const token = params.token.trim();
  if (!code || !token) {
    return { ok: false, message: 'Invalid subscription.' };
  }
  try {
    const res = await axios.post<PaystackDataEnvelope<unknown>>(
      'https://api.paystack.co/subscription/disable',
      { code, token },
      {
        headers: { ...auth, 'Content-Type': 'application/json' },
        timeout: 15_000,
        validateStatus: (s) => s >= 200 && s < 500,
      },
    );
    const { data } = res;
    if (res.status >= 400 || !data.status) {
      const { message } = readPaystackFailure(res.status, data);
      return { ok: false, message };
    }
    return { ok: true };
  } catch (e) {
    if (isAxiosError(e) && e.response) {
      const { message } = readPaystackFailure(e.response.status, e.response.data);
      return { ok: false, message };
    }
    logger.error('Paystack disable subscription failed', { message: String(e) });
    return { ok: false, message: 'Could not cancel subscription.' };
  }
}

export async function fetchPaystackSubscriptionManageLink(
  subscriptionCode: string,
): Promise<{ ok: true; url: string } | { ok: false; message: string }> {
  const auth = paystackAuthHeaders();
  if (!auth) {
    return { ok: false, message: 'Billing is not configured.' };
  }
  const code = subscriptionCode.trim();
  if (!code) {
    return { ok: false, message: 'Missing subscription.' };
  }
  try {
    const res = await axios.get<
      PaystackDataEnvelope<{ link?: string }>
    >(
      `https://api.paystack.co/subscription/${encodeURIComponent(code)}/manage/link`,
      {
        headers: { ...auth },
        timeout: 15_000,
        validateStatus: (s) => s >= 200 && s < 500,
      },
    );
    const { data } = res;
    if (res.status >= 400 || !data.status || !data.data?.link) {
      const { message } = readPaystackFailure(res.status, data);
      return { ok: false, message };
    }
    return { ok: true, url: data.data.link };
  } catch (e) {
    if (isAxiosError(e) && e.response) {
      const { message } = readPaystackFailure(e.response.status, e.response.data);
      return { ok: false, message };
    }
    logger.error('Paystack manage link failed', { message: String(e) });
    return { ok: false, message: 'Could not generate payment link.' };
  }
}
