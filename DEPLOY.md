# Deploy Guide — Corporate Ladder

Cold-deploy checklist for Supabase, Railway (API + bot), Vercel (mini-app), and BotFather.

**Deep reference:** [.cursor/skills/mini-app-deploy/SKILL.md](.cursor/skills/mini-app-deploy/SKILL.md) · **Doc map:** [DOCS_INDEX.md](DOCS_INDEX.md) · **First publish:** [docs/COLD_DEPLOY.md](docs/COLD_DEPLOY.md)

## Prerequisites

- [ ] GitHub repo pushed — [github.com/DITreneris/ladder](https://github.com/DITreneris/ladder)
- [ ] Telegram bot created via [@BotFather](https://t.me/BotFather)
- [ ] Supabase project created
- [ ] Local preflight passes (see [Local preflight](#local-preflight))

## 1. Supabase

1. Create project at [supabase.com](https://supabase.com).
2. SQL Editor → run [supabase/migrations/001_initial_schema.sql](supabase/migrations/001_initial_schema.sql).
3. **v2.0+:** run [supabase/migrations/002_v2_hardening.sql](supabase/migrations/002_v2_hardening.sql) (`submit_cooldowns`, `api_sessions`).
4. Save `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (Settings → API).

## 2. Railway — API

1. New Project → Deploy from GitHub → root/service: `packages/api` (uses Dockerfile + `railway.toml`).
2. Environment variables:

| Variable | Value |
|----------|-------|
| `TELEGRAM_BOT_TOKEN` | From BotFather |
| `TELEGRAM_WEBAPP_SECRET` | Same as bot token (initData HMAC) |
| `SUPABASE_URL` | Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key |
| `CORS_ORIGINS` | Optional comma list (default: prod Vercel + local dev) |

3. Deploy and note the public URL (e.g. `https://api-xxx.up.railway.app`).
4. Verify: `GET {API_URL}/health` returns `{"status":"ok"}`.

## 3. Vercel — Mini App

1. Import GitHub repo.
2. Configure:

| Setting | Value |
|---------|-------|
| Framework Preset | Vite |
| Root Directory | `apps/mini-app` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

3. Environment variables:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | Railway API URL from step 2 |
| `VITE_BOT_USERNAME` | Bot username without `@` |
| `VITE_PROMPT_ANATOMY_URL` | Optional — Prompt Anatomy co-branding (defaults in code) |
| `VITE_TELEGRAM_ANALYTICS_TOKEN` | TON Builders → Analytics Keys → SDK token (eye icon) — activates Telegram catalog analytics |
| `VITE_TELEGRAM_ANALYTICS_APP_NAME` | Optional — must be exactly `corporate_ladder` if set (defaults in code) |
| `VITE_ADSGRAM_REVIVE_ENABLED` | Optional — `true` enables rewarded revive UI (test without ads when Block ID unset) |
| `VITE_ADSGRAM_BLOCK_ID` | Optional — AdsGram Reward block ID from [partner.adsgram.ai](https://partner.adsgram.ai) (live ads) |

**AdsGram setup (operator):** On platform → **+ Block** → type **Reward** → name `revive-game-over` → moderation via @adsgramsupport → copy Block ID into `VITE_ADSGRAM_BLOCK_ID`.

**Test revive now:** set `VITE_ADSGRAM_REVIVE_ENABLED=true` in root `.env` (and Vercel). Without Block ID, the HR Training button restores the run instantly (no ad). Add Block ID when moderation passes for live rewarded ads.

**Paid acquisition (buying players):** separate from Reward blocks — deferred until public launch GO; see [docs/ads-acquisition-plan.md](docs/ads-acquisition-plan.md).

4. Deploy and note production URL (e.g. `https://www.promptanatomy.lol`).
5. **Web Analytics:** Project → **Analytics** tab → **Enable** (required for `@vercel/analytics` page views on production).
6. **TON Analytics:** After deploy, open the mini-app from the bot once; TON Builders → Analytics Keys should leave “Waiting for SDK”.
7. **SEO / crawlers:** Confirm static assets (not SPA HTML):
   ```bash
   curl -sfI https://www.promptanatomy.lol/sitemap.xml | head -1   # HTTP/2 200
   curl -sf https://www.promptanatomy.lol/sitemap.xml | head -3    # <?xml ...
   curl -sf https://www.promptanatomy.lol/robots.txt | grep Sitemap
   curl -sf https://www.promptanatomy.lol/llms.txt | head -1      # # Corporate Ladder
   ```
   Resubmit `https://www.promptanatomy.lol/sitemap.xml` in Google Search Console after a fix deploy.

## 4. Railway — Bot

1. New Service → `apps/bot` (Dockerfile + `railway.toml`).
2. Environment variables:

| Variable | Value |
|----------|-------|
| `TELEGRAM_BOT_TOKEN` | From BotFather |
| `MINI_APP_URL` | Vercel production URL from step 3 |
| `MINI_APP_SHORT_NAME` | Optional — BotFather direct-link short name for group `t.me/bot/app` buttons |

3. Deploy. **Run exactly one bot replica** — two polling processes on the same token cause `TelegramConflictError` in logs.

**Groups:** Telegram allows `web_app` inline buttons **only in private chat**. In groups the bot sends a `t.me/...?startapp` URL button instead (see `apps/bot/main.py`).

## 5. BotFather

1. `/mybots` → your bot → **Bot Settings** → **Menu Button** → Configure.
2. Set Mini App URL to the Vercel production URL.
3. `/setdomain` — add your Vercel domain if required for WebApp.

### Profile copy (paste in BotFather)

**Botpic:** briefcase on brand gradient (matches [`apps/mini-app/public/favicon.svg`](apps/mini-app/public/favicon.svg)). Upload 512×512 PNG manually in Bot Settings → Edit Botpic.

**Description** (`/setdescription`):

```
Satirical office climb game in Telegram. Tap left or right on each rung — dodge meetings, reorgs, and deadlines. Compete on Daily and Weekly leaderboards. Open the app and punch in.
```

**About** (`/setabout`, ≤120 chars — plain text only; no OG image in profile; link preview when URL is shared in chat):

```
Climb the ladder in Telegram. Dodge meetings. https://www.promptanatomy.lol
```

**Commands** (`/setcommands`):

```
start - Open Corporate Ladder and punch in
go - Open the app (use in groups with other bots)
play - Same as start
help - How to play in 30 seconds
```

After Railway bot redeploy, smoke `/start`, `/go`, `/play`, and `/help` — each should show **Punch In & Climb** and today's shift label should match the in-app pill.

## Group chats (multi-bot)

Telegram **does not allow** `web_app` inline buttons in groups/supergroups (`BUTTON_TYPE_INVALID`). Private chat uses a WebApp button; groups use a **`t.me/bot?startapp`** URL button (see `apps/bot/main.py`).

| Context | Launch command | Button type |
|---------|----------------|-------------|
| Private DM | `/start`, `/play`, or Menu Button | WebApp (`web_app`) |
| Group with other bots | `/go@YourBot` or `/play@YourBot` | URL (`t.me/...?startapp`) |

**Setup checklist (groups):**

1. BotFather → `/setprivacy` → **Disable** for the game bot
2. BotFather → `/setcommands` — include `go` (see above)
3. If Rose (or similar) is in the group → allowlist the game bot
4. Railway bot service → **one replica** only (avoid `TelegramConflictError` from duplicate polling)
5. Do **not** tap the plain mini-app URL in the bot message body — use **Punch In & Climb**

**Smoke in group:** `/go@YourBot` → welcome + Punch In → complete one run → `python scripts/ff-metrics.py` shows new `game_runs` row.

## 6. Post-deploy verification

- [ ] `GET {API_URL}/health` returns ok over HTTPS
- [ ] `python scripts/ff-metrics.py` → `submit_pipeline_ok: true` (prod `POST /auth/me` + `/runs`; not just health)
- [ ] `/start` (private) and `/go@bot` (group) show **Punch In & Climb** and open the Mini App
- [ ] Mini App loads inside Telegram (not broken blank screen)
- [ ] Complete one run; score appears on **Daily** leaderboard
- [ ] **Weekly** tab loads entries
- [ ] Share button works (native share or clipboard fallback with toast on failure)
- [ ] Header bot handle matches `VITE_BOT_USERNAME`
- [ ] No `TELEGRAM_BOT_TOKEN` or Supabase keys in mini-app bundle (inspect env / build only uses `VITE_*`)

Update production URLs in [DOCS_INDEX.md](DOCS_INDEX.md) when known.

## Local preflight

From repo root:

```powershell
.\scripts\verify-deploy-config.ps1
.\scripts\smoke-local.ps1
```

Unix:

```bash
./scripts/verify-deploy-config.sh
./scripts/smoke-local.sh
```

Smoke runs: API `pytest`, bot import, mini-app `lint` + `test` + `build`, deploy preflight.

## CI parity

GitHub Actions [.github/workflows/ci.yml](.github/workflows/ci.yml) on `main` / PRs:

- `packages/api` — `pytest`
- `apps/bot` — `python -c "import main"`
- `apps/mini-app` — `npm run lint`, `npm test`, `npm run build`

## Local dev env (reference)

Root `.env` (see [.env.example](.env.example)):

```env
VITE_API_URL=http://localhost:8000
MINI_APP_URL=http://localhost:5173
```

Use ngrok or Telegram’s test environment for real `initData` against a local API.

## Troubleshooting

| Symptom | Cause / fix |
|---------|-------------|
| Bot silent in group, `BUTTON_TYPE_INVALID` in Railway logs | Deploy bot with group keyboard fix (`t.me?startapp` URL button); see [Group chats](#group-chats-multi-bot) |
| Bot silent in group, no log line for command | Wrong `@bot` handle, Group Privacy on, or anti-spam (Rose) blocking — use `/go@YourBot`, allowlist bot |
| `TelegramConflictError` in logs | Two processes polling same bot token — one Railway replica; stop local `python main.py`; `deleteWebhook` if set |
| Auth fails / invalid hash | [telegram-initdata-auth](.cursor/skills/telegram-initdata-auth/SKILL.md) |
| Score not on leaderboard | [score-pipeline](.cursor/skills/score-pipeline/SKILL.md); run `python scripts/ff-metrics.py` |
| Slow profile badge on first open | Railway API cold start — optional keep-warm: cron `GET /health` every 5 min, or Railway min instances = 1 |
| Env matrix | [docs/architecture.md](docs/architecture.md) |
