# F&F metrics snapshot — 2026-06-11 (post v2.1.0 deploy baseline)

**Generated:** `2026-06-11T15:02:11Z` via `python scripts/ff-metrics.py`  
**Prior baseline:** [FF_METRICS_2026-06-08.md](FF_METRICS_2026-06-08.md)

## Pipeline

| Check | Value |
|-------|-------|
| `migration_002_ok` | **true** |
| `submit_pipeline_ok` | **true** (via recent prod submits) |
| `users_total` | 19 |
| `runs_total` | 820 |

## External segment (retention gate)

| Metric | Jun 8 | Jun 11 | Target (v2.1.1) |
|--------|-------|--------|-----------------|
| Median years/run (external) | 5.0y | **5.0y** | ≥7y |
| Median run duration proxy | ~11.5s | **11.25s** | ≥30s |
| Externals ≥3 runs | 4/8 | **6/15** | ≥6/8 ratio |
| `session_length_band.on_track` | — | **false** | true |
| One-and-done (all-time) | — | **3** players | ≤1 new/week |

## Notes

- External cohort grew (15 externals in 14d vs 8 in prior review); ≥3-run count improved to 6 but median session length still below 30s target.
- Re-run ~1 week after **v2.1.1** + **v2.2.0** deploy to measure tutorial overlay + native share impact.
- Full JSON: stdout from `scripts/ff-metrics.py` on 2026-06-11.

## Post-deploy T+0 re-run (2026-06-11, after v2.2.0 train push)

Prod bundle `main-C0cdc3so.js` @ `d0c9305`; tags `v2.1.0`/`v2.1.1`/`v2.2.0` on `origin`.

| Check | Value |
|-------|-------|
| `migration_002_ok` | **true** |
| `submit_pipeline_ok` | **true** |
| `users_total` / `runs_total` | 20 / 829 |
| Median run seconds (external, pre-deploy data) | 11.25s — baseline for T+7 (~2026-06-18) re-run |
| Returned after first run (all-time) | 5/19 (26.3%) |

This run still reflects pre-deploy behavior; the **T+7 re-run (~2026-06-18)** is the first read on v2.1.1 tutorial + v2.2.0 native share.
