# 9ja Checkr

Look up **NAFDAC registration numbers** and get product details as **JSON** through an HTTP API, a web dashboard, or a Telegram bot.

---

## How the NAFDAC lookup works

This is the part people ask about most.

**We do not use a NAFDAC “developer API” or a special data feed.** NAFDAC exposes a **public web tool** where anyone can enter a registration number and see whether a product is on the register. Our server **uses that same public flow**: it submits the number the way a browser would, reads the **HTML page** NAFDAC sends back, and **extracts** the fields we need (name, manufacturer, category, dates, ingredients, etc.).

In plain steps:

1. **Request** - Your client calls our API with a NAFDAC number (e.g. `GET /api/verify/01-5713` with an API key).
2. **Our server → NAFDAC** - The backend sends an **HTTP POST** to NAFDAC’s verification URL with the certificate number and the same kind of **form data** their site expects (including things like an anti-forgery token and session cookie). Those are **configuration values** in the server environment, not secrets inside this repo.
3. **Response** - NAFDAC returns a **web page** (HTML), not JSON. We **parse** that HTML to build a structured product record.
4. **Your client** - We return that record as **JSON** from our API.

So technically: **automation of NAFDAC’s public verification page + HTML parsing**.

**Things to be aware of**

- If NAFDAC **changes their page layout**, our parser may break until it’s updated.
- We **store** successful results in our database so we don’t hit NAFDAC on every repeat request. That’s an optimization on top of the flow above.

Relevant code: `apps/server/src/utils/nafdacRegistrationClient.ts` (request) and `apps/server/src/utils/nafdacHtmlParser.ts` (parsing).

---

## Technical design (high level)

| Piece       | Role                                                                                                              |
| ----------- | ----------------------------------------------------------------------------------------------------------------- |
| **Web**     | Next.js marketing site, public `/verify` via same-origin BFF (`/api/verify-lookup`), login, dashboard (API keys). |
| **Server**  | Express: verify route, optional Mongo cache, Better Auth + API keys, bot hooks.                                   |
| **Bot**     | Telegram bot that calls the API with an internal token.                                                           |
| **MongoDB** | Products (cached lookups), users/sessions (auth), API keys, usage metrics, bot data.                              |

Clients talk **only to our API**. The API is the only part that talks to NAFDAC’s portal (when a number isn’t already cached).

---

## Using the verify API (for integrators)

Call the **9ja Checkr API** from your backend, script, or mobile app to look up a NAFDAC registration number and get **JSON** back. Every response has an **`ok`** boolean; errors always include a **`code`** and human-readable **`message`**.

### 1. Get an API key

1. Sign in on the **9ja Checkr** website (Google sign-in).
2. Open the **dashboard** and create an API key under the keys section.
3. **Copy the key when it is shown** — the full secret is only displayed once. Store it in an environment variable or secrets manager, not in source control.

If the key is **rotated or revoked**, old keys stop working immediately (`INVALID_API_KEY`).

### 2. Base URL

**Production:** `https://api.9jacheckr.xyz`

Use **HTTPS**. All API paths are under `/api/...`.

### 3. Make a verify request

**Method:** `GET`  
**URL:** `https://api.9jacheckr.xyz/api/verify/{nafdac}`

Replace `{nafdac}` with the number from the product label (e.g. `01-5713`). If the value has spaces or odd characters, **URL-encode** it (e.g. `encodeURIComponent` in JavaScript).

**Required header:**

| Header      | Value                              |
| ----------- | ---------------------------------- |
| `x-api-key` | Your API key (starts with `njc_`). |

You do **not** need cookies or a session for verify — the key is enough.

**Website lookup (not for third-party apps):** The `/verify` page calls **your own** Next.js route `POST /api/verify-lookup` (same origin, no secret in the browser). That server route forwards to the API with an internal header. **`GET /api/public/verify/{nafdac}`** on the API requires a shared server secret (`WEB_VERIFY_INTERNAL_SECRET`); it is **not** documented for integrators and is not usable from browsers without that secret. Use **`GET /api/verify/{nafdac}` + `x-api-key`** for integrations.

### 4. Success response (`200`)

When the number is found on the register, the body looks like:

```json
{
  "ok": true,
  "product": {
    "nafdac": "01-5713",
    "name": "…",
    "category": "…",
    "source": "…",
    "manufacturer": "…",
    "approvedDate": "2025-07-30T00:00:00.000Z",
    "expiryDate": "2030-07-29T00:00:00.000Z",
    "ingredients": ["…"]
  }
}
```

| Field                         | Notes                                   |
| ----------------------------- | --------------------------------------- |
| `approvedDate` / `expiryDate` | ISO 8601 strings, or `null` if unknown. |
| `ingredients`                 | Array of strings; may be empty.         |

### 5. Error responses

Check **`ok: false`** and branch on **`code`** (and HTTP status) in your integration.

| HTTP    | `code`            | What to do                                                                                                                     |
| ------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **401** | `MISSING_API_KEY` | Send the `x-api-key` header.                                                                                                   |
| **401** | `INVALID_API_KEY` | Key wrong, revoked, or typo — fix the key or create a new one in the dashboard.                                                |
| **400** | `INVALID_NAFDAC`  | Bad or empty number in the URL — validate input before calling.                                                                |
| **404** | `NOT_FOUND`       | Valid request, but **no product** for that number (not on the register from NAFDAC’s side). Show a clear message to your user. |
| **429** | `RATE_LIMITED`    | Too many requests — **wait and retry** with backoff; don’t hammer the API.                                                     |
| **500** | `INTERNAL_ERROR`  | Something failed on our side — **retry later**; if it persists, contact us.                                                    |

### 6. Rate limits

Verify (and other routes under `/api`) share one limiter:

|                |                       |
| -------------- | --------------------- |
| **Limit**      | **60** requests       |
| **Window**     | **15 minutes**        |
| **Counted by** | **Client IP** address |

When you exceed this, the API responds with **429** and `code: RATE_LIMITED`. The response may include standard **`RateLimit-*`** headers (remaining quota and reset hint) — you can use those to back off before retrying.

If you **self-host** the API, these numbers come from [`apps/server/src/middleware/rateLimiter.ts`](apps/server/src/middleware/rateLimiter.ts) and can differ from production.

### 7. Example

**cURL**

```bash
curl -sS "https://api.9jacheckr.xyz/api/verify/01-5713" \
  -H "x-api-key: YOUR_API_KEY_HERE"
```

**JavaScript (fetch)**

```js
const res = await fetch('https://api.9jacheckr.xyz/api/verify/01-5713', {
  headers: { 'x-api-key': process.env.CHECKR_API_KEY },
});
const data = await res.json();
if (data.ok) {
  console.log(data.product);
} else {
  console.error(data.code, data.message);
}
```

**Node.js (`@9jacheckr/sdk`)** — see [`packages/sdk/README.md`](packages/sdk/README.md).

**From a browser:** your site’s origin must be allowed for CORS (we allow the official web app origin). For **server-side** or **mobile** apps, call the API directly with the key as above.

### 8. Reference types in this repo

If you are contributing or generating types from the server, see [`apps/server/src/types/types.ts`](apps/server/src/types/types.ts) (`VerifyApiSuccess`, `VerifyApiErrorBody`, `ProductPlain`).

### 9. Running your own API

This project is **open source**. If you deploy the stack yourself, base URL and limits depend on your hosting; see [`apps/server/README.md`](apps/server/README.md) and env configuration there.

### License

This project is open source under the terms in [`LICENSE`](LICENSE) in the repo root.

---

## Run locally

```bash
npm install
npm run dev -w web     # site + dashboard
npm run dev -w server  # API
npm run dev -w bot     # Telegram
```

Env vars: see each app’s **`README.md`** (`apps/web`, `apps/server`, `apps/bot`).
