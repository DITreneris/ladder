# F&F metrics snapshot — 2026-06-08

**Tool:** `python scripts/ff-metrics.py` (deep analytics) · **Gate:** Pre-read for [FF_REVIEW_2026-06-14.md](FF_REVIEW_2026-06-14.md) §D

**Filled:** 2026-06-08 (fresh re-run). Compare to [FF_METRICS_2026-06-04.md](FF_METRICS_2026-06-04.md) and [FF_METRICS_2026-06-10.md](FF_METRICS_2026-06-10.md).

**Snapshot:** `generated_at` 2026-06-08T05:42:10Z · Supabase `jjwnfuyzfabnzdgdoots.supabase.co`

---

## Summary

| Metric | Jun 4 | Jun 10 (pre-read) | **Jun 8 (fresh)** | Delta vs Jun 10 |
|--------|-------|-------------------|-------------------|-----------------|
| `users_total` | 6 | 9 | **12** | +3 |
| `game_runs` (14d) | 346 | 461 | **708** | +247 |
| `submit_pipeline_ok` | true | true | **true** | — |
| `migration_002_ok` | — | [ ] | **true** | applied |
| Daily LB entries | 3 | 1 | **4** | +3 |
| Weekly LB entries | 5 | 8 | **7** | −1 |
| Distinct players with runs (14d) | 5 | 8 | **11** | +3 |
| External testers (≥3 runs) | 0 | 3 / 6 | **4 / 8** | +1 |
| Users with 0 runs | 1 | 1 (`bylikethis`) | **0** | −1 |
| CEO runs (≥35y, 14d) | 0 | 0 | **12** | +12 |
| Median years per run (all) | — | 9.0y | **11.5y** | +2.5y |
| Median years per run (external only) | — | — | **5.0y** | — |

**Core vs external volume:** Top 3 core accounts (Kristupas, Promptanatomy.app, Prompt_Anatom) = **585 / 708 runs (~83%)** · core rungs **91.2%** of total rungs climbed.

**Playtime proxy (14d, aggregate):** **139.4 min** mid-estimate total (66.9–223.1 min range) · median **~11.5s per run** mid-estimate *(below 30–90s target band — skewed by many short external runs)*.

---

## Engagement (14d)

| Player | Segment | Runs | Active days | Avg years | Max years | Est. play (mid) | Returned? | Notes |
|--------|---------|------|-------------|-----------|-----------|-----------------|-----------|-------|
| Kristupas | core | 284 | 8 | 15.5 | **45.5 CEO** | 73.3 min | yes | Peak 42.0y CEO Jun 8 session |
| Promptanatomy.app | core | 182 | 8 | 10.1 | 25.3 | 30.6 min | yes | Core |
| Prompt_Anatom | core | 119 | 8 | 11.8 | 24.8 | 23.3 min | yes | Core (Tomas alt account) |
| Mike_owi | external | 54 | 1 | 4.4 | 10.8 | 3.9 min | no | Burst Jun 4 only |
| bylikethis | external | 25 | 3 | 14.2 | 25.0 | 5.9 min | yes | Was 0 runs Jun 10 — now engaged |
| Skcryptoverse | external | 21 | 2 | 3.7 | 6.0 | 1.3 min | yes | Twitter tester |
| Sci-Hub | external | 8 | 1 | 6.9 | 14.0 | 0.9 min | no | |
| WinCent | external | 2 | 1 | 2.6 | 2.8 | 0.1 min | no | |
| Bread_night | external | 2 | 1 | 5.4 | 9.3 | 0.2 min | no | New Jun 7 |
| abbydanny | external | 1 | 1 | 1.0 | 1.0 | 0.0 min | no | 1-run churn |
| Justas | external | 1 | 1 | 2.0 | 2.0 | 0.0 min | no | |
| ff_audit_probe | probe | — | — | — | — | — | — | Exclude from F&F headcount |

**Externals with ≥3 runs:** Mike_owi, bylikethis, Skcryptoverse, Sci-Hub (**4**). Target ≥6/8.

---

## Playtime proxy (14d)

*Estimated from `rungs_climbed` — not measured wall-clock. See [mvp-scope.md](mvp-scope.md) (product analytics deferred to v1.1).*

| Signal | Value | vs FF_TEST target |
|--------|-------|-------------------|
| Total rungs climbed | 33,467 | — |
| Est. total play (mid) | **139.4 min** | aggregate across all players |
| Avg rungs per run | 47.9 | — |
| Median run duration (mid est.) | **11.5s** | target 30–90s — **off track** |
| Core rungs share | 91.2% | dogfood-heavy |
| External est. play (mid) | ~49 min | 4 engaged externals |
| Avg external session (mid est.) | **1.5 min** | short burst sessions |

**Interpretation:** Per-run median is pulled down by many sub-30s external runs (Mike_owi burst, 1-run churn). Core players show longer runs (recent Kristupas CEO run ~168 rungs ≈ 42s mid-estimate minimum; energy-depletion runs often 60–120s+). Session-length target applies per run, not cumulative daily minutes.

---

## Progression signals

- **Manager reached (≥10y):** [x] yes · count: **411 runs** (14d)
- **CEO reached (≥35y):** [x] yes · count: **12 runs** *(first in DB; Kristupas peak **45.5y**)*
- **Typical Intern band (new externals):** **1.0–9.3y** (abbydanny 1.0y; Bread_night 9.3y single run)
- **Median years per run (all 14d):** **11.5y** *(core-skewed)*
- **Median years per run (external only):** **5.0y**

**Top death causes (14d):**

| Cause | Runs | Avg years |
|-------|------|-----------|
| Reorganization | 289 | 12.4 |
| Meeting Overload | 239 | 8.4 |
| Energy Depleted | 126 | 15.4 |
| Badge Reader Jam | 40 | 16.3 |
| Wellness Obstruction | 4 | 41.5 |

**Daily trend (UTC):**

| Date | Runs | Players |
|------|------|---------|
| 2026-06-08 | 18 | 3 |
| 2026-06-07 | 55 | 5 |
| 2026-06-06 | 74 | 5 |
| 2026-06-05 | 98 | 6 |
| 2026-06-04 | 197 | 6 |

---

## Retention / funnel

| Signal | Value |
|--------|-------|
| Users registered, 0 runs | **0** (was 1 on Jun 10) |
| Players ever (excl. probe) | **11** |
| Returned after first run (>1h) | **5 / 11 (45.5%)** |
| One-and-done | **2** (abbydanny, Justas) |
| New players since Jun 10 | WinCent, Bread_night, Justas |

---

## Qualitative (from FF_TEST feedback)

| Signal | Count / notes |
|--------|---------------|
| Share attempts (successful paste in Telegram) | Unknown |
| "Samey after run 2" | Not reported |
| Open **pain** items | None logged as P0 |
| Open **too hard** items | abbydanny 1-run churn persists; bylikethis recovered (25 runs) |
| CEO reachable | **Yes in data** — copy reframe still valid; threshold unchanged |

---

## Pre-review gate status (§B)

| # | Gate | Pass |
|---|------|------|
| 1 | Prod bundle = repo `main` | [ ] verify vs local build |
| 2 | Supabase `002` applied | [x] `migration_002_ok: true` |
| 3 | `ff-metrics.py` green | [x] |
| 4 | DEVICE_QA v2.0 rows 1–8 | [ ] |
| 5 | DEVICE_QA v1.8.5 rows 6–10 | [ ] |
| 6 | Tier A V-08–V-14 | [ ] |
| 7 | ≥6/8 externals ≥3 runs | [ ] **4/8** |
| 8 | Share validated | [ ] |
| 9 | Zero pain items | [x] |

---

## Decision pre-read

- Soft drain cap @ ~20y: [ ] Ship · [x] Defer · [ ] Cut
- CEO 35→25y: [ ] Ship · [x] Defer · [ ] Cut *(CEO now reachable for core — monitor external band)*
- Clean-climb streak: [ ] Ship · [x] Defer · [ ] Cut
- Tag v1.9.0 + v2.0.0: [x] Tag *(done)* · [ ] Hotfix only

**Recommendation heading into Jun 14:** **CONDITIONAL GO** — submit pipeline and progression healthy; **CEO milestone proven** for engaged core; **externals still thin (4/8 with ≥3 runs)**; per-run session length below target for casual externals → prioritize **first-run walkthrough** before widening F&F. Positive signal: **bylikethis** converted from 0-run registration to 25-run engaged external.
