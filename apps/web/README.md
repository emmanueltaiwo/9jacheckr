# Web

Next.js site, `/login` (Google), `/dashboard` (API keys + verify example).

**Env:** `apps/web/.env.local` — `NEXT_PUBLIC_API_BASE_URL` = API origin (same as server `BETTER_AUTH_URL`, no trailing slash). Server `WEB_APP_URL` should match this app (e.g. `http://localhost:3000`).

```bash
npm run dev -w web
```
