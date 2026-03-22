# Server

Express API: NAFDAC verify, Telegram bot hooks, Better Auth (Google), API keys in MongoDB.

**Needs:** Node 20+, MongoDB. Copy `apps/server/.env.example` → `.env`.

**Reverse proxy (Railway, etc.):** By default the server sets **`trust proxy`** to **1** hop so `req.ip` and **express-rate-limit** work with `X-Forwarded-For`. Set **`TRUST_PROXY=0`** only if you run without a proxy and need to ignore that header.

**Important vars:** `MONGODB_URI`, `API_KEY_SECRET`, `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `WEB_APP_URL`, `BOT_INTERNAL_TOKEN`, `WEB_VERIFY_INTERNAL_SECRET` (same value as the Next.js app — gates `/api/public/verify`;

**Billing (Paystack):** `PAYSTACK_SECRET_KEY`, `PAYSTACK_PLAN_API_PRO`, `PAYSTACK_PLAN_BOT_PRO`. **`WEB_APP_URL` must be a full URL** (e.g. `http://localhost:3000` or `https://yourdomain.com`) — Paystack rejects relative callback URLs. Plan env values must be **plan codes** (`PLN_…`), same mode as your key (test vs live). Webhook: `POST /api/billing/webhook` on your public API base. Optional: `PAYSTACK_BOT_CHECKOUT_EMAIL_DOMAIN` — must be a **real domain Paystack accepts** (default `9jacheckr.xyz`). Do not use `.local` or fake TLDs or initialize will fail with “Invalid Email Address”.

**Bot billing ledger:** Paystack webhooks upsert **`BotBillingPayment`** (per `telegramId`) for Bot Pro, same events as **`ApiBillingPayment`**. **`POST /api/bot/billing/transactions`** (internal token, body `{ telegramId, page?, perPage? }`) lists recorded charges for that Telegram user.

**Plans / errors:** API Free vs Pro — monthly **usage** cap **`billingConstants.ts`**: Free **300**, Pro **50,000** (₦10k/mo via Paystack plan). Usage = verify rows (single + batch, incl. not-found) **plus** successful **`GET /api/products/search`** responses; metrics, rate limits, multiple keys. On **Free**, only the **primary** (oldest) API key works for `/api/verify` and related routes; extra keys get **403** `KEY_PLAN_DISABLED`. Same rule for **dashboard** `POST /api/keys/create` (rotate) and `DELETE /api/keys/key/:id` (revoke) — non-primary keys cannot be rotated or revoked until Pro (`Revoke all` still revokes every key). Bot Free vs Pro (daily cap). Stable `code` values for clients: `PLAN_QUOTA_EXCEEDED`, `METRICS_NOT_AVAILABLE`, `FEATURE_REQUIRES_PRO`, `KEY_PLAN_DISABLED`, `BOT_DAILY_LIMIT`, `KEY_LIMIT`. Pro-only: `POST /api/verify/batch`, `GET /api/products/search`.

On connect, the server **drops** legacy index `apikeys.userId_1` if present, then runs `syncIndexes` so Pro users can have multiple keys. If that fails (permissions), drop it manually: `db.apikeys.dropIndex("userId_1")`.

Google redirect URI: `{BETTER_AUTH_URL}/api/auth/callback/google`

```bash
npm run dev -w server
```
