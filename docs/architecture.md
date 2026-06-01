# Corporate Ladder — Architecture

## Stack

| Layer | Technology | Host |
|-------|------------|------|
| Mini App | TypeScript, Vite, Tailwind | Vercel |
| API | Python, FastAPI | Railway |
| Bot | Python, aiogram | Railway |
| Database | PostgreSQL | Supabase |

## Repository Layout

```
069_ladder/
├── apps/mini-app/     → Vercel (frontend)
├── apps/bot/          → Railway (Telegram bot)
├── packages/api/      → Railway (REST API)
└── supabase/          → Migrations + local dev
```

## Data Flow

**Private chat**

1. User opens bot → `/start` (or Menu Button) → inline **WebApp** button → Mini App (Vercel)
2. Mini App loads Telegram WebApp SDK, reads `initData`
3. On launch: `POST /auth/me` validates identity, returns profile + best score
4. Player completes run → `POST /runs` with `initData` + run payload
5. API validates HMAC, sanity-checks score, writes to Supabase
6. Leaderboard: `GET /leaderboard?period=daily|weekly` (optional `initData` for current-user row highlight)

**Group chat (multi-bot)**

1. User sends `/go@bot` or `/play@bot` (avoid bare `/start` when another bot shares it)
2. Bot replies with inline **URL** button `https://t.me/bot?startapp` — Telegram rejects `web_app` buttons in groups (`BUTTON_TYPE_INVALID`)
3. Steps 2–6 same as private once Mini App opens

**Ops audit:** `python scripts/ff-metrics.py` — Supabase row counts + prod `POST /auth/me` and `/runs` probe (`submit_pipeline_ok`).

## Environment Variables

All services can read a **single repo root** `.env` (see [.env.example](../.env.example)). Optional sync into service dirs: `scripts/setup-env.ps1` / `scripts/setup-env.sh`.

| Variable | Where | Purpose |
|----------|-------|---------|
| `TELEGRAM_BOT_TOKEN` | Railway (API + Bot) | Bot authentication |
| `TELEGRAM_WEBAPP_SECRET` | Railway API | initData HMAC validation (same as bot token) |
| `SUPABASE_URL` | Railway API | Database URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Railway API | Server-side writes (bypasses RLS) |
| `MINI_APP_URL` | Railway Bot | Vercel production URL for private-chat `web_app` button |
| `MINI_APP_SHORT_NAME` | Railway Bot | Optional BotFather direct-link short name → `t.me/bot/appname` in groups |
| `VITE_API_URL` | Vercel | Frontend → API base URL |
| `VITE_BOT_USERNAME` | Vercel | Share deep links |
| `VITE_PROMPT_ANATOMY_URL` | Vercel | Prompt Anatomy co-branding link (optional; defaults in `lib/branding.ts`) |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/auth/me` | Validate initData, return user profile |
| POST | `/runs` | Submit game result |
| GET | `/leaderboard?period=daily\|weekly&limit=50&initData=...` | Leaderboard entries; optional initData marks current user |

## Security

- All score writes go through API with service role key
- Client never holds Supabase credentials
- Telegram `initData` HMAC validated on every authenticated request
- Score sanity checks: bounds, rung count consistency, rate limiting

### Known limits (v1)

- **Client-trusted scores:** API validates rung count vs years and rank enum, but does not verify replay or max rungs/sec (v1.1 anti-cheat deferred).
- **Leaderboard aggregation:** Fetches up to 500 rows, dedupes best run per user in Python — not SQL window functions.
- **v1.6 behavioral guarantees (client):** reorg fairness (next rung exempt from swap); Intern tutorial ramp (lower spawn rate, guaranteed coffee). Documented for debug context; not server-enforced.

### Rate limiting (v1)

`POST /runs` uses an in-memory per-user cooldown (`packages/api/app/routes/runs.py`). This is acceptable for a single Railway replica at MVP scale. If you scale to multiple API instances, move cooldown state to Redis or Postgres before increasing replicas.

## Local Development

```bash
# Terminal 1 — API
cd packages/api
python -m venv .venv && .venv/Scripts/activate  # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Terminal 2 — Bot
cd apps/bot
pip install -r requirements.txt
python main.py

# Terminal 3 — Mini App
cd apps/mini-app
npm install && npm run dev
```

## Deployment

1. **Supabase**: Create project, run migrations from `supabase/migrations/`
2. **Railway**: Deploy `packages/api` (Dockerfile), set env vars
3. **Railway**: Deploy `apps/bot` as separate service or shared
4. **Vercel**: Connect repo, root `apps/mini-app`, set `VITE_*` env vars
5. **BotFather**: Set Mini App URL, menu button
