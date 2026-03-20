# Server

Express API: NAFDAC verify, Telegram bot hooks, Better Auth (Google), API keys in MongoDB.

**Needs:** Node 20+, MongoDB. Copy `apps/server/.env.example` → `.env`.

**Important vars:** `MONGODB_URI`, `API_KEY_SECRET`, `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `WEB_APP_URL`, `BOT_INTERNAL_TOKEN`.

Google redirect URI: `{BETTER_AUTH_URL}/api/auth/callback/google`

```bash
npm run dev -w server
```
