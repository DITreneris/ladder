# Production deploy status



Track manual deploy progress for **v1.5.0 → v1.8.4** (current gate per [ROADMAP.md](../ROADMAP.md)). Full steps: [DEPLOY.md](../DEPLOY.md).



**GitHub:** [github.com/DITreneris/ladder](https://github.com/DITreneris/ladder) — `main` pushed.



| Step | Service | Status | URL / notes |

|------|---------|--------|-------------|

| 0 | GitHub | **Done** | [DITreneris/ladder](https://github.com/DITreneris/ladder) — branch `main`, CI on push |

| 0b | Local smoke | **Done** | `scripts/verify-deploy-config.ps1` + `scripts/smoke-local.ps1` passed (2026-05-31) |

| 1 | Supabase migration | **Done** | `001_initial_schema.sql` — `users` + `game_runs` verified |

| 2 | Railway API | **Done** | https://ladder-production-642d.up.railway.app — `GET /health` → `{"status":"ok"}` |

| 3 | Vercel Mini App | **Redeploy pending** | https://www.promptanatomy.lol — v1.8.4 + trust hotfix; prod still on v1.8.2 bundle until redeploy |

| 4 | Railway Bot | **Done** | `MINI_APP_URL` = Vercel production URL |

| 5 | BotFather | **Done** | Menu button + `/setdomain` |

| 6 | Post-deploy smoke | **Local Done** / **Prod manual pending** | Local: smoke-local + viewport QA + API health `{"status":"ok"}` (2026-06-01). After Vercel redeploy: `/start`, score → Daily LB, share clipboard on device |

| 7 | v1.6 + v1.7 device QA | **Done** | Milestone chip; death cause + retry tip; Meeting Monday + Reorg Week presets |

| 8 | v1.8 device QA | **Done** | Ticker foreshadow; RE-APPLY counter; LB gap; floor labels; rank props |

| 9 | v1.8.1 redeploy + device QA | **Redeploy Done** / **Device QA Pending** | Prod bundle verified; manual checklist [DEVICE_QA_v1.8.1.md](DEVICE_QA_v1.8.1.md) |

| 10 | v1.8.2 + F&F trust fixes | **Redeploy Done** / **Device QA Pending** | Push `d862c3c` on `main` (2026-06-01); [DEVICE_QA_v1.8.2.md](DEVICE_QA_v1.8.2.md) |

| 11 | v1.8.4 hotfix | **Code Done** / **Deploy Pending** | Layout + mechanics + trust UX (game-over I/O, share clipboard, rate limit, LB errors); run smoke before redeploy |

**Code readiness:** v1.8.4 + trust hotfix — run `scripts/smoke-local.ps1`, `pytest`, `npm run lint && npm test && npm run build`, `npm run qa:viewport` before Vercel redeploy.

**Vercel redeploy (manual):** Push commits to `main`, trigger production deploy in Vercel (root `apps/mini-app`), confirm new bundle hash on https://www.promptanatomy.lol (not `main-BO_qJQT_.js`), then hard-reopen Mini App from bot.



**Tag sequence:** … → `v1.8.2` → **`v1.8.4`** after device QA → F&F.



After each step, update [DOCS_INDEX.md](../DOCS_INDEX.md) and [README.md](../README.md) live demo table.

