# 9ja Checkr — API server

Express API for **NAFDAC verify** (`GET /api/verify/:nafdac` with `x-api-key` or `x-internal-bot-token`), **Better Auth** (`/api/auth/*`), **API keys** (`/api/keys/*`), and **monthly usage** (`GET /api/metrics/me`, session cookie).

## Prerequisites

- Node.js **20+** (required: Better Auth / `undici` expect the global `File` API; Node 18 crashes at startup)
- MongoDB (API keys + Better Auth)

## Environment

| Variable               | Purpose                                                                                                   |
| ---------------------- | --------------------------------------------------------------------------------------------------------- |
| `MONGODB_URI`          | MongoDB connection string                                                                                 |
| `API_KEY_SECRET`       | **Required.** Secret used to HMAC API keys at rest                                                        |
| `BETTER_AUTH_SECRET`   | **Required.** Better Auth secret (same value the web app relied on before; one secret for the deployment) |
| `BETTER_AUTH_URL`      | **Public URL of this API** (where `/api/auth/*` is served), e.g. `https://api.9jacheckr.xyz`              |
| `WEB_APP_URL`          | **Required for browser dashboard.** CORS origin, e.g. `https://www.9jacheckr.xyz`                         |
| `AUTH_COOKIE_DOMAIN`   | Production: parent domain for shared cookies, e.g. `.9jacheckr.xyz` (omit for localhost / single-host)    |
| `GOOGLE_CLIENT_ID`     | Google OAuth (sign-in)                                                                                    |
| `GOOGLE_CLIENT_SECRET` | Google OAuth                                                                                              |
| `BOT_INTERNAL_TOKEN`   | **Required for bot.** Same value on the bot service; protects verify + `/api/bot/*`                       |
| `PORT`                 | Default `4000`                                                                                            |

**Google Cloud Console:** redirect URI must be `{BETTER_AUTH_URL}/api/auth/callback/google`.

**Important:** Do not mount `express.json()` before the Better Auth handler. This app mounts `/api/auth/*` first, then `express.json()` for other routes.

Legacy keys hashed with plain SHA-256 still verify until rotated.

## Scripts

```bash
# from repo root
npm run dev -w server

# from this folder
npm run dev
npm run build
npm start
```

## Routes

| Path                      | Auth                                                                                            |
| ------------------------- | ----------------------------------------------------------------------------------------------- |
| `GET /health`             | None                                                                                            |
| `GET /api/auth/*`         | Better Auth (OAuth, session, etc.)                                                              |
| `GET /api/verify/:nafdac` | `x-api-key` or `x-internal-bot-token`                                                           |
| `GET /api/keys/me`        | Better Auth session (cookie)                                                                    |
| `POST /api/keys/create`   | Better Auth session                                                                             |
| `DELETE /api/keys/me`     | Better Auth session                                                                             |
| `GET /api/metrics/me`     | Better Auth session; optional `?month=YYYY-MM` (UTC, default current)                           |
| `POST /api/bot/activity`  | `x-internal-bot-token`; JSON `{ event: "start", telegramId, username?, firstName?, lastName? }` |

Verify with **`x-api-key`** increments that user’s **usage_monthly** (per dashboard account).

Verify with **`x-internal-bot-token`** increments **`bot_usage_monthly`** (global bot traffic: `total`, `found`, `notFound`, `failed`). If the bot sends **`x-telegram-user-id`** (and optional `x-telegram-username`, `x-telegram-first-name`, `x-telegram-last-name`), the API also upserts **`bot_telegram_users`** (`startsCount`, `verifyCount`, profile, `firstSeenAt` / `lastActiveAt`).

The Telegram bot records **`/start`** via `POST /api/bot/activity` and passes Telegram headers on each verify call.

## Rate limiting

`/api/*` is rate-limited via `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX`. Paths under `/api/auth` are skipped.
