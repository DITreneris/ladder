# F&F metrics snapshot — 2026-06-10

**Tool:** `python scripts/ff-metrics.py` · **Gate:** Pre-read for [FF_REVIEW_2026-06-14.md](FF_REVIEW_2026-06-14.md) §D

**Filled:** 2026-06-05 (early pre-read; re-run `ff-metrics.py` on Jun 10). Compare to [FF_METRICS_2026-06-04.md](FF_METRICS_2026-06-04.md).

**Snapshot:** `generated_at` 2026-06-05T03:17:42Z · Supabase `jjwnfuyzfabnzdgdoots.supabase.co`

---

## Summary

| Metric | Jun 4 | Jun 10 (pre-read) | Delta |
|--------|-------|-------------------|-------|
| `users_total` | 6 | **9** | +3 |
| `game_runs` (14d) | 346 | **461** | +115 |
| `submit_pipeline_ok` | true | **true** | — |
| Daily LB entries | 3 | **1** | −2 *(UTC day; mostly probe — re-check Jun 10)* |
| Weekly LB entries | 5 | **8** | +3 |
| Distinct players with runs (14d) | 5 | **8** | +3 |
| External testers (≥3 runs) | 0 | **3 / 8** | +3 |
| Prod bundle hash | `main-CJgmaRAS.js` | **`main-T7XrL0BN.js`** | redeployed |
| Users with 0 runs | 1 | **1** (`bylikethis`) | — |

**Core vs external volume:** Top 3 accounts (Kristupas, Promptanatomy.app, Tomas) = **372 / 461 runs (~81%)**.

---

## Engagement (14d)

| Player | Runs | Active days | External? | Notes |
|--------|------|-------------|-----------|-------|
| Kristupas | 154 | 4 | [ ] | Core |
| Promptanatomy.app | 129 | 4 | [ ] | Core; peak **16.3y Manager** Jun 4 |
| Tomas | 89 | 4 | [ ] | Core |
| Mike_owi | 54 | 1 | [x] | External; burst session Jun 4 |
| Skcryptoverse | 19 | 1 | [x] | Twitter tester; engaged same day |
| Sci-Hub | 8 | 1 | [x] | External |
| ff_audit_probe | 7 | 4 | [ ] | Script probe — exclude from F&F headcount |
| abbydanny | 1 | 1 | [x] | **Daniel Abraham** — 1.0y, single run |
| bylikethis | 0 | — | [x] | Registered; never submitted |

**Externals with ≥3 runs:** Mike_owi, Skcryptoverse, Sci-Hub (**3**). Target ≥6/8.

---

## Progression signals

- **Manager reached (≥10y):** [x] yes · count: **217 runs** (14d; dogfood-heavy)
- **CEO reached (≥35y):** [ ] no · count: **0** (expect 0)
- **Typical Intern band (new externals):** **0.3–7.5y** per run (abbydanny 1.0y; Skcryptoverse 0.3–4.0y)
- **Median years per run (all 14d):** **9.0y** *(skewed by core replay volume)*

Recent peak: **26.8y** max (14d sample); Manager runs confirmed in recent Promptanatomy.app session.

---

## Qualitative (from FF_TEST feedback)

| Signal | Count / notes |
|--------|---------------|
| Share attempts (successful paste in Telegram) | Unknown |
| "Samey after run 2" | Not reported |
| Open **pain** items | None logged as P0 |
| Open **too hard** items | Onboarding confusion (Daniel / abbydanny — 1 run) |
| Twitter / DM praise | SKCryptoVerse (simple, fun theme); Jignesh (daily + ecosystem hook) |
| Feature asks | First-play walkthrough; leaderboard discoverability; marketing screenshots |

---

## Pre-review gate status (§B)

| # | Gate | Pass |
|---|------|------|
| 1 | Prod bundle = repo `main` | [ ] verify `main-T7XrL0BN.js` vs local build |
| 2 | Supabase `002` applied | [ ] |
| 3 | `ff-metrics.py` green | [x] |
| 4 | DEVICE_QA v2.0 rows 1–8 | [ ] |
| 5 | DEVICE_QA v1.8.5 rows 6–10 | [ ] |
| 6 | Tier A V-08–V-14 | [ ] |
| 7 | ≥6/8 externals ≥3 runs | [ ] **3/6** |
| 8 | Share validated | [ ] |
| 9 | Zero pain items | [x] |

---

## Decision pre-read

- Soft drain cap @ ~20y: [ ] Ship · [x] Defer · [ ] Cut
- CEO 35→25y: [ ] Ship · [x] Defer · [ ] Cut
- Clean-climb streak: [ ] Ship · [x] Defer · [ ] Cut
- Tag v1.9.0 + v2.0.0: [x] Tag *(done on `main`)* · [ ] Hotfix only

**Recommendation heading into Jun 14:** **CONDITIONAL GO** track — submit pipeline and progression healthy for engaged players; **externals thin (3/6 with ≥3 runs)** and **1-run churn** (abbydanny) point to **first-run walkthrough** before widening F&F. Re-run this snapshot on **2026-06-10** before the review vote.
