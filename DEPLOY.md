# Deploy checklist (GitHub-tracked lean runbook)

Full cold-deploy steps live in local `DEPLOY.md` when available. This file covers the minimum production gate.

## Prerequisites

1. Supabase project with migrations applied in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_v2_hardening.sql` (required — `submit_cooldowns`, `api_sessions`)
   - `supabase/migrations/003_leaderboard_rpc.sql` (recommended — leaderboard RPC)
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

## Smoke (CI parity)

From repo root:

```bash
bash scripts/smoke-ci.sh
```

Or run the same commands as [.github/workflows/ci.yml](.github/workflows/ci.yml).

## Post-deploy

- Open Mini App from `@CorporateLadder_bot`
- Play one run; confirm score on Daily leaderboard
- Test native share in a group chat
- On Synergy Sprint days, submit requires `sprint_mode: true`

## Security

See [SECURITY.md](SECURITY.md) for dependency scanning and secret handling.
