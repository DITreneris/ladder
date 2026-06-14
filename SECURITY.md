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

### npm overrides (mini-app)

[`apps/mini-app/package.json`](apps/mini-app/package.json) pins transitive deps until upstream chains ship fixes natively:

- `esbuild@0.28.1` — [GHSA-gv7w-rqvm-qjhr](https://github.com/advisories/GHSA-gv7w-rqvm-qjhr) (vite 6 still resolves `^0.25.x` by default). Vite sets `esbuild.supported.destructuring: true` in [`vite.config.ts`](apps/mini-app/vite.config.ts) because esbuild 0.28+ errors on downlevel targets without it.
- `valibot@1.2.0` — [GHSA-vqpr-j7v3-hqw9](https://github.com/advisories/GHSA-vqpr-j7v3-hqw9) (`@telegram-apps/analytics` chain)

Remove overrides when `npm audit --audit-level=high` passes without them.

## Score integrity

`POST /runs` requires `run_started_at` and `run_ended_at` (unix seconds). Plausibility checks use run duration and minimum tap-interval floor — not Telegram session idle time alone.

## Production config

API requires explicit `TELEGRAM_WEBAPP_SECRET` when `RAILWAY_ENVIRONMENT` is set.

## Reporting

Report security issues to the repository owner privately — do not open public issues for undisclosed vulnerabilities.
