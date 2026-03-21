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
