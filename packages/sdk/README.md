# 9jaCheckr

## @9jacheckr/sdk

Node.js client for the [9ja Checkr](https://9jacheckr.xyz) NAFDAC **registration lookup** API (independent service — not NAFDAC; see [disclaimer](https://9jacheckr.xyz/disclaimer)): single lookup (`verify`), batch lookup (API Pro), and product search (API Pro). Monthly **API usage** quotas are enforced server-side: each lookup row (incl. batch) and each successful search count toward the same cap (e.g. Free 300 / Pro 50,000 per UTC month — see product docs).

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

**Batch lookup (API Pro)** — up to 40 NAFDAC numbers per request; each row counts toward your monthly API usage quota.

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

**Product search (API Pro)** — full-text search over indexed products. Each successful search counts toward the same monthly API usage quota as lookups.

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

| HTTP | `code`                                | Notes                                                           |
| ---- | ------------------------------------- | --------------------------------------------------------------- |
| 400  | `INVALID_NAFDAC`                      | Single verify: bad path param                                   |
| 400  | `INVALID_BODY`                        | Batch: missing/empty `nafdac` array                             |
| 400  | `INVALID_QUERY`                       | Search: `q` too short (SDK also validates)                      |
| 401  | `MISSING_API_KEY` / `INVALID_API_KEY` | Key header                                                      |
| 403  | `FEATURE_REQUIRES_PRO`                | Batch or search on Free plan                                    |
| 403  | `KEY_PLAN_DISABLED`                   | Non-primary API key while on Free plan (use primary or upgrade) |
| 404  | `NOT_FOUND`                           | Single verify                                                   |
| 429  | `PLAN_QUOTA_EXCEEDED`                 | Monthly API usage cap (verifies + searches)                     |
| 429  | `RATE_LIMITED`                        | Per-plan rate limit                                             |
| 500  | `INTERNAL_ERROR`                      | Server error                                                    |

`message` may change; prefer `code` for branching.

#### From the SDK only

| `code`             | When                                    |
| ------------------ | --------------------------------------- |
| `INVALID_NAFDAC`   | Empty single-verify input (not sent).   |
| `INVALID_BODY`     | Empty batch list after trim (not sent). |
| `INVALID_QUERY`    | Search query &lt; 2 chars (not sent).   |
| `INVALID_RESPONSE` | Body is not JSON or unexpected shape.   |
| `TIMEOUT`          | Request exceeded ~25s.                  |
| `NETWORK_ERROR`    | Network failure before a parsed body.   |

## License

**GNU GPLv3** — GNU General Public License v3.0 only (SPDX `GPL-3.0-only`). Strong copyleft: distribution of derivatives or combined works typically requires **same-license** source release, **notice** preservation, and **stating changes**; no warranty. Full text: monorepo root [`LICENSE`](../../LICENSE).

## Changelog

### 0.2.0

- `verifyBatch(nafdac[])` — `POST /api/verify/batch` (API Pro).
- `searchProducts(query, { limit? })` — `GET /api/products/search` (API Pro).
- Types exported for batch and search results.

### 0.1.0

- Initial release with `verify()`.
