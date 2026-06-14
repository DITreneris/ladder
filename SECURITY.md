# Security

## Secrets

- Never commit `.env` or service role keys.
- `TELEGRAM_BOT_TOKEN` and `SUPABASE_SERVICE_ROLE_KEY` stay on Railway only.
- Mini-app uses `VITE_*` public variables only — no Supabase anon key in the client.

## Dependency scanning

CI runs on every push to `main`:

- `pip-audit -r packages/api/requirements.txt`
- `npm audit --audit-level=high` in `apps/mini-app`

Dependabot is configured in [.github/dependabot.yml](.github/dependabot.yml) for weekly pip/npm updates.

## Score integrity

`POST /runs` requires `run_started_at` and `run_ended_at` (unix seconds). Plausibility checks use run duration and minimum tap-interval floor — not Telegram session idle time alone.

## Production config

API requires explicit `TELEGRAM_WEBAPP_SECRET` when `RAILWAY_ENVIRONMENT` is set.

## Reporting

Report security issues to the repository owner privately — do not open public issues for undisclosed vulnerabilities.
