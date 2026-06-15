# Deploy checklist (GitHub-tracked lean runbook)

Env vars, migration order, and service deploy sequence. **Gate index:** [SHIP_GATES.md](SHIP_GATES.md) Tier B/C.

## Prerequisites

1. Supabase project with migrations applied in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_v2_hardening.sql` (required — `submit_cooldowns`, `api_sessions`)
   - `supabase/migrations/003_leaderboard_rpc.sql` (required — leaderboard RPC)
   - `supabase/migrations/004_leaderboard_public_view.sql` (optional)
2. Verify `migration_002_ok: true` via local `python scripts/ff-metrics.py` (script is local-only).

## Environment variables

| Service | Required |
|---------|----------|
| **API (Railway)** | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBAPP_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| **Bot (Railway)** | `TELEGRAM_BOT_TOKEN`, `MINI_APP_URL`, `PORT` (health probe) |
| **Mini App (Vercel)** | `VITE_API_URL`, `VITE_BOT_USERNAME` |

See [.env.example](.env.example) for the full list.

## Deploy order

1. Confirm Supabase migrations (especially 002 + 003).
2. Deploy **API** (`packages/api`) — `GET /health` must return `{"status":"ok","db":"ok"}`.
3. Deploy **mini-app** (`apps/mini-app`) in the same window as API when score validation changes ship.
4. Deploy **bot** (`apps/bot`) — `GET /health` on bot service port.

## Pre-deploy smoke (Tier B)

```bash
bash scripts/smoke-ci.sh
```

Full Playwright parity: `bash scripts/smoke-ci.sh --full` or wait for CI on the PR ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)).

## Post-deploy

See [SHIP_GATES.md](SHIP_GATES.md) Tier C (health, ff-metrics, bundle hash, Telegram spot check) and Tier D (device QA before launch).

Optional: run [`.github/workflows/prod-smoke.yml`](.github/workflows/prod-smoke.yml) manually after deploy.

## Security

See [SECURITY.md](SECURITY.md) for dependency scanning and secret handling.
