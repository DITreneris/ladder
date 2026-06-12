# F&F metrics snapshot — 2026-06-18 (T+7 post v2.2.1)

**Status:** TEMPLATE — fill on ~2026-06-18 after v2.2.1 has been live 7 days (deploy API first, then Vercel).  
**Prior baseline:** [FF_METRICS_2026-06-12.md](FF_METRICS_2026-06-12.md) · [20260612_analize.md](20260612_analize.md)  
**Analysis:** [20260618_analize.md](20260618_analize.md) (create after run)  
**Ceremony skill:** [.cursor/skills/ff-metrics-release/SKILL.md](../.cursor/skills/ff-metrics-release/SKILL.md)

---

## Ceremony checklist

- [ ] v2.2.1 deployed (Railway API → Vercel mini-app) — prod bundle in [DEBUG_ENV_TRIAGE.md](DEBUG_ENV_TRIAGE.md)
- [ ] `python scripts/ff-metrics.py` → save stdout JSON
- [ ] API redeployed with `submit_cooldowns` fix → `hardening_table_rows.submit_cooldowns` > 0 (gate #8)
- [ ] Export fresh Railway logs → confirm `/share/prepare` if share device test done (DEVICE_QA rows 11–12)
- [ ] Update gate table in [PUBLIC_LAUNCH_REVIEW_2026-06-28.md](PUBLIC_LAUNCH_REVIEW_2026-06-28.md)
- [ ] Cross-check [FF_COHORT_OUTREACH_2026-06-12.md](FF_COHORT_OUTREACH_2026-06-12.md) — warm leads returned?
- [ ] Run `verifier` release slice ([.cursor/agents/verifier.md](../.cursor/agents/verifier.md))

```bash
python scripts/ff-metrics.py
```

---

## Pre-T+7 checkpoint (2026-06-12 — v2.2.1 not yet on prod)

| Metric | Jun 12 baseline | **2026-06-12 checkpoint** | Notes |
|--------|-----------------|----------------------------|-------|
| `users_total` | 28 | **29** | +1 |
| `runs_total` | 888 | **897** | |
| `submit_pipeline_ok` | true | **true** | |
| `migration_002_ok` | true | **true** | |
| `hardening_table_rows.submit_cooldowns` | 0 | **0** | gate #8 blocked until API redeploy |
| `hardening_table_rows.api_sessions` | 0 | **0** | |
| Externals ≥3 runs | 8/23 (35%) | **9/24 (38%)** | slight ratio improvement |
| Median run seconds (proxy) | 11.0s | **10.75s** | still below 30s target |
| Median years/run (external) | 5.0y | **5.0y** | unchanged |
| Return after first run | 19.2% | **18.5%** | diluted by new shallow accounts |

---

## Summary (fill on ~2026-06-18)

| Metric | Jun 12 baseline | **Jun 18** | Δ |
|--------|-----------------|------------|---|
| `users_total` | 28 | | |
| `runs_total` | 888 | | |
| `submit_pipeline_ok` | true | | |
| `migration_002_ok` | true | | |
| `hardening_table_rows.submit_cooldowns` | 0 | | target > 0 |
| `hardening_table_rows.api_sessions` | 0 | | target > 0 |
| Externals ≥3 runs | 8/23 (35%) | | target +2 vs baseline |
| Median run seconds (proxy) | 11.0s | | target ≥30s |
| Median years/run (external) | 5.0y | | target ≥7y |
| Return after first run | 19.2% | | |
| One-and-done | 6 | | target ≤1 new/week |

---

## External segment (retention gate)

| Metric | Jun 12 | **Jun 18** | Target |
|--------|--------|------------|--------|
| `session_length_band.on_track` | false | | true |
| Share validated (Railway logs) | no | | ≥1 `/share/prepare` |
| DEVICE_QA v2.0 rows 1–9 | unsigned | | signed iOS + Android |
| Cohort outreach returned | n/a | | ≥2 warm leads → 3+ runs |

---

## Notes (fill after T+7 run)

- Compare external-only metrics — do not use aggregate (core skew ~89% rungs).
- Cohort outreach tracker: [FF_COHORT_OUTREACH_2026-06-12.md](FF_COHORT_OUTREACH_2026-06-12.md)
- Full JSON: stdout from `scripts/ff-metrics.py` on 2026-06-18.
