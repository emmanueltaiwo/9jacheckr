# 9ja Checkr — Web app

Next.js (App Router): marketing site, Google sign-in (Better Auth), dashboard, and **rewrites** of `/api/keys/*` and `/api/metrics/*` to the Express API (session cookie forwarded server-side).

The **Express server** (`apps/server`) serves `GET /api/verify/:nafdac` (`x-api-key` or bot header) and **API key CRUD** at `/api/keys/*` (Better Auth session).

## Prerequisites

- Node.js 18+
- MongoDB (shared with the API server for `apikeys`, products, and Better Auth collections)

## Environment

Use `apps/web/.env.local`. See repo root [`.env.example`](../../.env.example).

| Variable                                    | Purpose                                                                                             |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `MONGODB_URI`                               | Same DB as the verify API (keys + auth data)                                                        |
| `BETTER_AUTH_URL`                           | Public URL of this app (e.g. `http://localhost:3000`)                                               |
| `BETTER_AUTH_SECRET`                        | Strong secret for Better Auth                                                                       |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | OAuth; redirect `…/api/auth/callback/google` on this origin                                         |
| `NEXT_PUBLIC_API_BASE_URL`                  | Express API base (`http://localhost:4000`): verify, rewrites for `/api/keys/*` and `/api/metrics/*` |
| `API_REWRITE_TARGET`                        | Optional override for key rewrites (e.g. Docker internal URL)                                       |
| `NEXT_PUBLIC_BETTER_AUTH_URL`               | Usually same as `BETTER_AUTH_URL`                                                                   |

## Scripts

```bash
npm run dev -w web    # from repo root
npm run dev           # from this folder
```

## Flow

1. Users sign in with Google via Better Auth (`/api/auth/*`).
2. Dashboard **keys** and **usage**: browser calls `/api/keys/*` and `/api/metrics/*` on this origin; Next **rewrites** to Express with the session cookie.
3. **Verify** calls go to the Express app with `x-api-key`; the server records per-user monthly totals (found / not found / failed).
