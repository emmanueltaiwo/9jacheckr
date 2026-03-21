# 9jaCheckr

## @9jacheckr/sdk

Official Node.js client for the [9ja Checkr](https://9jacheckr.xyz) NAFDAC verify API.

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

- `new CheckrClient({ apiKey })` — `apiKey` is required (throws if missing or whitespace-only).
- `client.verify(nafdac)` — returns `Promise<VerifyResult>` (discriminated union on `ok`).

The client calls `DEFAULT_API_ORIGIN` (same host the package is built for).

## Responses

`verify` always resolves (it does not throw for API or network failures). Narrow on `result.ok`:

### Success (`ok: true`)

HTTP **200** from the API. `product` dates are ISO strings or `null` (JSON from the server).

```json
{
  "ok": true,
  "product": {
    "nafdac": "01-5713",
    "name": "TITUS SARDINE IN VEGETABLE OIL",
    "category": "Food",
    "source": "Imported Product",
    "manufacturer": "UNIMER S.A",
    "approvedDate": "2025-07-30T00:00:00.000Z",
    "expiryDate": "2030-07-29T00:00:00.000Z",
    "ingredients": ["SARDINE", "VEGETABLE OIL", "SALT"]
  }
}
```

TypeScript: `result.product` has fields `nafdac`, `name`, `category`, `source`, `manufacturer`, `approvedDate`, `expiryDate`, `ingredients`.

### Errors (`ok: false`)

Shape:

```json
{
  "ok": false,
  "code": "NOT_FOUND",
  "message": "Product not found for this NAFDAC number"
}
```

Optional `nafdac` may be present when the API sends it.

#### From the API (examples)


| HTTP | `code`            | Typical `message`                                      |
| ---- | ----------------- | ------------------------------------------------------ |
| 400  | `INVALID_NAFDAC`  | NAFDAC number is required                              |
| 401  | `MISSING_API_KEY` | Provide x-api-key to use this endpoint                 |
| 401  | `INVALID_API_KEY` | Invalid API key                                        |
| 404  | `NOT_FOUND`       | Product not found for this NAFDAC number               |
| 429  | `RATE_LIMITED`    | Too many requests. Please wait a moment and try again. |
| 500  | `INTERNAL_ERROR`  | Something went wrong                                   |


`message` may be refined over time; prefer `code` for branching.

#### From the SDK only (no successful HTTP JSON from verify)


| `code`             | When                                                            |
| ------------------ | --------------------------------------------------------------- |
| `INVALID_NAFDAC`   | Empty or whitespace-only input (not sent to the API).           |
| `INVALID_RESPONSE` | Response body is not JSON or does not match the expected shape. |
| `TIMEOUT`          | Request exceeded the client timeout (~25s).                     |
| `NETWORK_ERROR`    | Network failure or other non-abort error before a parsed body.  |


For `NETWORK_ERROR` / `TIMEOUT`, check `result.message` for a short description.