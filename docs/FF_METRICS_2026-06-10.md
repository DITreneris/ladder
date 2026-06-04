# F&F metrics snapshot — 2026-06-10

**Tool:** `python scripts/ff-metrics.py` · **Gate:** Pre-read for [FF_REVIEW_2026-06-14.md](FF_REVIEW_2026-06-14.md) §D

Fill on **2026-06-10** before the Jun 14 review. Compare to [FF_METRICS_2026-06-04.md](FF_METRICS_2026-06-04.md).

---

## Summary

| Metric | Jun 4 | Jun 10 | Delta |
|--------|-------|--------|-------|
| `users_total` | 6 | | |
| `game_runs` (14d) | 365 | | |
| `submit_pipeline_ok` | true | | |
| Daily LB entries | 4 | | |
| Weekly LB entries | 5 | | |
| Distinct players with runs (14d) | 5 | | |
| External testers (≥3 runs) | 0 | /8 target | |
| Prod bundle hash | `main-CJgmaRAS.js` | | |

---

## Engagement (14d)

| Player | Runs | Active days | External? | Notes |
|--------|------|-------------|-------------|-------|
| | | | [ ] | |
| | | | [ ] | |

---

## Progression signals

- **Manager reached (≥10y):** [ ] yes · count: ___
- **CEO reached (≥35y):** [ ] yes · count: ___ (expect 0)
- **Typical Intern band:** ___–___y per run
- **Median years per run:** ___

---

## Qualitative (from FF_TEST feedback)

| Signal | Count / notes |
|--------|---------------|
| Share attempts (successful paste in Telegram) | |
| "Samey after run 2" | |
| Open **pain** items | |
| Open **too hard** items | |

---

## Pre-review gate status (§B)

| # | Gate | Pass |
|---|------|------|
| 1 | Prod bundle = repo `main` | [ ] |
| 2 | Supabase `002` applied | [ ] |
| 3 | `ff-metrics.py` green | [ ] |
| 4 | DEVICE_QA v2.0 rows 1–8 | [ ] |
| 5 | DEVICE_QA v1.8.5 rows 6–10 | [ ] |
| 6 | Tier A V-08–V-14 | [ ] |
| 7 | ≥6/8 externals ≥3 runs | [ ] |
| 8 | Share validated | [ ] |
| 9 | Zero pain items | [ ] |

---

## Decision pre-read

- Soft drain cap @ ~20y: [ ] Ship · [ ] Defer · [ ] Cut
- CEO 35→25y: [ ] Ship · [ ] Defer · [ ] Cut
- Clean-climb streak: [ ] Ship · [ ] Defer · [ ] Cut
- Tag v1.9.0 + v2.0.0: [ ] Tag · [ ] Hotfix only

**Recommendation heading into Jun 14:** ___
