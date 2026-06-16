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

### pip-audit (API)

`fastapi==0.135.4` with explicit `starlette>=1.3.1` (Starlette 1.x line) clears 2025–2026 advisories including GHSA-wqp7-x3pw-xc5r, GHSA-x746-7m8f-x49c, GHSA-82w8-qh3p-5jfq, and GHSA-jp82-jpqv-5vv3. `python-dotenv` is pinned at `1.2.2`.

## Score integrity

`POST /runs` requires `run_started_at` / `run_ended_at` (unix seconds) and `run_duration_ms` (true elapsed play time in milliseconds). The unix-second timestamps gate the session window (`run_started_at >= auth_date`) and clock skew only. Tap-rate plausibility uses `run_duration_ms` against a cap of 2× the client tap throttle (120ms → max ~16.7 rungs/s), plus a minimum-duration floor (`rungs × 120ms × 0.85`) that blocks impossible tap density. A consistency check rejects an ms duration that overruns its second window by more than 2s, so a forged long duration inside a short session is caught.

## Production config

API requires explicit `TELEGRAM_WEBAPP_SECRET` when `RAILWAY_ENVIRONMENT` is set.

## Reporting

Report security issues to the repository owner privately — do not open public issues for undisclosed vulnerabilities.
