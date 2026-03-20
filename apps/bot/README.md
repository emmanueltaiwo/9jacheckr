# Bot

Telegram bot: `/verify` → API. Uses internal token, not an API key.

**Env:** `apps/bot/.env` — `TELEGRAM_BOT_TOKEN`, `API_BASE_URL`, `BOT_INTERNAL_TOKEN` (must match server).

```bash
npm run dev -w bot
```
