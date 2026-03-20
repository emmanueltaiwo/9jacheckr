# 9ja Checkr — Web app

Next.js (App Router): marketing site, Google sign-in, and dashboard.

**Better Auth runs on the API** (`NEXT_PUBLIC_API_BASE_URL`). The browser stores a session cookie (shared across `www` + `api` in production when `AUTH_COOKIE_DOMAIN` is set on the server). The dashboard calls the API with `credentials: 'include'`.

## Prerequisites

- Node.js 18+

## Environment

Use `apps/web/.env.local`.

| Variable                      | Purpose                                                                                                             |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL`    | **Required.** Public API origin, e.g. `http://localhost:4000` or `https://api.9jacheckr.xyz` (no trailing slash)    |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | Same origin as the API (where `/api/auth/*` lives). Defaults to `NEXT_PUBLIC_API_BASE_URL` if unset                 |
| `API_INTERNAL_BASE_URL`       | Optional. Server-side session fetch from Next RSC (e.g. Docker service URL). Defaults to `NEXT_PUBLIC_API_BASE_URL` |

OAuth, `BETTER_AUTH_SECRET`, `MONGODB_URI`, and `AUTH_COOKIE_DOMAIN` are configured on the **API** server, not here.

**Google Cloud Console:** add authorized redirect URI  
`{API_ORIGIN}/api/auth/callback/google` (e.g. `https://api.9jacheckr.xyz/api/auth/callback/google`).

## Scripts

```bash
npm run dev -w web    # from repo root
npm run dev           # from this folder
```

## Flow

1. Users sign in with Google via Better Auth on the API (`authClient` → `/api/auth/*` on the API origin).
2. **Home** and **dashboard layouts** load session by calling `GET /api/auth/get-session` on the API with the incoming `Cookie` header.
3. Dashboard **keys** and **usage** call `${NEXT_PUBLIC_API_BASE_URL}/api/keys/*` and `.../api/metrics/*` with `credentials: 'include'`.
4. The API must set `WEB_APP_URL` for CORS and, in production, `AUTH_COOKIE_DOMAIN` (e.g. `.9jacheckr.xyz`) so the session cookie is sent on credentialed requests from `www` to `api`.
