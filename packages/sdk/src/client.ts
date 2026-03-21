import { DEFAULT_API_ORIGIN, SDK_VERSION } from './constants.js';
import type { Product, VerifyError, VerifyResult } from './types.js';

const DEFAULT_TIMEOUT_MS = 25_000;

export type CheckrClientOptions = {
  apiKey: string;
};

function invalidResponse(): VerifyError {
  return {
    ok: false,
    code: 'INVALID_RESPONSE',
    message: 'The API returned an unexpected response.',
  };
}

function parseProduct(raw: Record<string, unknown>): Product | null {
  if (typeof raw.nafdac !== 'string') return null;
  const ingredients = raw.ingredients;
  const list = Array.isArray(ingredients)
    ? ingredients.map((x) => String(x))
    : [];
  return {
    nafdac: raw.nafdac,
    name: typeof raw.name === 'string' ? raw.name : '',
    category: typeof raw.category === 'string' ? raw.category : '',
    source: typeof raw.source === 'string' ? raw.source : '',
    manufacturer: typeof raw.manufacturer === 'string' ? raw.manufacturer : '',
    approvedDate:
      raw.approvedDate === null || typeof raw.approvedDate === 'string'
        ? raw.approvedDate
        : null,
    expiryDate:
      raw.expiryDate === null || typeof raw.expiryDate === 'string'
        ? raw.expiryDate
        : null,
    ingredients: list,
  };
}

function parseBody(data: unknown): VerifyResult {
  if (!data || typeof data !== 'object') return invalidResponse();
  const o = data as Record<string, unknown>;
  if (o.ok === true && o.product && typeof o.product === 'object') {
    const product = parseProduct(o.product as Record<string, unknown>);
    if (product) return { ok: true, product };
    return invalidResponse();
  }
  if (
    o.ok === false &&
    typeof o.code === 'string' &&
    typeof o.message === 'string'
  ) {
    const err: VerifyError = {
      ok: false,
      code: o.code,
      message: o.message,
    };
    if (typeof o.nafdac === 'string') err.nafdac = o.nafdac;
    return err;
  }
  return invalidResponse();
}

export class CheckrClient {
  private readonly apiKey: string;

  constructor(options: CheckrClientOptions) {
    const key = options.apiKey?.trim();
    if (!key) {
      throw new Error('apiKey is required');
    }
    this.apiKey = key;
  }

  async verify(nafdac: string): Promise<VerifyResult> {
    const raw = nafdac?.trim();
    if (!raw) {
      return {
        ok: false,
        code: 'INVALID_NAFDAC',
        message: 'NAFDAC number is required',
      };
    }

    const url = `${DEFAULT_API_ORIGIN}/api/verify/${encodeURIComponent(raw)}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'x-api-key': this.apiKey,
          Accept: 'application/json',
          'User-Agent': `@9jacheckr/sdk/${SDK_VERSION}`,
        },
        signal: controller.signal,
      });

      let data: unknown;
      try {
        data = await res.json();
      } catch {
        return invalidResponse();
      }

      return parseBody(data);
    } catch (err) {
      const aborted = err instanceof Error && err.name === 'AbortError';
      return {
        ok: false,
        code: aborted ? 'TIMEOUT' : 'NETWORK_ERROR',
        message: aborted
          ? 'The request timed out.'
          : 'Could not reach the API. Check your network.',
      };
    } finally {
      clearTimeout(timer);
    }
  }
}
