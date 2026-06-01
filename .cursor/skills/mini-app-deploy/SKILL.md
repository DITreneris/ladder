---
name: mini-app-deploy
description: Deploy Corporate Ladder to Vercel, Railway, Supabase, and BotFather. Use when setting up production, configuring env vars, or first launch.
---

# Mini App Deploy Checklist

**Human checklist:** [DEPLOY.md](../../DEPLOY.md). **Current gate:** [ROADMAP.md](../../ROADMAP.md) Status + [docs/DEPLOY_STATUS.md](../../docs/DEPLOY_STATUS.md) — tag `v1.8.5` after [DEVICE_QA_v1.8.5](../../docs/DEVICE_QA_v1.8.5.md); then [FF_EXECUTION](../../docs/FF_EXECUTION.md).

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
2. Environment variables: `TELEGRAM_BOT_TOKEN`, `MINI_APP_URL` = Vercel production URL; optional `MINI_APP_SHORT_NAME` for group direct links
3. Deploy — **one replica** only (duplicate polling → `TelegramConflictError`)

**Groups:** bot sends `t.me/bot?startapp` URL button (not `web_app`). Test with `/go@bot`. See [DEPLOY.md](../../DEPLOY.md) § Group chats.

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

CI parity ([.github/workflows/ci.yml](../../.github/workflows/ci.yml)): API `pytest`, bot import, mini-app `lint` + `test` + `build` + `qa:viewport` + `qa:layout` + `verify:og`.

## Step 7: Post-deploy verify

- [ ] `GET {API_URL}/health` returns ok
- [ ] `python scripts/ff-metrics.py` → `submit_pipeline_ok: true`
- [ ] `/start` (private) and `/go@bot` (group) show "Punch In & Climb"
- [ ] Mini App loads inside Telegram
- [ ] Complete a run, score appears on Daily leaderboard
- [ ] Weekly tab loads
- [ ] Share button works (native or clipboard fallback)
- [ ] v1.6: milestone chip during play; death cause + retry tip on game over
- [ ] v1.8.2+: responsive ladder width; score-submit error toasts; share includes `Shift:` line
- [ ] v1.8.3: `#gameContentColumn` — HUD + play + tap share one gutter width
- [ ] v1.8.4: REJECTED stamp visible; Frozen badge on imminent reorg; career high only after successful submit
- [ ] v1.8.5: center corridor start; scripted tutorial (meeting RIGHT → coffee LEFT); gate/plant obstacles at rank
- [ ] `npm run qa:layout` passes (play width stable after first tap)
- [ ] Prompt Anatomy footer opens co-branding URL

## Local Dev Env

```env
VITE_API_URL=http://localhost:8000
MINI_APP_URL=http://localhost:5173
```

Use ngrok or Telegram test environment for local Mini App testing with real initData.
