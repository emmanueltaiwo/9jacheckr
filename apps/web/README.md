# 9ja Checkr — Web app

Next.js (App Router): marketing site, Google sign-in (Better Auth), and dashboard.

The **Express API** (`NEXT_PUBLIC_API_BASE_URL`) serves verify, keys, and metrics. The dashboard calls that base URL directly from the browser.

## Prerequisites

- Node.js 18+
- MongoDB (shared with the API for Better Auth)

## Environment

Use `apps/web/.env.local`.

| Variable                                    | Purpose                                                                                             |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `MONGODB_URI`                               | Same DB as the API (Better Auth)                                                                  |
| `BETTER_AUTH_URL`                           | Public URL of this app (e.g. `http://localhost:3000`)                                               |
| `BETTER_AUTH_SECRET`                        | Strong secret for Better Auth                                                                       |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | OAuth; redirect `…/api/auth/callback/google` on this origin                                         |
| `NEXT_PUBLIC_API_BASE_URL`                  | **Required for dashboard API calls.** Express base, e.g. `http://localhost:4000` (no trailing slash) |
| `NEXT_PUBLIC_BETTER_AUTH_URL`               | Usually same as `BETTER_AUTH_URL`                                                                   |

## Scripts

```bash
npm run dev -w web    # from repo root
npm run dev           # from this folder
```

## Flow

1. Users sign in with Google via Better Auth (`/api/auth/*` on this app).
2. Dashboard **keys** and **usage** call `${NEXT_PUBLIC_API_BASE_URL}/api/keys/*` and `.../api/metrics/*` with `credentials: 'include'`.
3. The API must allow your web origin in CORS (`WEB_APP_URL`) and issue session cookies compatible with cross-origin requests if the web and API hosts differ.
