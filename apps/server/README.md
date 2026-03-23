# 9ja Checkr — API server

Express service for **NAFDAC product lookup**, **Telegram bot** integration, **Better Auth** (Google), **Paystack billing**, and **API keys** stored in MongoDB.

---

## What you need

- **Node.js** 20+
- **MongoDB** reachable from the app
- A **`apps/server/.env`** file (create it locally; do not commit secrets)

---

## Run locally

```bash
npm run dev -w server
```

Default port: **`4000`** (override with **`PORT`**).

---

## Reverse proxy (`trust proxy`)

Behind Railway, nginx, etc., clients connect through one hop and send **`X-Forwarded-For`**. The app enables **`trust proxy`** for that hop so **`req.ip`** and **rate limiting** stay correct.

- **Default:** trust **1** proxy hop.
- **`TRUST_PROXY=0`** or **`false`:** disable if you run with **no** proxy and want to ignore `X-Forwarded-For`.

---

## Environment variables

Group names are logical; not every app needs every variable.

### Core

| Variable      | Purpose                                                                                  |
| ------------- | ---------------------------------------------------------------------------------------- |
| `MONGODB_URI` | MongoDB connection string                                                                |
| `PORT`        | HTTP port (default `4000`)                                                               |
| `WEB_APP_URL` | Full site URL (e.g. `https://…`) — required for Paystack callbacks; must not be relative |

### Better Auth + Google OAuth

| Variable               | Purpose                                               |
| ---------------------- | ----------------------------------------------------- |
| `BETTER_AUTH_URL`      | Public base URL of **this API** (used by auth routes) |
| `BETTER_AUTH_SECRET`   | Session / crypto secret                               |
| `GOOGLE_CLIENT_ID`     | Google OAuth client ID                                |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret                            |

Google redirect URI (configure in Google Cloud console):

`{BETTER_AUTH_URL}/api/auth/callback/google`

### API keys (dashboard / `/api/verify`)

| Variable         | Purpose                                  |
| ---------------- | ---------------------------------------- |
| `API_KEY_SECRET` | Used when hashing or validating API keys |

### NAFDAC portal (server-side scrape)

| Variable                     | Purpose                                    |
| ---------------------------- | ------------------------------------------ |
| `NAFDAC_VERIFY_URL`          | POST URL for the public verify form        |
| `REQUEST_VERIFICATION_TOKEN` | Form anti-forgery token (from page source) |
| `NAFDAC_COOKIE`              | Cookie header value for the same session   |

### Paystack (API Pro + web billing)

| Variable                | Purpose                                                           |
| ----------------------- | ----------------------------------------------------------------- |
| `PAYSTACK_SECRET_KEY`   | Secret key (test vs live must match plan mode)                    |
| `PAYSTACK_PLAN_API_PRO` | Plan code **`PLN_…`** for API Pro (₦10k/mo tier in code comments) |

Webhook: **`POST /api/billing/webhook`** on your public API base.

Optional:

| Variable                             | Purpose                                                                                                                        |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `PAYSTACK_BOT_CHECKOUT_EMAIL_DOMAIN` | Domain Paystack accepts for bot checkout emails (default `9jacheckr.xyz`). Avoid `.local` / fake TLDs or initialization fails. |

### Telegram bot ↔ API

| Variable             | Purpose                                                                           |
| -------------------- | --------------------------------------------------------------------------------- |
| `BOT_INTERNAL_TOKEN` | Shared secret; bot sends **`x-internal-bot-token`**. **Required** for bot routes. |

### Public verify (Next.js BFF)

| Variable                     | Purpose                                                                |
| ---------------------------- | ---------------------------------------------------------------------- |
| `WEB_VERIFY_INTERNAL_SECRET` | Same value as the web app — gates **`GET /api/public/verify/:nafdac`** |

### Google Cloud Vision (photo verify OCR)

| Variable                                | Purpose                                                                                         |
| --------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `GOOGLE_APPLICATION_CREDENTIALS_BASE64` | **Preferred:** standard base64 of the service account **JSON** (one line; whitespace stripped). |
| `GOOGLE_APPLICATION_CREDENTIALS`        | **Fallback:** filesystem path to that JSON (ADC style) if base64 unset.                         |

Generate base64 on macOS:

```bash
base64 -i path/to/key.json | tr -d '\n'
```

IAM: service account needs **Vision** access (e.g. **Cloud Vision AI User** / `roles/vision.user`).

If you see **`Unexpected end of JSON input`** after setting base64, the decoded value is not valid JSON (truncated paste, wrong file).

### Gemini (photo verify — NAFDAC extraction)

| Variable         | Purpose                                                                                                                      |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `GEMINI_API_KEY` | From [Google AI Studio](https://aistudio.google.com/apikey). If **unset**, photo verify uses **regex on OCR only** (no LLM). |
| `GEMINI_MODEL`   | Optional override (default **`gemini-2.5-flash-lite`**). [Pricing](https://ai.google.dev/pricing).                           |

### Health checks (optional lock)

| Variable        | Purpose                                                                                                                              |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `HEALTH_SECRET` | If set, **`/health/ready`** and **`/health/nafdac`** require header **`x-health-secret`** (timing-safe). **`/health`** stays public. |

### Bot Pro prepay (optional)

| Variable                              | Purpose                                                  |
| ------------------------------------- | -------------------------------------------------------- |
| `BOT_PRO_MONTHLY_KOBO`                | Monthly price in kobo (default `100000`)                 |
| `BOT_PRO_PREPAY_MAX_MONTHS`           | Max months user can buy at once (default `24`)           |
| `BOT_PRO_PREPAY_MAX_END_AHEAD_MONTHS` | Cap how far `currentPeriodEnd` may extend (default `36`) |

Enable bank transfer / USSD on the Paystack dashboard if you want alternatives to card on the hosted payment page.

---

## Main HTTP routes (overview)

| Area            | Base path                                    | Notes                               |
| --------------- | -------------------------------------------- | ----------------------------------- |
| Auth            | `/api/auth/*`                                | Better Auth (e.g. Google)           |
| Verify          | `/api/verify`                                | API key + plan checks               |
| Products search | `/api/products`                              | **API Pro**                         |
| API keys        | `/api/keys`                                  | Dashboard session                   |
| Bot             | `/api/bot/*`                                 | Internal token + bot-specific logic |
| Billing         | `/api/billing/*`                             | Webhook + customer billing          |
| Public verify   | `/api/public`                                | Internal secret from web app        |
| Health          | `/health`, `/health/ready`, `/health/nafdac` | See below                           |

**Photo verify** is registered separately:

- **`POST /api/bot/verify-image`** — raw image body, not under the generic `/api/bot` JSON router.

---

## Bot Pro photo verify

**Who can call:** Telegram bot only, with **`BOT_INTERNAL_TOKEN`**. User must be **Bot Pro** or the API returns **`403`** `FEATURE_REQUIRES_BOT_PRO`.

**Request**

- **Method:** `POST`
- **URL:** `/api/bot/verify-image`
- **Body:** Raw bytes of **JPEG**, **PNG**, or **WebP**
- **Headers:**
  - **`Content-Type`:** must be `image/jpeg`, `image/png`, or `image/webp`
  - **`x-internal-bot-token`:** must match `BOT_INTERNAL_TOKEN`
  - **`x-telegram-user-id`:** required (Telegram user id as string)
  - Optional: **`x-telegram-username`**, **`x-telegram-first-name`**, **`x-telegram-last-name`** (URI-encoded if non-ASCII)

**Limits**

- Body size: **8 MB** (Express raw parser)
- Rate limit: **40 requests / hour** per Telegram user id (or per IP if id missing)

**Pipeline**

1. **Google Cloud Vision** — `documentTextDetection` (full document text + word order when available).
2. If **`GEMINI_API_KEY`** is set:
   - **Gemini** receives OCR text only (not the image) and returns **structured JSON**: `result` (`FOUND_SINGLE` | `AMBIGUOUS` | `NOT_FOUND` | `UNCLEAR_OCR`), `nafdac`, `candidates`.
   - The server **normalizes** and checks a **plausible certificate shape** (e.g. `01-5713`, `A1-5645`).
   - There is **no regex override** when Gemini is configured: either one number is used, or a documented error is returned.
3. If **`GEMINI_API_KEY`** is **not** set:
   - **Regex / word-span heuristics** on the Vision output pick candidates (legacy path).

**Typical error `code` values**

| Code                       | Meaning                                                                      |
| -------------------------- | ---------------------------------------------------------------------------- |
| `UNSUPPORTED_MEDIA_TYPE`   | Wrong or missing `Content-Type` / empty body                                 |
| `UNAUTHORIZED`             | Missing or wrong internal bot token                                          |
| `FEATURE_REQUIRES_BOT_PRO` | User is not Bot Pro                                                          |
| `OCR_FAILED`               | Vision failed or unusable                                                    |
| `EXTRACTION_FAILED`        | Gemini configured but call/parse failed (**503**)                            |
| `NO_NAFDAC_IN_IMAGE`       | No registration identified (**422**)                                         |
| `AMBIGUOUS_NAFDAC`         | Multiple plausible numbers — response may include **`candidates`** (**422**) |
| `RATE_LIMITED`             | Too many photo verifies                                                      |
| `NOT_FOUND`                | Number extracted but not on NAFDAC portal (**404**)                          |

Successful response shape matches other verify endpoints (**`ok: true`** + **`product`**).

---

## API plans (summary)

Defined in **`src/constants/billingConstants.ts`** (keep in sync with Paystack amounts).

| Plan         | Monthly combined usage cap | Notes                                                                                              |
| ------------ | -------------------------- | -------------------------------------------------------------------------------------------------- |
| API **Free** | **300**                    | **`GET /api/verify/:nafdac`** only; **batch** and **product search** are Pro-only                  |
| API **Pro**  | **50_000**                 | Each single verify, each **batch row**, and each **successful** search response counts as one unit |

**Free tier API keys:** only the **primary** (oldest) key works for `/api/verify` and related product routes; extra keys get **`403`** `KEY_PLAN_DISABLED`. Same idea for rotating/revoking non-primary keys until Pro.

**Bot:** Free vs Pro with a **daily** verify cap for free users (**`BOT_FREE_DAILY_LIMIT`**, currently **5** / UTC day). Bot Pro uses Paystack prepay (months × monthly price).

**Stable error codes** clients may rely on include: `PLAN_QUOTA_EXCEEDED`, `METRICS_NOT_AVAILABLE`, `FEATURE_REQUIRES_PRO`, `KEY_PLAN_DISABLED`, `BOT_DAILY_LIMIT`, `KEY_LIMIT`.

**Pro-only features:** batch verify, product search, Bot Pro (including photo verify).

---

## Health endpoints

| Route                | What it checks                         | Default rate limit (per IP) |
| -------------------- | -------------------------------------- | --------------------------- |
| `GET /health`        | Process up                             | 800 / 15 min                |
| `GET /health/ready`  | MongoDB ping                           | 120 / 15 min                |
| `GET /health/nafdac` | Live POST to NAFDAC (sample `01-5713`) | 30 / 15 min                 |

If **`HEALTH_SECRET`** is set, **`ready`** and **`nafdac`** require **`x-health-secret`**.

---

## Bot billing (reference)

- Paystack **`charge.success`** updates **`BotBillingPayment`** (per `telegramId`), with idempotent extension tracking.
- **`POST /api/bot/billing/transactions`** — list charges; body `{ telegramId, page?, perPage? }`.
- **`POST /api/bot/billing/initialize-bot-pro`** — start Bot Pro checkout; body `{ telegramId, months }` (rate-limited).
