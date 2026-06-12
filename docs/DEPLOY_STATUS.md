# Production deploy status

Track manual deploy progress through **soft-launch GO** and **v2.2.0 retention execution plan**. Full steps: [DEPLOY.md](../DEPLOY.md) · GO plan: [FF_REVIEW_2026-06-14.md](FF_REVIEW_2026-06-14.md)

**GitHub:** [github.com/DITreneris/ladder](https://github.com/DITreneris/ladder) — `main` pushed.

| Step | Service | Status | URL / notes |
|------|---------|--------|-------------|
| 0 | GitHub | **Done** | [DITreneris/ladder](https://github.com/DITreneris/ladder) — branch `main`, CI on push |
| 0b | Local smoke | **Done** | pytest 30 + vitest 117 + build 2026-06-11 |
| 1 | Supabase migration | **001 Done** / **002 verify via `ff-metrics`** | `migration_002_ok: true` 2026-06-11 |
| 2 | Railway API | **Done** | Health ok; Director rank validation live |
| 3 | Vercel Mini App | **Done** | v2.2.0 train live 2026-06-11 — `main-C0cdc3so.js` @ `d0c9305`; `/og.png` 200 |
| 4 | Railway Bot | **Done** | `MINI_APP_URL` = Vercel production URL; `@CorporateLadder_bot` |
| 5 | BotFather | **Done** | Menu button + `/setdomain`; paste from [DEPLOY.md](../DEPLOY.md) |
| 6 | Post-deploy smoke | **Done** | `ff-metrics.py` green 2026-06-11 — [FF_METRICS_2026-06-11.md](FF_METRICS_2026-06-11.md) |
| 7–14 | v1.6 → v2.0.0 | **Done** | Tags `v1.8.5` · `v1.9.0` · `v2.0.0` on `origin` |
| 15 | Vercel OG redeploy | **Done** | `/og.png` 200 on prod 2026-06-11 |
| 16 | v2.1.0 retention sprint | **Done** | Tagged `v2.1.0` @ `ddfc968` · live 2026-06-11 |
| 17 | v2.1.1 retention hotfix | **Done** | Tagged `v2.1.1` @ `ddfc968` · live 2026-06-11 |
| 18 | v2.2.0 virality polish | **Done** | Tagged `v2.2.0` @ `ddfc968` · live 2026-06-11 (+ LB stale fix `d0c9305`) |
| 19 | v2.2.1 post-train patch | **Pending prod deploy** | Changelog cut + Status mirrors 2026-06-12 · local smoke green (pytest 41 · vitest 126 · `main-CvPR04Oz.js`) — **deploy Railway API first**, then Vercel; `git tag v2.2.1` after commit + DEVICE_QA |

**Operational debt:**

| Item | Status |
|------|--------|
| [DEVICE_QA_v2.0.md](DEVICE_QA_v2.0.md) rows 1–8 signed (iOS + Android) | [ ] manual — operator sign-off pending |
| `hardening_table_rows` > 0 in prod | [ ] Jun 12: 0 rows — redeploy API with v2.2.1 fix |
| `/share/prepare` in Railway logs | [ ] 0 hits Jun 9–12 — validate rows 11–12 on device |
| `python scripts/ff-metrics.py` → `migration_002_ok: true` in prod | [x] 2026-06-12 |
| GO verdict in [FF_REVIEW_2026-06-14.md](FF_REVIEW_2026-06-14.md) | [x] 2026-06-11 — CONDITIONAL GO |
| v2.2.0 push + co-deploy (API + mini-app) | [x] 2026-06-11 — `d0c9305` pushed; Vercel live; API health ok |
| [PUBLIC_LAUNCH_REVIEW_2026-06-28.md](PUBLIC_LAUNCH_REVIEW_2026-06-28.md) | [ ] review ~Jun 28 |
| [prelaunch_audit2.md](prelaunch_audit2.md) | [x] 2026-06-11 — CONDITIONAL GO (62/100) |

**Tag sequence:** `v1.8.5` · `v1.9.0` · `v2.0.0` · **`v2.1.0` / `v2.1.1` / `v2.2.0`** (@ `ddfc968`) · **`v2.2.1`** (changelog cut 2026-06-12; git tag + prod deploy pending).

After each step, update [DOCS_INDEX.md](../DOCS_INDEX.md) and [README.md](../README.md) live demo table.
