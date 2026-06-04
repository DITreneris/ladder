# F&F metrics snapshot — 2026-06-04

**Tool:** `python scripts/ff-metrics.py` · **Gate:** Phase 0 of F&F Safe ROI pack

## Summary

| Metric | Value |
|--------|-------|
| `users_total` | 6 |
| `game_runs` (14d) | 346 |
| `submit_pipeline_ok` | true |
| Daily LB entries | 3 |
| Weekly LB entries | 5 |
| Distinct players with runs (14d) | 5 (+ 1 user with 0 runs) |

## Engagement (14d)

| Player | Runs | Active days | Notes |
|--------|------|-------------|-------|
| Kristupas | 153 | 4 | Multiple Manager runs; best seen 22.3y |
| Promptanatomy.app | 96 | 4 | |
| Tomas | 85 | 4 | |
| Sci-Hub | 8 | 1 | |
| ff_audit_probe | 4 | 3 | Script probe |

## Progression signals (recent sample)

- **Manager reached:** yes (multiple runs ≥10y; peaks ~16–22y in recent Kristupas session)
- **CEO reached (≥35y):** none in recent 20 runs
- **Typical Intern band:** 2–9y per run (many deaths before Manager)

## Decision (Phase 0 gate)

- Median band ~7–11y → **extend onboarding hints** (not CEO threshold change)
- Manager reachable for engaged players → **copy reframe** (CEO as myth, Manager as milestone)
- Defer soft drain cap / CEO @ 25y → **Jun 14 review**

## SQL for deeper analysis

```sql
SELECT
  COUNT(*) AS total_runs,
  ROUND(AVG(years_survived), 1) AS avg_years,
  COUNT(*) FILTER (WHERE years_survived >= 10) AS reached_manager,
  COUNT(*) FILTER (WHERE years_survived >= 35) AS reached_ceo,
  MAX(years_survived) AS max_years
FROM game_runs
WHERE created_at > NOW() - INTERVAL '14 days';
```
