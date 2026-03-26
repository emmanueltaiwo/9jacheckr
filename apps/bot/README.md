# Bot

Telegram bot: `/verify` → API. Uses internal token, not an API key.

Commands: `/start`, `/verify`, `/status`, `/payments` (Bot Pro payment history), `/upgrade`.

**Env:** `apps/bot/.env` — `TELEGRAM_BOT_TOKEN`, `API_BASE_URL`, `BOT_INTERNAL_TOKEN` (must match server). Optional: **`NAFDAC_UNAVAILABLE`** (`1` / `true` / `yes`) — replies with a short downtime message for all messages and callback buttons (payment success messages still pass through). Unset when the API is live again.

```bash
npm run dev -w bot
```
