# 9ja Checkr — API server

Express API for **NAFDAC verify** (`GET /api/verify/:nafdac` with `x-api-key` or `x-internal-bot-token`), **API keys** (`/api/keys/*`), and **monthly usage** (`GET /api/metrics/me`, session when proxied from Next).

## Prerequisites

- Node.js **20+** (required: Better Auth / `undici` expect the global `File` API; Node 18 crashes at startup)
- MongoDB (shared with the web app for `apikeys` and Better Auth)

## Environment

See repo root [`.env.example`](../../.env.example).

| Variable             | Purpose                                                             |
| -------------------- | ------------------------------------------------------------------- |
| `MONGODB_URI`        | MongoDB connection string                                           |
| `API_KEY_SECRET`     | **Required.** Secret used to HMAC API keys at rest (not reversible) |
| `BETTER_AUTH_SECRET` | Same as web — validates session cookies on `/api/keys/*`            |
| `BETTER_AUTH_URL`    | Public URL of the **Next** app (where users sign in), e.g. `:3000`  |
| `WEB_APP_URL`        | CORS origin for the dashboard                                       |
| `BOT_INTERNAL_TOKEN` | Optional; bot bypass for verify                                     |
| `PORT`               | Default `4000`                                                      |

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

| Path                      | Auth                                                                  |
| ------------------------- | --------------------------------------------------------------------- |
| `GET /health`             | None                                                                  |
| `GET /api/verify/:nafdac` | `x-api-key` or `x-internal-bot-token`                                 |
| `GET /api/keys/me`        | Better Auth session (cookie)                                          |
| `POST /api/keys/create`   | Better Auth session                                                   |
| `DELETE /api/keys/me`     | Better Auth session                                                   |
| `GET /api/metrics/me`     | Better Auth session; optional `?month=YYYY-MM` (UTC, default current) |

Verify requests with `x-api-key` increment that key owner’s **current UTC month** counters: `total`, `found`, `notFound`, `failed`. Bot / internal token calls are not counted.

## Rate limiting

`/api/*` is rate-limited via `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX`.
