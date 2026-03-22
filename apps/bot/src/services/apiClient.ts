import axios, { AxiosError } from 'axios';
import type { VerifyResponseDto } from '../types/apiTypes.js';
import { logger } from '../utils/logger.js';

export type BotCallerInfo = {
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
};

export function telegramUserToCaller(from: {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
}): BotCallerInfo {
  return {
    telegramId: String(from.id),
    username: from.username,
    firstName: from.first_name,
    lastName: from.last_name,
  };
}

/**
 * Node's HTTP client only allows TAB or printable ASCII in header values.
 * Telegram names may include emoji / non-Latin text — encode so headers stay valid.
 */
function telegramFieldForHeader(value: string | undefined): string | undefined {
  if (value == null || value === '') return undefined;
  const t = value.trim();
  if (!t) return undefined;
  return encodeURIComponent(t).slice(0, 1024);
}

function callerHeaders(caller?: BotCallerInfo): Record<string, string> {
  if (!caller) return {};
  const h: Record<string, string> = {
    'x-telegram-user-id': caller.telegramId,
  };
  const u = telegramFieldForHeader(caller.username);
  if (u) h['x-telegram-username'] = u;
  const fn = telegramFieldForHeader(caller.firstName);
  if (fn) h['x-telegram-first-name'] = fn;
  const ln = telegramFieldForHeader(caller.lastName);
  if (ln) h['x-telegram-last-name'] = ln;
  return h;
}

export async function recordBotActivity(
  baseUrl: string,
  event: 'start',
  caller: BotCallerInfo,
): Promise<void> {
  const root = baseUrl.replace(/\/$/, '');
  try {
    await axios.post(
      `${root}/api/bot/activity`,
      {
        event,
        telegramId: caller.telegramId,
        username: caller.username,
        firstName: caller.firstName,
        lastName: caller.lastName,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-internal-bot-token': process.env.BOT_INTERNAL_TOKEN ?? '',
        },
        timeout: 10_000,
        validateStatus: () => true,
      },
    );
  } catch {
    /* ignore — metrics are best-effort */
  }
}

export async function verifyNafdac(
  baseUrl: string,
  nafdac: string,
  caller?: BotCallerInfo,
): Promise<VerifyResponseDto> {
  const url = `${baseUrl.replace(/\/$/, '')}/api/verify/${encodeURIComponent(
    nafdac,
  )}`;

  try {
    logger.info('Calling verify API', { url });

    const res = await axios.get<unknown>(url, {
      timeout: 20_000,
      validateStatus: () => true,
      headers: {
        'x-internal-bot-token': process.env.BOT_INTERNAL_TOKEN ?? '',
        ...callerHeaders(caller),
      },
    });

    const data = res.data;
    logger.info('Verify API responded', { status: res.status });

    if (data && typeof data === 'object' && 'ok' in data) {
      return data as VerifyResponseDto;
    }

    return {
      ok: false,
      code: 'INVALID_RESPONSE',
      message: 'Verification service returned an unexpected response.',
    };
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const ax = err as AxiosError;
      logger.error('Verify API request failed', {
        message: ax.message,
        code: ax.code,
      });
    } else {
      logger.error('Verify API request failed', { message: String(err) });
    }

    return {
      ok: false,
      code: 'NETWORK_ERROR',
      message: 'Could not reach verification service. Try again later.',
    };
  }
}

type BotCheckoutJson =
  | { ok: true; authorizationUrl: string }
  | { ok: false; code?: string; message?: string };

export async function initializeBotProCheckout(
  baseUrl: string,
  telegramId: string,
): Promise<
  { ok: true; authorizationUrl: string } | { ok: false; message: string }
> {
  const root = baseUrl.replace(/\/$/, '');
  try {
    const res = await axios.post<BotCheckoutJson>(
      `${root}/api/bot/billing/initialize-bot-pro`,
      { telegramId },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-internal-bot-token': process.env.BOT_INTERNAL_TOKEN ?? '',
        },
        timeout: 15_000,
        validateStatus: () => true,
      },
    );
    const data = res.data;
    if (data && typeof data === 'object' && data.ok && data.authorizationUrl) {
      return { ok: true, authorizationUrl: data.authorizationUrl };
    }
    const msg =
      data && typeof data === 'object' && 'message' in data
        ? String((data as { message?: string }).message)
        : 'Checkout unavailable.';
    return { ok: false, message: msg };
  } catch {
    return { ok: false, message: 'Could not reach billing service.' };
  }
}

export type BotStatusResponse =
  | {
      ok: true;
      plan: 'free' | 'pro_bot';
      dailyUsed: number;
      dailyLimit: number;
      periodEnd: string | null;
      totalVerifyCount: number;
    }
  | { ok: false; message?: string };

export async function fetchBotStatus(
  baseUrl: string,
  telegramId: string,
): Promise<BotStatusResponse> {
  const root = baseUrl.replace(/\/$/, '');
  try {
    const res = await axios.post<unknown>(
      `${root}/api/bot/status`,
      { telegramId },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-internal-bot-token': process.env.BOT_INTERNAL_TOKEN ?? '',
        },
        timeout: 10_000,
        validateStatus: () => true,
      },
    );
    const data = res.data;
    if (
      data &&
      typeof data === 'object' &&
      'ok' in data &&
      (data as { ok?: boolean }).ok === true &&
      'plan' in data
    ) {
      const d = data as unknown as {
        plan: string;
        dailyUsed: unknown;
        dailyLimit: unknown;
        periodEnd: unknown;
        totalVerifyCount: unknown;
      };
      const plan = d.plan === 'pro_bot' ? 'pro_bot' : 'free';
      const dailyUsed =
        typeof d.dailyUsed === 'number' && Number.isFinite(d.dailyUsed)
          ? d.dailyUsed
          : 0;
      const dailyLimit =
        typeof d.dailyLimit === 'number' && Number.isFinite(d.dailyLimit)
          ? d.dailyLimit
          : 5;
      const periodEnd =
        d.periodEnd === null
          ? null
          : typeof d.periodEnd === 'string'
            ? d.periodEnd
            : null;
      const totalVerifyCount =
        typeof d.totalVerifyCount === 'number' &&
        Number.isFinite(d.totalVerifyCount)
          ? d.totalVerifyCount
          : 0;
      return {
        ok: true,
        plan,
        dailyUsed,
        dailyLimit,
        periodEnd,
        totalVerifyCount,
      };
    }
    const msg =
      data && typeof data === 'object' && 'message' in data
        ? String((data as { message?: string }).message)
        : 'Status unavailable.';
    return { ok: false, message: msg };
  } catch {
    return { ok: false, message: 'Could not reach the server.' };
  }
}

export type BotBillingTxRow = {
  reference: string;
  amountKobo: number;
  currency: string;
  status: string;
  paidAt: string | null;
  createdAt: string | null;
  channel: string | null;
  description: string | null;
};

export type BotBillingTransactionsResponse =
  | {
      ok: true;
      transactions: BotBillingTxRow[];
      meta: { total: number; page: number; pageCount: number };
    }
  | { ok: false; message?: string };

export async function fetchBotBillingTransactions(
  baseUrl: string,
  telegramId: string,
  page = 1,
  perPage = 15,
): Promise<BotBillingTransactionsResponse> {
  const root = baseUrl.replace(/\/$/, '');
  try {
    const res = await axios.post<unknown>(
      `${root}/api/bot/billing/transactions`,
      { telegramId, page, perPage },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-internal-bot-token': process.env.BOT_INTERNAL_TOKEN ?? '',
        },
        timeout: 15_000,
        validateStatus: () => true,
      },
    );
    const data = res.data;
    if (
      data &&
      typeof data === 'object' &&
      (data as { ok?: boolean }).ok === true &&
      'transactions' in data &&
      'meta' in data
    ) {
      const d = data as {
        transactions: unknown;
        meta: unknown;
      };
      const transactions = Array.isArray(d.transactions)
        ? (d.transactions as BotBillingTxRow[])
        : [];
      const meta = d.meta && typeof d.meta === 'object' ? d.meta : {};
      const m = meta as Record<string, unknown>;
      const total =
        typeof m.total === 'number' && Number.isFinite(m.total) ? m.total : 0;
      const pageNum =
        typeof m.page === 'number' && Number.isFinite(m.page) ? m.page : 1;
      const pageCount =
        typeof m.pageCount === 'number' && Number.isFinite(m.pageCount)
          ? m.pageCount
          : 1;
      return {
        ok: true,
        transactions,
        meta: { total, page: pageNum, pageCount },
      };
    }
    const msg =
      data && typeof data === 'object' && 'message' in data
        ? String((data as { message?: string }).message)
        : 'Could not load payments.';
    return { ok: false, message: msg };
  } catch {
    return { ok: false, message: 'Could not reach billing service.' };
  }
}
