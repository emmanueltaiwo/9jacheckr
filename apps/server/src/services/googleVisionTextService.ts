import { existsSync, statSync } from 'node:fs';
import vision from '@google-cloud/vision';
import type { VisionFullTextAnnotation } from '../utils/nafdacFromOcrText.js';
import { logger } from '../utils/logger.js';

let client: vision.ImageAnnotatorClient | null = null;

function credentialsFromBase64Env(): Record<string, unknown> | undefined {
  const raw =
    process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64?.replace(/\s/g, '') ?? '';
  if (!raw) return undefined;
  const json = Buffer.from(raw, 'base64').toString('utf8');
  try {
    return JSON.parse(json) as Record<string, unknown>;
  } catch (e) {
    logger.error(
      'GOOGLE_APPLICATION_CREDENTIALS_BASE64 decoded value is not valid JSON',
      {
        message: String(e),
      },
    );
    throw e;
  }
}

function assertAdcKeyFileOk(): void {
  const p = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
  if (!p) return;
  if (!existsSync(p)) {
    throw new Error(
      `GOOGLE_APPLICATION_CREDENTIALS file not found: ${p}. See https://cloud.google.com/docs/authentication/application-default-credentials`,
    );
  }
  if (statSync(p).size === 0) {
    throw new Error(
      `GOOGLE_APPLICATION_CREDENTIALS file is empty (${p}). In GCP: IAM → Service accounts → your account → Keys → Add key → JSON, then save the downloaded file to this path.`,
    );
  }
}

function getClient(): vision.ImageAnnotatorClient {
  if (client) return client;
  const fromB64 = credentialsFromBase64Env();
  if (fromB64) {
    client = new vision.ImageAnnotatorClient({ credentials: fromB64 });
  } else {
    assertAdcKeyFileOk();
    client = new vision.ImageAnnotatorClient();
  }
  return client;
}

export type VisionTextOutcome =
  | { ok: true; fullTextAnnotation: VisionFullTextAnnotation | undefined }
  | { ok: false };

export async function detectTextInImage(
  buffer: Buffer,
): Promise<VisionTextOutcome> {
  try {
    const [result] = await getClient().documentTextDetection({
      image: { content: buffer },
    });
    let fullTextAnnotation = result.fullTextAnnotation as
      | VisionFullTextAnnotation
      | undefined;
    const fallbackDesc = result.textAnnotations?.[0]?.description?.trim();
    if (!fullTextAnnotation?.text?.trim() && fallbackDesc) {
      fullTextAnnotation = { text: fallbackDesc, pages: [] };
    }
    return { ok: true, fullTextAnnotation };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const code =
      err && typeof err === 'object' && 'code' in err
        ? String((err as { code: unknown }).code)
        : undefined;
    logger.error('Google Vision documentTextDetection failed', {
      message,
      code,
    });
    return { ok: false };
  }
}
