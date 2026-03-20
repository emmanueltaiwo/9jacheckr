import axios, { AxiosError } from 'axios';
import type { VerifyResponseDto } from '../types/apiTypes.js';
import { logger } from '../utils/logger.js';

export async function verifyNafdac(
  baseUrl: string,
  nafdac: string,
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
