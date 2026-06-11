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
3. On launch: `POST /auth/me` validates identity, returns profile + best score + **`session_token`**
4. Player completes run → `POST /runs` with `initData` + run payload (optional `sprint_mode`)
5. API validates HMAC, plausibility-checks score, writes to Supabase
6. Leaderboard: `GET /leaderboard?period=daily|weekly`; self highlight via `POST /leaderboard/me` with `session_token`

**Group chat (multi-bot)**

1. User sends `/go@bot` or `/play@bot` (avoid bare `/start` when another bot shares it)
2. Bot replies with inline **URL** button `https://t.me/bot?startapp` — Telegram rejects `web_app` buttons in groups (`BUTTON_TYPE_INVALID`)
3. Steps 2–6 same as private once Mini App opens

**Ops audit:** `python scripts/ff-metrics.py` — Supabase row counts + prod `POST /auth/me` and `/runs` probe (`submit_pipeline_ok`, `migration_002_ok`).

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
| `CORS_ORIGINS` | Railway API | Optional allowlist override (prod + local dev defaults in code) |
| `VITE_API_URL` | Vercel | Frontend → API base URL |
| `VITE_BOT_USERNAME` | Vercel | Share deep links (`CorporateLadder_bot`) |
| `VITE_PROMPT_ANATOMY_URL` | Vercel | Prompt Anatomy co-branding link (optional; defaults in `lib/branding.ts`) |
| `VITE_TELEGRAM_ANALYTICS_TOKEN` | Vercel | Optional TON Builders Analytics SDK token |
| `VITE_TELEGRAM_ANALYTICS_APP_NAME` | Vercel | Optional; defaults to `corporate_ladder` |
| `VITE_ADSGRAM_REVIVE_ENABLED` | Vercel | Enable rewarded revive flow (test without Block ID) |
| `VITE_ADSGRAM_BLOCK_ID` | Vercel | AdsGram Reward block ID for live ads |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/auth/me` | Validate initData, return user profile + `session_token` |
| POST | `/runs` | Submit game result (`initData`, optional `sprint_mode`) |
| GET | `/leaderboard?period=daily\|weekly&limit=50` | Leaderboard entries (no auth in URL) |
| POST | `/leaderboard/me` | Current user rank highlight via `session_token` |

## Security

- All score writes go through API with service role key
- Client never holds Supabase credentials
- Telegram `initData` HMAC validated on every authenticated request
- Score sanity checks: bounds, rung count consistency, plausibility cap, rate limiting

### Known limits (v2.0)

- **Client-trusted scores:** API validates rung count vs years, rank enum, session duration, and `sprint_mode` — but does not verify replay or max rungs/sec (v1.1 anti-cheat deferred).
- **Leaderboard aggregation:** Fetches up to **2000** rows, dedupes best run per user in Python — not SQL window functions.
- **v1.6 behavioral guarantees (client):** reorg fairness (next rung exempt from swap); Intern tutorial ramp (lower spawn rate, guaranteed coffee). Documented for debug context; not server-enforced.

### Rate limiting (v2.0)

`POST /runs` uses Supabase **`submit_cooldowns`** table (migration `002_v2_hardening.sql`) for shared 10s cooldown across Railway workers. In-memory fallback in `runs.py` when table unavailable (tests/dev).

Session tokens stored in **`api_sessions`**; expired rows and excess per-user tokens (max 3) pruned on `/auth/me`.

## Local Development

```bash
# Terminal 1 — API
cd packages/api
python -m venv .venv && .venv\Scripts\activate  # Windows
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

1. **Supabase**: Create project, run `001_initial_schema.sql` + `002_v2_hardening.sql`
2. **Railway**: Deploy `packages/api` (Dockerfile), set env vars
3. **Railway**: Deploy `apps/bot` as separate service or shared
4. **Vercel**: Connect repo, root `apps/mini-app`, set `VITE_*` env vars
5. **BotFather**: Set Mini App URL, menu button
