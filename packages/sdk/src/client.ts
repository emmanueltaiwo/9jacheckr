import { DEFAULT_API_ORIGIN, SDK_VERSION } from './constants.js';
import type {
  BatchItemResult,
  BatchVerifyResult,
  Product,
  SearchHit,
  SearchResult,
  VerifyError,
  VerifyResult,
} from './types.js';

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

function parseApiError(o: Record<string, unknown>): VerifyError | null {
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
  return null;
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

function parseVerifyBody(data: unknown): VerifyResult {
  if (!data || typeof data !== 'object') return invalidResponse();
  const o = data as Record<string, unknown>;
  if (o.ok === true && o.product && typeof o.product === 'object') {
    const product = parseProduct(o.product as Record<string, unknown>);
    if (product) return { ok: true, product };
    return invalidResponse();
  }
  const err = parseApiError(o);
  if (err) return err;
  return invalidResponse();
}

function parseBatchItem(raw: unknown): BatchItemResult | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const nafdac = typeof o.nafdac === 'string' ? o.nafdac : '';
  if (!nafdac) return null;
  if (o.ok === true && o.product && typeof o.product === 'object') {
    const product = parseProduct(o.product as Record<string, unknown>);
    if (product) return { nafdac, ok: true, product };
    return null;
  }
  if (
    o.ok === false &&
    typeof o.code === 'string' &&
    typeof o.message === 'string'
  ) {
    return { nafdac, ok: false, code: o.code, message: o.message };
  }
  return null;
}

function parseBatchBody(data: unknown): BatchVerifyResult {
  if (!data || typeof data !== 'object') return invalidResponse();
  const o = data as Record<string, unknown>;
  if (o.ok === true && Array.isArray(o.results)) {
    const results: BatchItemResult[] = [];
    for (const row of o.results) {
      const item = parseBatchItem(row);
      if (!item) return invalidResponse();
      results.push(item);
    }
    return { ok: true, results };
  }
  const err = parseApiError(o);
  if (err) return err;
  return invalidResponse();
}

function parseSearchHit(raw: unknown): SearchHit | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.nafdac !== 'string') return null;
  return {
    nafdac: o.nafdac,
    name: typeof o.name === 'string' ? o.name : '',
    category: typeof o.category === 'string' ? o.category : '',
    manufacturer: typeof o.manufacturer === 'string' ? o.manufacturer : '',
  };
}

function parseSearchBody(data: unknown): SearchResult {
  if (!data || typeof data !== 'object') return invalidResponse();
  const o = data as Record<string, unknown>;
  if (o.ok === true && Array.isArray(o.results)) {
    const results: SearchHit[] = [];
    for (const row of o.results) {
      const hit = parseSearchHit(row);
      if (!hit) return invalidResponse();
      results.push(hit);
    }
    return { ok: true, results };
  }
  const err = parseApiError(o);
  if (err) return err;
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

  private async request(
    path: string,
    init: RequestInit,
  ): Promise<{ ok: true; data: unknown } | { ok: false; error: VerifyError }> {
    const url = `${DEFAULT_API_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

    const headers = new Headers(init.headers);
    headers.set('x-api-key', this.apiKey);
    headers.set('Accept', 'application/json');
    headers.set('User-Agent', `@9jacheckr/sdk/${SDK_VERSION}`);

    try {
      const res = await fetch(url, {
        ...init,
        headers,
        signal: controller.signal,
      });

      let data: unknown;
      try {
        data = await res.json();
      } catch {
        return { ok: false, error: invalidResponse() };
      }

      if (!data || typeof data !== 'object') {
        return { ok: false, error: invalidResponse() };
      }

      return { ok: true, data };
    } catch (err) {
      const aborted = err instanceof Error && err.name === 'AbortError';
      return {
        ok: false,
        error: {
          ok: false,
          code: aborted ? 'TIMEOUT' : 'NETWORK_ERROR',
          message: aborted
            ? 'The request timed out.'
            : 'Could not reach the API. Check your network.',
        },
      };
    } finally {
      clearTimeout(timer);
    }
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

    const path = `/api/verify/${encodeURIComponent(raw)}`;
    const res = await this.request(path, { method: 'GET' });
    if (!res.ok) return res.error;
    return parseVerifyBody(res.data);
  }

  /**
   * Verify up to 40 NAFDAC numbers in one request (API Pro). Each result counts toward monthly quota.
   */
  async verifyBatch(nafdac: string[]): Promise<BatchVerifyResult> {
    const list = (Array.isArray(nafdac) ? nafdac : [])
      .map((x) => String(x ?? '').trim())
      .filter(Boolean)
      .slice(0, 40);
    if (list.length === 0) {
      return {
        ok: false,
        code: 'INVALID_BODY',
        message: 'Provide at least one NAFDAC number.',
      };
    }

    const res = await this.request('/api/verify/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nafdac: list }),
    });
    if (!res.ok) return res.error;
    return parseBatchBody(res.data);
  }

  /**
   * Full-text product search (API Pro). `query` must be at least 2 characters.
   */
  async searchProducts(
    query: string,
    options?: { limit?: number },
  ): Promise<SearchResult> {
    const q = query?.trim() ?? '';
    if (q.length < 2) {
      return {
        ok: false,
        code: 'INVALID_QUERY',
        message: 'Query must be at least 2 characters.',
      };
    }
    const limitRaw = options?.limit;
    const limit =
      typeof limitRaw === 'number' && Number.isFinite(limitRaw)
        ? Math.min(50, Math.max(1, Math.floor(limitRaw)))
        : 20;
    const qs = new URLSearchParams({ q, limit: String(limit) });
    const res = await this.request(`/api/products/search?${qs.toString()}`, {
      method: 'GET',
    });
    if (!res.ok) return res.error;
    return parseSearchBody(res.data);
  }
}
