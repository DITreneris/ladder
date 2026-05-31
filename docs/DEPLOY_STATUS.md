# Production deploy status

Track manual deploy progress for **v1.5.0 → v1.7.0** (deploy gate per [ROADMAP.md](../ROADMAP.md)). Full steps: [DEPLOY.md](../DEPLOY.md).

**GitHub:** [github.com/DITreneris/ladder](https://github.com/DITreneris/ladder) — `main` pushed (cold deploy).

| Step | Service | Status | URL / notes |
|------|---------|--------|-------------|
| 0 | GitHub | **Done** | [DITreneris/ladder](https://github.com/DITreneris/ladder) — branch `main`, CI on push |
| 0b | Local smoke | **Done** | `scripts/verify-deploy-config.ps1` + `scripts/smoke-local.ps1` passed (2026-05-31) |
| 1 | Supabase migration | **Done** | `001_initial_schema.sql` — `users` + `game_runs` verified |
| 2 | Railway API | Pending | Set `TELEGRAM_*`, `SUPABASE_*` from `.env.example` |
| 3 | Vercel Mini App | Pending | Root `apps/mini-app`; `VITE_API_URL`, `VITE_BOT_USERNAME`, `VITE_PROMPT_ANATOMY_URL` |
| 4 | Railway Bot | Pending | `MINI_APP_URL` = Vercel production URL |
| 5 | BotFather | Pending | Menu button + `/setdomain` |
| 6 | Post-deploy smoke | Pending | Health, `/start`, score → Daily LB, share with `Shift:` line |
| 7 | v1.6 + v1.7 device QA | Pending | Milestone chip; death cause + retry tip; Meeting Monday + Reorg Week presets |

**Code readiness:** deploy configs verified; local CI parity (pytest, lint, test, build) green.

**Tag sequence:** `v1.5.0` → `v1.6.0` → `v1.7.0` after device QA (see ROADMAP deploy gate).

After each step, update [DOCS_INDEX.md](../DOCS_INDEX.md) and [README.md](../README.md) live demo table.
