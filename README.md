# 9ja Checkr

Look up **NAFDAC registration numbers** and get product details as **JSON**—through an HTTP API, a web dashboard, or a Telegram bot.

---

## How the NAFDAC lookup works

This is the part people ask about most.

**We do not use a NAFDAC “developer API” or a special data feed.** NAFDAC exposes a **public web tool** where anyone can enter a registration number and see whether a product is on the register. Our server **uses that same public flow**: it submits the number the way a browser would, reads the **HTML page** NAFDAC sends back, and **extracts** the fields we need (name, manufacturer, category, dates, ingredients, etc.).

In plain steps:

1. **Request** — Your client calls our API with a NAFDAC number (e.g. `GET /api/verify/01-5713` with an API key).
2. **Our server → NAFDAC** — The backend sends an **HTTP POST** to NAFDAC’s verification URL with the certificate number and the same kind of **form data** their site expects (including things like an anti-forgery token and session cookie). Those are **configuration values** in the server environment, not secrets inside this repo.
3. **Response** — NAFDAC returns a **web page** (HTML), not JSON. We **parse** that HTML to build a structured product record.
4. **Your client** — We return that record as **JSON** from our API.

So technically: **automation of NAFDAC’s public verification page + HTML parsing**.

**Things to be aware of**

- If NAFDAC **changes their page layout**, our parser may break until it’s updated.
- We **store** successful results in our database so we don’t hit NAFDAC on every repeat request. That’s an optimization on top of the flow above.

Relevant code: `apps/server/src/utils/nafdacRegistrationClient.ts` (request) and `apps/server/src/utils/nafdacHtmlParser.ts` (parsing).

---

## Technical design (high level)

| Piece        | Role |
| ------------ | ---- |
| **Web**      | Next.js marketing site, login (Google via Better Auth on the API), dashboard (API keys, usage). |
| **Server**   | Express: verify route, optional Mongo cache, Better Auth + API keys, bot hooks. |
| **Bot**      | Telegram bot that calls the API with an internal token. |
| **MongoDB**  | Products (cached lookups), users/sessions (auth), API keys, usage metrics, bot data. |

Clients talk **only to our API**. The API is the only part that talks to NAFDAC’s portal (when a number isn’t already cached).

---

## Run locally

```bash
npm install
npm run dev -w web     # site + dashboard
npm run dev -w server  # API
npm run dev -w bot     # Telegram
```

Env vars: see each app’s **`README.md`** (`apps/web`, `apps/server`, `apps/bot`).
