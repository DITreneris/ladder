# Production deploy status

Track manual deploy progress through **soft-launch GO (2026-06-14)**. Full steps: [DEPLOY.md](../DEPLOY.md) · GO plan: [FF_REVIEW_2026-06-14.md](FF_REVIEW_2026-06-14.md)

**GitHub:** [github.com/DITreneris/ladder](https://github.com/DITreneris/ladder) — `main` pushed.

| Step | Service | Status | URL / notes |
|------|---------|--------|-------------|
| 0 | GitHub | **Done** | [DITreneris/ladder](https://github.com/DITreneris/ladder) — branch `main`, CI on push |
| 0b | Local smoke | **Done** | `scripts/smoke-local.ps1` passed 2026-06-04 (pytest 20, vitest 76) |
| 1 | Supabase migration | **001 Done** / **002 Pending** | Apply `002_v2_hardening.sql` before v2.0 sign-off |
| 2 | Railway API | **Done** | Health ok; `ff-metrics.py` green 2026-06-04 |
| 3 | Vercel Mini App | **Redeploy Done** / **OG pending** | Prod `main-CJgmaRAS.js` (2026-06-04); **redeploy after `public/og.png` adopt** so Telegram/link caches pick up new artwork |
| 4 | Railway Bot | **Done** | `MINI_APP_URL` = Vercel production URL; `@CorporateLadder_bot` |
| 5 | BotFather | **Done** | Menu button + `/setdomain`; paste from [DEPLOY.md](../DEPLOY.md) |
| 6 | Post-deploy smoke | **v1.8.5 Done** | `ff-metrics.py` green 2026-06-04 — re-run after v2.0 deploy |
| 7–11 | v1.6 → v1.8.5 | **Done** | See prior steps; tag `v1.8.5` on `46abf19` |
| 12 | v1.9.0 + F&F UX pack | **Tagged** | [CHANGELOG 1.9.0](../CHANGELOG.md#190---2026-06-14) — redeploy Vercel for prod bundle + OG |
| 13 | v2.0.0 hardening + triage | **Tagged** | Migration `002` verify · [DEVICE_QA_v2.0.md](DEVICE_QA_v2.0.md) |
| 14 | Soft launch GO + tags | **CHANGELOG cut Done** | `v1.9.0` + `v2.0.0` tags on release-cut commit — [FF_REVIEW](FF_REVIEW_2026-06-14.md) §H |
| 15 | Vercel OG redeploy | **Pending** | New `public/og.png` after `npm run adopt:og` — link preview cache |

**Tag sequence:** `v1.8.5` · `v1.9.0` · `v2.0.0` on `origin` — public launch review ~Jun 28.

After each step, update [DOCS_INDEX.md](../DOCS_INDEX.md) and [README.md](../README.md) live demo table.
