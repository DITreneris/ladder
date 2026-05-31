# Cold deploy — DITreneris/ladder

Repo: [github.com/DITreneris/ladder](https://github.com/DITreneris/ladder) (branch `main`)

Complete these in order. Copy values from your root `.env` (from `.env.example`).

## 1. Supabase

1. [supabase.com](https://supabase.com) → New project
2. SQL Editor → paste and run `supabase/migrations/001_initial_schema.sql`
3. Settings → API → copy `SUPABASE_URL` and `service_role` key (not anon)

## 2. Railway — API

1. [railway.app](https://railway.app) → New Project → **Deploy from GitHub repo**
2. Select **DITreneris/ladder**
3. Service settings → **Root Directory:** `packages/api`
4. Variables:

| Variable | Value |
|----------|-------|
| `TELEGRAM_BOT_TOKEN` | BotFather |
| `TELEGRAM_WEBAPP_SECRET` | Same as bot token |
| `SUPABASE_URL` | From step 1 |
| `SUPABASE_SERVICE_ROLE_KEY` | From step 1 |

5. Deploy → copy public URL → test `GET {URL}/health` → `{"status":"ok"}`

## 3. Vercel — Mini App

1. [vercel.com](https://vercel.com) → Add New → Project → Import **DITreneris/ladder**
2. **Root Directory:** `apps/mini-app` (Edit → monorepo)
3. Framework: Vite (auto)
4. Environment variables:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | Railway API URL from step 2 |
| `VITE_BOT_USERNAME` | Bot username without `@` |
| `VITE_PROMPT_ANATOMY_URL` | `https://www.promptanatomy.app` (optional) |

5. Deploy → copy production URL (e.g. `https://ladder-xxx.vercel.app`)

## 4. Railway — Bot

1. Same Railway project → **New Service** → GitHub repo **DITreneris/ladder**
2. **Root Directory:** `apps/bot`
3. Variables:

| Variable | Value |
|----------|-------|
| `TELEGRAM_BOT_TOKEN` | BotFather |
| `MINI_APP_URL` | Vercel URL from step 3 (no trailing slash) |

4. Deploy

## 5. BotFather

1. [@BotFather](https://t.me/BotFather) → `/mybots` → your bot
2. **Menu Button** → Configure → Mini App URL = Vercel production URL
3. `/setdomain` → add your Vercel hostname if required

## 6. Verify

- `/start` in Telegram → **Punch In & Climb** opens mini app
- Play one run → score on **Daily** leaderboard
- Share button works
- Update production URLs in [DOCS_INDEX.md](../DOCS_INDEX.md) and [README.md](../README.md)

## CLI alternative (optional)

```powershell
# After: npm i -g vercel @railway/cli
vercel login
railway login

# Vercel (from apps/mini-app)
cd apps/mini-app
vercel link
vercel env add VITE_API_URL
vercel env add VITE_BOT_USERNAME
vercel --prod

# Railway (per service, set root dir in dashboard or railway.toml path)
cd packages/api
railway link
railway up
```

Railway CLI requires linking each service (`packages/api` and `apps/bot`) separately with the correct root directory.
