import axios from 'axios';
import type { ExternalNafdacPayload } from '../types/types.js';
import { logger } from './logger.js';
import { parseNafdacVerifyModalHtml } from './nafdacHtmlParser.js';

export async function fetchProductFromNafdacRegistration(
  certificateNumber: string,
): Promise<ExternalNafdacPayload | null> {
  const verifyUrl = (process.env.NAFDAC_VERIFY_URL ?? '').trim();
  const requestVerificationToken = (
    process.env.REQUEST_VERIFICATION_TOKEN ?? ''
  ).trim();
  const cookie = (process.env.NAFDAC_COOKIE ?? '').trim();

  if (!verifyUrl) throw new Error('NAFDAC_VERIFY_URL is required');
  if (!requestVerificationToken)
    throw new Error('REQUEST_VERIFICATION_TOKEN is required');
  if (!cookie) throw new Error('NAFDAC_COOKIE is required');

  const body = new URLSearchParams({
    CertificateNumber: certificateNumber.trim(),
    __RequestVerificationToken: requestVerificationToken,
  });

  try {
    const postRes = await axios.post<string>(verifyUrl, body.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Cookie: cookie,
      },
      responseType: 'text',
    });

    const parsed = parseNafdacVerifyModalHtml(postRes.data);

    if (!parsed) {
      logger.info('NAFDAC verify returned no product modal', {
        certificateNumber: certificateNumber.trim(),
      });
    }

    return parsed;
  } catch (err) {
    logger.error('NAFDAC POST verify failed', { message: String(err) });
    throw err;
  }
}
