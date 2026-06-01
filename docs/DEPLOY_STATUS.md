# Production deploy status



Track manual deploy progress for **v1.5.0 → v1.8.1** (deploy gate per [ROADMAP.md](../ROADMAP.md)). Full steps: [DEPLOY.md](../DEPLOY.md).



**GitHub:** [github.com/DITreneris/ladder](https://github.com/DITreneris/ladder) — `main` pushed.



| Step | Service | Status | URL / notes |

|------|---------|--------|-------------|

| 0 | GitHub | **Done** | [DITreneris/ladder](https://github.com/DITreneris/ladder) — branch `main`, CI on push |

| 0b | Local smoke | **Done** | `scripts/verify-deploy-config.ps1` + `scripts/smoke-local.ps1` passed (2026-05-31) |

| 1 | Supabase migration | **Done** | `001_initial_schema.sql` — `users` + `game_runs` verified |

| 2 | Railway API | **Done** | https://ladder-production-642d.up.railway.app — `GET /health` → `{"status":"ok"}` |

| 3 | Vercel Mini App | **Done** | https://www.promptanatomy.lol — root `apps/mini-app` |

| 4 | Railway Bot | **Done** | `MINI_APP_URL` = Vercel production URL |

| 5 | BotFather | **Done** | Menu button + `/setdomain` |

| 6 | Post-deploy smoke | **Done** | Health, `/start`, score → Daily LB, share with `Shift:` line |

| 7 | v1.6 + v1.7 device QA | **Done** | Milestone chip; death cause + retry tip; Meeting Monday + Reorg Week presets |

| 8 | v1.8 device QA | **Done** | Ticker foreshadow; RE-APPLY counter; LB gap; floor labels; rank props |

| 9 | v1.8.1 redeploy + device QA | **Redeploy Done** / **Device QA Pending** | Prod bundle verified; manual checklist [DEVICE_QA_v1.8.1.md](DEVICE_QA_v1.8.1.md) |
| 10 | v1.8.2 + F&F trust fixes redeploy | **Redeploy Done** / **Device QA Pending** | Push `d862c3c` on `main` (2026-06-01); prod `main-BO_qJQT_.js`; [DEVICE_QA_v1.8.2.md](DEVICE_QA_v1.8.2.md) + [FF_EXECUTION.md](FF_EXECUTION.md) Phase C |

**Code readiness:** deploy configs verified; local CI parity (pytest 15 passed, lint/test/build 38 passed) green 2026-06-01. F&F trust UX shipped in `[Unreleased]`.



**Tag sequence:** `v1.5.0` → `v1.6.0` → `v1.7.0` → `v1.8.0` (push tags if not on origin) → `v1.8.1` after step 9 → `v1.8.2` after step 10 → F&F.



After each step, update [DOCS_INDEX.md](../DOCS_INDEX.md) and [README.md](../README.md) live demo table.

