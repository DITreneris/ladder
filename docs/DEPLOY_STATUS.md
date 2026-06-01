# Production deploy status



Track manual deploy progress for **v1.5.0 → v1.8.4** (current gate per [ROADMAP.md](../ROADMAP.md)). Full steps: [DEPLOY.md](../DEPLOY.md).



**GitHub:** [github.com/DITreneris/ladder](https://github.com/DITreneris/ladder) — `main` pushed.



| Step | Service | Status | URL / notes |

|------|---------|--------|-------------|

| 0 | GitHub | **Done** | [DITreneris/ladder](https://github.com/DITreneris/ladder) — branch `main`, CI on push |

| 0b | Local smoke | **Done** | `scripts/verify-deploy-config.ps1` + `scripts/smoke-local.ps1` passed (2026-05-31) |

| 1 | Supabase migration | **Done** | `001_initial_schema.sql` — `users` + `game_runs` verified |

| 2 | Railway API | **Done** | https://ladder-production-642d.up.railway.app — `GET /health` → `{"status":"ok"}` |

| 3 | Vercel Mini App | **Redeploy Done** | https://www.promptanatomy.lol — bundle `main-BVz1aF34.js` (2026-06-01); reaction/layout hotfix pending next deploy |

| 4 | Railway Bot | **Done** | `MINI_APP_URL` = Vercel production URL |

| 5 | BotFather | **Done** | Menu button + `/setdomain`; botpic uploaded manually (briefcase mark); Description/About/Commands — paste from [DEPLOY.md](../DEPLOY.md) |

| 6 | Post-deploy smoke | **Local Done** / **Prod manual pending** | Local: smoke-local + viewport QA + API health `{"status":"ok"}` (2026-06-01). After Vercel redeploy: `/start`, score → Daily LB, share clipboard on device |

| 7 | v1.6 + v1.7 device QA | **Done** | Milestone chip; death cause + retry tip; Meeting Monday + Reorg Week presets |

| 8 | v1.8 device QA | **Done** | Ticker foreshadow; RE-APPLY counter; LB gap; floor labels; rank props |

| 9 | v1.8.1 redeploy + device QA | **Redeploy Done** / **Device QA Pending** | Prod bundle verified; manual checklist [DEVICE_QA_v1.8.1.md](DEVICE_QA_v1.8.1.md) |

| 10 | v1.8.2 + F&F trust fixes | **Redeploy Done** / **Device QA Pending** | Push `d862c3c` on `main` (2026-06-01); [DEVICE_QA_v1.8.2.md](DEVICE_QA_v1.8.2.md) |

| 11 | v1.8.5 corridor + tutorial | **Tagged** / **Live** | Tag `v1.8.5` on `46abf19`; prod `main-7DTXR6XJ.js`; DEVICE_QA rows 1–5 signed |
| 12 | v1.9.0 near-miss + Synergy Sprint | **Code Done** / **Deploy Pending** | `[Unreleased]` — bundle `main-BOIp6dYp.js`; redeploy + F&F review 2026-06-14 |

**Tag sequence:** … → `v1.8.5` (done) → F&F → **`v1.9.0`** after Jun 14 review.



After each step, update [DOCS_INDEX.md](../DOCS_INDEX.md) and [README.md](../README.md) live demo table.

