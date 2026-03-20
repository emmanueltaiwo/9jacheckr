# 9ja Checkr — Telegram bot

Telegraf bot that calls the API to verify NAFDAC numbers users send with `/verify`.

## Prerequisites

- Node.js 18+
- A Telegram bot token from [@BotFather](https://t.me/BotFather)
- The API server running and reachable

## Environment

Set in `apps/bot/.env` (see repo root [`.env.example`](../../.env.example)):

| Variable             | Purpose                                                                    |
| -------------------- | -------------------------------------------------------------------------- |
| `TELEGRAM_BOT_TOKEN` | Bot token from BotFather                                                   |
| `API_BASE_URL`       | Base URL of the API (no trailing slash), e.g. `http://localhost:4000`      |
| `BOT_INTERNAL_TOKEN` | Must match the API’s `BOT_INTERNAL_TOKEN` (sent as `x-internal-bot-token`) |

## Scripts

From the **monorepo root**:

```bash
npm run dev -w bot
```

From **this folder**:

```bash
npm run dev    # tsx watch
npm run build
npm start      # node dist/index.js
```

The bot does not use an API key; it uses the internal token header only.
