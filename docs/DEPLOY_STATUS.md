# Production deploy status



Track manual deploy progress for **v1.5.0 → v1.8.4** (current gate per [ROADMAP.md](../ROADMAP.md)). Full steps: [DEPLOY.md](../DEPLOY.md).



**GitHub:** [github.com/DITreneris/ladder](https://github.com/DITreneris/ladder) — `main` pushed.



| Step | Service | Status | URL / notes |

|------|---------|--------|-------------|

| 0 | GitHub | **Done** | [DITreneris/ladder](https://github.com/DITreneris/ladder) — branch `main`, CI on push |

| 0b | Local smoke | **Done** | `scripts/verify-deploy-config.ps1` + `scripts/smoke-local.ps1` passed (2026-05-31) |

| 1 | Supabase migration | **Done** | `001_initial_schema.sql` — `users` + `game_runs` verified |

| 2 | Railway API | **Done** | https://ladder-production-642d.up.railway.app — `GET /health` → `{"status":"ok"}` |

| 3 | Vercel Mini App | **Redeploy pending** | https://www.promptanatomy.lol — v1.8.4 hotfix (layout + mechanics); prod still on v1.8.2 bundle until redeploy |

| 4 | Railway Bot | **Done** | `MINI_APP_URL` = Vercel production URL |

| 5 | BotFather | **Done** | Menu button + `/setdomain` |

| 6 | Post-deploy smoke | **Pending v1.8.4** | After Vercel redeploy: health, `/start`, score → Daily LB, layout spot-check on device |

| 7 | v1.6 + v1.7 device QA | **Done** | Milestone chip; death cause + retry tip; Meeting Monday + Reorg Week presets |

| 8 | v1.8 device QA | **Done** | Ticker foreshadow; RE-APPLY counter; LB gap; floor labels; rank props |

| 9 | v1.8.1 redeploy + device QA | **Redeploy Done** / **Device QA Pending** | Prod bundle verified; manual checklist [DEVICE_QA_v1.8.1.md](DEVICE_QA_v1.8.1.md) |

| 10 | v1.8.2 + F&F trust fixes | **Redeploy Done** / **Device QA Pending** | Push `d862c3c` on `main` (2026-06-01); [DEVICE_QA_v1.8.2.md](DEVICE_QA_v1.8.2.md) |

| 11 | v1.8.4 hotfix | **Code Done** / **Deploy Pending** | Layout clip + tutorial coffee + promotion spawn + tap cooldown + imminent reorg UX; `npm test` + `npm run build` green |

**Code readiness:** v1.8.4 hotfix — mini-app lint/test/build 42 passed (2026-06-01). Run `npm run qa:viewport` after preview before device QA.



**Tag sequence:** … → `v1.8.2` → **`v1.8.4`** after device QA → F&F.



After each step, update [DOCS_INDEX.md](../DOCS_INDEX.md) and [README.md](../README.md) live demo table.

