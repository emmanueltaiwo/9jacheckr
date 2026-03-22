# 9jaCheckr

## @9jacheckr/sdk

Official Node.js client for the [9ja Checkr](https://9jacheckr.xyz) NAFDAC verification API: single verify, batch verify (API Pro), and product search (API Pro).

## Requirements

- Node.js 18+ (global `fetch`)

## Install

```bash
npm install @9jacheckr/sdk
```

## Usage

**ESM**

```ts
import { CheckrClient } from '@9jacheckr/sdk';

const client = new CheckrClient({
  apiKey: process.env.NAIJA_CHECKR_API_KEY!,
});

const result = await client.verify('01-5713');

if (result.ok) {
  console.log(result.product.name, result.product.manufacturer);
} else {
  console.error(result.code, result.message);
}
```

**Batch verify (API Pro)** — up to 40 NAFDAC numbers per request; each row counts toward your monthly quota.

```ts
const batch = await client.verifyBatch(['01-5713', '04-8127']);

if (batch.ok) {
  for (const row of batch.results) {
    if (row.ok) console.log(row.nafdac, row.product.name);
    else console.log(row.nafdac, row.code, row.message);
  }
} else {
  console.error(batch.code, batch.message);
}
```

**Product search (API Pro)** — full-text search over indexed products.

```ts
const search = await client.searchProducts('sardine', { limit: 10 });

if (search.ok) {
  for (const hit of search.results) {
    console.log(hit.nafdac, hit.name, hit.manufacturer);
  }
} else {
  console.error(search.code, search.message);
}
```

**CommonJS**

```js
const { CheckrClient } = require('@9jacheckr/sdk');

async function main() {
  const client = new CheckrClient({
    apiKey: process.env.NAIJA_CHECKR_API_KEY,
  });
  const result = await client.verify('01-5713');
  // ...
}
```

Use your API key from the dashboard. Do not expose it in browser bundles.

## API

### `new CheckrClient(options)`

- `apiKey` (required) — throws if missing or whitespace-only.

The client calls `DEFAULT_API_ORIGIN` (`https://api.9jacheckr.xyz`), same as before.

### `client.verify(nafdac)`

`Promise<VerifyResult>` — `GET /api/verify/:nafdac`

### `client.verifyBatch(nafdac[])`

`Promise<BatchVerifyResult>` — `POST /api/verify/batch` with body `{ nafdac: string[] }`.

Requires **API Pro**. On success, `result.ok` is `true` and `result.results` has one entry per requested number (each item is either a product hit or a per-row error such as `NOT_FOUND`).

### `client.searchProducts(query, options?)`

`Promise<SearchResult>` — `GET /api/products/search?q=...&limit=...`

Requires **API Pro**. `query` must be at least 2 characters (each keyword ≥ 2 chars when you use several). Multiple keywords are matched with **AND** across NAFDAC, name, category, manufacturer, source, and ingredients; order does not matter. `options.limit` is optional (1–50, default 20).

### Behaviour

All methods **resolve** (they do not throw for API or network failures). Narrow on `result.ok`.

Timeout is ~25s per request.

## Responses

### Single verify (`VerifyResult`)

Same shape as before: success `{ ok: true, product }` or `{ ok: false, code, message, nafdac? }`.

### Batch (`BatchVerifyResult`)

- Success: `{ ok: true, results: BatchItemResult[] }` where each element is either `{ nafdac, ok: true, product }` or `{ nafdac, ok: false, code, message }`.
- HTTP/API failure: `{ ok: false, code, message }` (e.g. `FEATURE_REQUIRES_PRO`, `PLAN_QUOTA_EXCEEDED`, `INVALID_BODY`).

### Search (`SearchResult`)

- Success: `{ ok: true, results: SearchHit[] }` with `nafdac`, `name`, `category`, `manufacturer`.
- Failure: `{ ok: false, code, message }`.

### Errors (`ok: false`)

```json
{
  "ok": false,
  "code": "NOT_FOUND",
  "message": "Product not found for this NAFDAC number"
}
```

Optional `nafdac` may appear on single-verify errors.

#### From the API (examples)

| HTTP | `code` | Notes |
| ---- | ------ | ----- |
| 400 | `INVALID_NAFDAC` | Single verify: bad path param |
| 400 | `INVALID_BODY` | Batch: missing/empty `nafdac` array |
| 400 | `INVALID_QUERY` | Search: `q` too short (SDK also validates) |
| 401 | `MISSING_API_KEY` / `INVALID_API_KEY` | Key header |
| 403 | `FEATURE_REQUIRES_PRO` | Batch or search on Free plan |
| 404 | `NOT_FOUND` | Single verify |
| 429 | `PLAN_QUOTA_EXCEEDED` | Monthly verify cap |
| 429 | `RATE_LIMITED` | Per-plan rate limit |
| 500 | `INTERNAL_ERROR` | Server error |

`message` may change; prefer `code` for branching.

#### From the SDK only

| `code` | When |
| ------ | ---- |
| `INVALID_NAFDAC` | Empty single-verify input (not sent). |
| `INVALID_BODY` | Empty batch list after trim (not sent). |
| `INVALID_QUERY` | Search query &lt; 2 chars (not sent). |
| `INVALID_RESPONSE` | Body is not JSON or unexpected shape. |
| `TIMEOUT` | Request exceeded ~25s. |
| `NETWORK_ERROR` | Network failure before a parsed body. |

## Changelog

### 0.2.0

- `verifyBatch(nafdac[])` — `POST /api/verify/batch` (API Pro).
- `searchProducts(query, { limit? })` — `GET /api/products/search` (API Pro).
- Types exported for batch and search results.

### 0.1.0

- Initial release with `verify()`.
