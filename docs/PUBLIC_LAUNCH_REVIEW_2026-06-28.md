# Public launch GO review — ~2026-06-28

**Purpose:** Decide **public launch GO** (paid acquisition pilot + wide channel posts) — not F&F-only expansion.  
**Inputs:** [FF_METRICS_2026-06-12.md](FF_METRICS_2026-06-12.md) · [20260612_analize.md](20260612_analize.md) · T+7 re-run [FF_METRICS_2026-06-18.md](FF_METRICS_2026-06-18.md) (~Jun 18) · [ads-acquisition-plan.md](ads-acquisition-plan.md) · [prelaunch_audit2.md](prelaunch_audit2.md)

---

## Decision (fill at review)

| Field | Value |
|-------|-------|
| **Decision** | [ ] **GO** · [ ] **NO-GO** · [x] **CONDITIONAL GO** (pre-audit baseline) |
| **Review date** | ~2026-06-28 |
| **One-line reason** | Pre-audit: retention thin (10.75s external median run proxy Jun 12) — v2.2.1 deploy + DEVICE_QA + T+7 metrics required before GO vote |

---

## Required gates (all must pass for GO)

| # | Gate | Target | Pass |
|---|------|--------|------|
| 1 | `submit_pipeline_ok` | `true` | [x] 2026-06-12 — re-verify at review |
| 2 | [DEVICE_QA_v2.0.md](DEVICE_QA_v2.0.md) rows 1–8 | Signed iOS + Android | [ ] v2.2.1 bundle — operator sign-off pending |
| 3 | Externals ≥3 runs | ≥6/8 (or same ratio at larger cohort) | [ ] **9/24 (38%)** Jun 12 checkpoint — target +2 from outreach |
| 4 | First-run churn | No dominant 1-run quit after v2.2.1 tutorial | [ ] glow-only tutorial on prod after deploy |
| 5 | Share signal | ≥1 validated Telegram share (native or paste) | [ ] 0× `/share/prepare` in prod logs Jun 12 |
| 6 | OG + SEO | Live after `adopt:og` Vercel redeploy | [x] 2026-06-11 — `/og.png` 200 + live SEO smoke green |
| 7 | Median external run proxy | ≥30s (or documented exception) | [ ] baseline **10.75s** Jun 12 — T+7 re-run ~2026-06-18 |
| 8 | Hardening tables populated | `submit_cooldowns` + `api_sessions` > 0 rows | [ ] Jun 12: 0 rows — fix in v2.2.1 API deploy pending |

---

## If GO

- First paid test: AdsGram **Telegram Network** → `https://t.me/CorporateLadder_bot` ([ads-acquisition-plan.md](ads-acquisition-plan.md))
- Full channel announcement; reuse [docs/assets/marketing/](assets/marketing/)

## If NO-GO

- Iterate **v2.1.1** onboarding (tutorial copy, pulse timing) — **not** paid acquisition or v1.1 platform work
- Schedule re-review +7 days

---

## Baseline at review open

### 2026-06-11 (pre–signup wave)

| Signal | Value |
|--------|-------|
| Median years/run (external) | 5.0y |
| Median run seconds (proxy) | 11.25s |
| Externals ≥3 runs | 6/15 |
| CONDITIONAL GO | [FF_REVIEW_2026-06-14.md](FF_REVIEW_2026-06-14.md) |

### 2026-06-12 (current — post Jun 11 wave)

| Signal | Value | Source |
|--------|-------|--------|
| Users / runs | 29 / 897 | `ff-metrics.py` checkpoint 2026-06-12 |
| Median years/run (external) | 5.0y | unchanged |
| Median run seconds (proxy) | **10.75s** | flat vs 11.0s |
| Externals ≥3 runs | **9/24 (38%)** | +1 engaged external |
| Return after first run | **18.5%** (5/27) | diluted by new shallow accounts |
| Railway API health | 95% HTTP 200; 0× 5xx | [20260612_analize.md](20260612_analize.md) §5b |
| Share in prod logs | **0** `/share/prepare` hits | not validated on device |
| Hardening tables | 0 rows | v2.2.1 API deploy pending |
| v2.2.1 status | Changelog cut 2026-06-12 | prod deploy + git tag pending |

**T+7 ceremony:** ~2026-06-18 — see [FF_METRICS_2026-06-18.md](FF_METRICS_2026-06-18.md) (template + Jun 12 checkpoint).

**Jun 28 review:** Fill decision block above when all gates re-evaluated; default remains **CONDITIONAL GO** until DEVICE_QA + share + hardening + retention improve.
