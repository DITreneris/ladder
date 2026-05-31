---
name: mini-app-deploy
description: Deploy Corporate Ladder to Vercel, Railway, Supabase, and BotFather. Use when setting up production, configuring env vars, or first launch.
---

# Mini App Deploy Checklist

**Human checklist:** [DEPLOY.md](../../DEPLOY.md). **Release train:** [ROADMAP.md](../../ROADMAP.md) — tag v1.5.0 + v1.6.0 after device QA.

## Prerequisites

- GitHub repo pushed
- Telegram bot created via @BotFather
- Supabase project created
- Local preflight passes (see below)

## Environment (root `.env`)

Copy [.env.example](../../.env.example) to repo root `.env`. All services read this file. Optional sync: `scripts/setup-env.ps1` or `scripts/setup-env.sh`.

| Variable | Service |
|----------|---------|
| `TELEGRAM_BOT_TOKEN` | API + Bot |
| `TELEGRAM_WEBAPP_SECRET` | API |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | API |
| `MINI_APP_URL` | Bot |
| `VITE_API_URL`, `VITE_BOT_USERNAME`, `VITE_PROMPT_ANATOMY_URL` | Mini App (Vercel) |

`VITE_PROMPT_ANATOMY_URL` is optional — defaults to `https://www.promptanatomy.app` in code.

## Step 1: Supabase

1. Create project
2. SQL Editor → run `supabase/migrations/001_initial_schema.sql`
3. Save `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`

## Step 2: Railway API

1. New Project → Deploy from GitHub → `packages/api`
2. Environment variables: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBAPP_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
3. Deploy, note public URL (e.g. `https://api-xxx.railway.app`)
4. Verify: `GET {API_URL}/health` → `{"status":"ok"}`

## Step 3: Vercel Mini App

1. Import GitHub repo
2. Root Directory: `apps/mini-app`
3. Environment variables: `VITE_API_URL`, `VITE_BOT_USERNAME`, `VITE_PROMPT_ANATOMY_URL` (optional)
4. Deploy, note production URL

## Step 4: Railway Bot

1. New Service → `apps/bot`
2. Environment variables: `TELEGRAM_BOT_TOKEN`, `MINI_APP_URL` = Vercel production URL
3. Deploy

## Step 5: BotFather

1. `/mybots` → select bot → Bot Settings → Menu Button → Configure
2. Set Mini App URL to Vercel production URL
3. `/setdomain` if required for your domain

## Step 6: Preflight & smoke

From repo root:

```powershell
.\scripts\verify-deploy-config.ps1
.\scripts\smoke-local.ps1
```

CI parity ([.github/workflows/ci.yml](../../.github/workflows/ci.yml)): API `pytest`, bot import, mini-app `lint` + `test` + `build` + viewport QA.

## Step 7: Post-deploy verify

- [ ] `GET {API_URL}/health` returns ok
- [ ] `/start` in Telegram shows "Punch In & Climb" button
- [ ] Mini App loads inside Telegram
- [ ] Complete a run, score appears on Daily leaderboard
- [ ] Weekly tab loads
- [ ] Share button works (native or clipboard fallback)
- [ ] v1.6: milestone chip during play; death cause + retry tip on game over
- [ ] Prompt Anatomy footer opens co-branding URL

## Local Dev Env

```env
VITE_API_URL=http://localhost:8000
MINI_APP_URL=http://localhost:5173
```

Use ngrok or Telegram test environment for local Mini App testing with real initData.
