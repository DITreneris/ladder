# Production deploy status

Track manual deploy progress for **v1.5.0 + v1.6.0** (deploy gate per [ROADMAP.md](../ROADMAP.md)). Full steps: [DEPLOY.md](../DEPLOY.md).

| Step | Service | Status | URL / notes |
|------|---------|--------|-------------|
| 1 | Supabase migration | Pending | Run `supabase/migrations/001_initial_schema.sql` |
| 2 | Railway API | Pending | Set `TELEGRAM_*`, `SUPABASE_*` from `.env.example` |
| 3 | Vercel Mini App | Pending | Root `apps/mini-app`; `VITE_API_URL`, `VITE_BOT_USERNAME`, `VITE_PROMPT_ANATOMY_URL` |
| 4 | Railway Bot | Pending | `MINI_APP_URL` = Vercel production URL |
| 5 | BotFather | Pending | Menu button + `/setdomain` |
| 6 | Post-deploy smoke | Pending | Health, `/start`, score → Daily LB, share |
| 7 | v1.6 QA smoke | Pending | Milestone chip during play; death cause + retry tip on game over; Intern tutorial ramp feels gentler |

**Code readiness:** deploy configs verified (`scripts/verify-deploy-config.ps1` passes).

**Tag sequence:** `v1.5.0` then `v1.6.0` after device QA (see ROADMAP deploy gate).

After each step, update [DOCS_INDEX.md](../DOCS_INDEX.md) and [README.md](../README.md) live demo table.
