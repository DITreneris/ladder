# F&F metrics snapshot — 2026-06-12 (post Jun 11 signup wave)

**Generated:** `2026-06-12T03:16:07Z` via `python scripts/ff-metrics.py`  
**Prior baseline:** [FF_METRICS_2026-06-11.md](FF_METRICS_2026-06-11.md) · [20260608_analize.md](20260608_analize.md)  
**Analysis:** [20260612_analize.md](20260612_analize.md)

---

## Summary

| Metric | Jun 8 | Jun 11 | **Jun 12** | Δ vs Jun 11 |
|--------|-------|--------|------------|---------------|
| `users_total` | 12 | 20 | **28** | +8 |
| `runs_total` | 708 | 829 | **888** | +59 |
| `submit_pipeline_ok` | true | true | **true** | — |
| `migration_002_ok` | true | true | **true** | — |
| Daily LB entries | 4 | — | **2** | — |
| Weekly LB entries | 7 | — | **24** | +17 |
| Players with runs (14d) | 11 | — | **26** | — |
| External players (14d) | 8 | 15 | **23** | +8 |
| Externals ≥3 runs | 4/8 | 6/15 | **8/23** | +2 count, ratio ↓ |
| Users with 0 runs | 0 | 0 | **1** | BadrChioua |
| CEO runs (≥35y, 14d) | 12 | — | **12** | — |
| Median years/run (all) | 11.5y | — | **11.0y** | — |
| Median years/run (external) | 5.0y | 5.0y | **5.0y** | flat |
| Median run duration proxy | 11.5s | 11.25s | **11.0s** | flat |
| Returned after first run | 45.5% | 26.3% | **19.2%** (5/26) | diluted |
| One-and-done (all-time) | 2 | 3 | **6** | +3 |

**Core vs external volume:** Top 3 core accounts = **688 / 871 non-probe runs (~79%)** · core rungs **88.9%** of total rungs climbed.

**Playtime proxy (14d, aggregate):** **165.9 min** mid-estimate total (79.6–265.5 min range) · median **11.0s per run** mid-estimate *(below 30–90s target band)*.

---

## Pipeline

| Check | Value |
|-------|-------|
| `migration_002_ok` | **true** |
| `submit_pipeline_ok` | **true** |
| `webapp_secret_matches_prod` | **true** |
| `best_score` integrity (supplementary audit) | **0 mismatches** |
| `hardening_table_rows.submit_cooldowns` | **0** ⚠️ (fix in repo — redeploy Railway API) |
| `hardening_table_rows.api_sessions` | **0** ⚠️ |

**Hardening tables:** Schema present; service-role writes verified locally. Empty rows in prod despite 888 submits — likely in-memory fallback on Railway (see [20260612_analize.md](20260612_analize.md) §1).

---

## External segment (retention gate)

| Metric | Jun 11 | **Jun 12** | Target |
|--------|--------|------------|--------|
| Median years/run (external) | 5.0y | **5.0y** | ≥7y |
| Median run duration proxy | 11.25s | **11.0s** | ≥30s |
| Externals ≥3 runs | 6/15 | **8/23 (35%)** | ≥6/8 ratio |
| `session_length_band.on_track` | false | **false** | true |
| One-and-done (all-time) | 3 | **6** | ≤1 new/week |
| Avg external session (mid est.) | — | **0.7 min** | — |

**External run distribution (all-time):** 0 runs: 2 · 1 run: 6 · 2 runs: 9 · 3+ runs: 8 (25 external users excl. probe).

---

## Engagement (14d)

| Player | Segment | Runs | Active days | Avg years | Max years | Est. play (mid) | Returned? | Notes |
|--------|---------|------|-------------|-----------|-----------|-----------------|-----------|-------|
| Kristupas | core | 304 | 11 | 15.5 | **45.5 CEO** | 78.5 min | yes | |
| Promptanatomy.app | core | 226 | 11 | 10.2 | 25.3 | 38.4 min | yes | |
| Prompt_Anatom | core | 158 | 12 | 11.6 | 25.8 | 30.6 min | yes | Tomas alt |
| Mike_owi | external | 54 | 1 | 4.4 | 10.8 | 3.9 min | no | Burst Jun 4 only |
| bylikethis | external | 27 | 4 | 13.9 | 25.0 | 6.3 min | yes | Multi-day engaged |
| Tsg_neidomu | external | 23 | 1 | 5.8 | 12.3 | 2.2 min | no | Burst Jun 9 |
| Skcryptoverse | external | 21 | 2 | 3.7 | 6.0 | 1.3 min | yes | |
| LesTempsBTC | external | 15 | 1 | 7.4 | 12.5 | 1.8 min | no | **New Jun 11** burst |
| Sci-Hub | external | 8 | 1 | 6.9 | 14.0 | 0.9 min | no | |
| Dana | external | 6 | 1 | 0.9 | 1.3 | 0.1 min | no | New Jun 11, very short |
| Lauris | external | 5 | 1 | 4.8 | 5.5 | 0.4 min | no | |
| WinCent | external | 2 | 1 | 2.6 | 2.8 | 0.1 min | no | |
| Bread_night | external | 2 | 1 | 5.4 | 9.3 | 0.2 min | no | |
| modertma | external | 2 | 1 | 0.3 | 0.3 | 0.0 min | no | New Jun 10 |
| Safaarys | external | 2 | 1 | 3.9 | 7.5 | 0.1 min | no | New Jun 11 |
| Bluenew55 | external | 2 | 1 | 0.3 | 0.3 | 0.0 min | no | New Jun 11 |
| yornight | external | 2 | 1 | 10.8 | 14.5 | 0.4 min | no | New Jun 11 |
| Mills94boom | external | 2 | 1 | 3.6 | 3.8 | 0.1 min | no | New Jun 11 |
| joan1nkece | external | 2 | 1 | 6.7 | 8.5 | 0.2 min | no | New Jun 11 |
| devilofwallstreet | external | 2 | 1 | 3.1 | 3.3 | 0.1 min | no | New Jun 11 |
| abbydanny | external | 1 | 1 | 1.0 | 1.0 | 0.0 min | no | 1-run churn |
| Justas | external | 1 | 1 | 2.0 | 2.0 | 0.0 min | no | |
| Benja | external | 1 | 1 | 1.3 | 1.3 | 0.0 min | no | New Jun 11 |
| Ripal | external | 1 | 1 | 6.3 | 6.3 | 0.1 min | no | New Jun 11 |
| Brotokumer | external | 1 | 1 | 3.5 | 3.5 | 0.1 min | no | New Jun 11 |
| NAKHODA_Jelal | external | 1 | 1 | 4.0 | 4.0 | 0.1 min | no | New Jun 12 |
| BadrChioua | external | 0 | — | — | — | — | — | Registered Jun 11, no run |
| ff_audit_probe | probe | — | — | — | — | — | — | Exclude from F&F headcount |

**Externals with ≥3 runs:** Mike_owi, bylikethis, Tsg_neidomu, Skcryptoverse, LesTempsBTC, Sci-Hub, Dana (**8**). Target ≥6/8 ratio (was 75%; now 35% of 23).

---

## Playtime proxy (14d)

*Estimated from `rungs_climbed` — not measured wall-clock.*

| Signal | Value | vs FF_TEST target |
|--------|-------|-------------------|
| Total rungs climbed | 39,823 | — |
| Est. total play (mid) | **165.9 min** | aggregate |
| Avg rungs per run | 45.7 | — |
| Median run duration (mid est.) | **11.0s** | target 30–90s — **off track** |
| Core rungs share | 88.9% | dogfood-heavy |
| External rungs (14d) | 4,413 | — |
| Avg external session (mid est.) | **0.7 min** | short burst sessions |

---

## Progression signals

- **Manager reached (≥10y):** yes · count: **482 runs** (14d)
- **CEO reached (≥35y):** yes · count: **12 runs** (Kristupas peak **45.5y**)
- **Median years per run (external only):** **5.0y**
- **Max years (14d):** **45.5y**

**Top death causes (14d):**

| Cause | Runs | Avg years |
|-------|------|-----------|
| Reorganization | 347 | 12.2 |
| Meeting Overload | 312 | 8.0 |
| Energy Depleted | 164 | 14.4 |
| Badge Reader Jam | 43 | 16.0 |
| Wellness Obstruction | 4 | 41.5 |

**Daily trend (UTC):**

| Date | Runs | Players |
|------|------|---------|
| 2026-06-12 | 4 | 2 |
| 2026-06-11 | **88** | **15** |
| 2026-06-10 | 22 | 4 |
| 2026-06-09 | 56 | 5 |
| 2026-06-08 | 20 | 3 |
| 2026-06-07 | 55 | 5 |
| 2026-06-06 | 74 | 5 |
| 2026-06-05 | 98 | 6 |
| 2026-06-04 | 197 | 6 |

**Signups by day:**

| Date | New users |
|------|-----------|
| 2026-06-01 | 5 |
| 2026-06-02 | 1 |
| 2026-06-04 | 3 |
| 2026-06-05 | 2 |
| 2026-06-07 | 1 |
| 2026-06-09 | 2 |
| 2026-06-10 | 1 |
| 2026-06-11 | **12** |
| 2026-06-12 | 2 |

---

## Retention / funnel

| Signal | Value |
|--------|-------|
| Users registered, 0 runs | **1** (BadrChioua) |
| Players ever (excl. probe) | **26** |
| Returned after first run (>1h) | **5 / 26 (19.2%)** |
| One-and-done | **6** |
| New users (7d) | **20** |

---

## Prod API

| Endpoint | Status | Detail |
|----------|--------|--------|
| `/health` | 200 | ok |
| `/leaderboard?period=daily` | 200 | 2 entries |
| `/leaderboard?period=weekly` | 200 | 24 entries |
| `/auth/me` (probe) | 200 | ff_audit_probe |
| `/runs` (probe) | 200 | ok |

**API URL:** `https://ladder-production-642d.up.railway.app`  
**Supabase host:** `jjwnfuyzfabnzdgdoots.supabase.co`

---

## Notes

- **Jun 11 signup wave:** 12 new users in one day; 88 runs / 15 players — acquisition without depth (most 1–2 runs, same-day churn).
- External median session length and years/run **unchanged** vs Jun 11 — v2.1.1 tutorial + v2.2.0 share impact still TBD; **T+7 re-run ~2026-06-18** remains the first meaningful read.
- **Ops follow-up:** Investigate empty `submit_cooldowns` / `api_sessions` on Railway (schema OK, writes work via service role).
- Full JSON: stdout from `scripts/ff-metrics.py` on 2026-06-12.
- **Railway logs:** [20260612_analize.md](20260612_analize.md) §5b — `logs.1781234407184.json` (Jun 9–12; 95% HTTP 200; 39× 429; 0× `/share/prepare`).
