# Public launch GO review — ~2026-06-28

**Purpose:** Decide **public launch GO** (paid acquisition pilot + wide channel posts) — not F&F-only expansion.  
**Inputs:** [FF_METRICS_2026-06-11.md](FF_METRICS_2026-06-11.md) · post–v2.1.1/v2.2.0 metrics re-run · [ads-acquisition-plan.md](ads-acquisition-plan.md) · [prelaunch_audit2.md](prelaunch_audit2.md)

---

## Decision (fill at review)

| Field | Value |
|-------|-------|
| **Decision** | [ ] **GO** · [ ] **NO-GO** · [x] **CONDITIONAL GO** (pre-audit baseline) |
| **Review date** | ~2026-06-28 |
| **One-line reason** | Pre-audit: retention thin (11.25s external median run) — see [prelaunch_audit2.md](prelaunch_audit2.md); re-vote after v2.2.0 deploy + 7d metrics |

---

## Required gates (all must pass for GO)

| # | Gate | Target | Pass |
|---|------|--------|------|
| 1 | `submit_pipeline_ok` | `true` | [ ] |
| 2 | [DEVICE_QA_v2.0.md](DEVICE_QA_v2.0.md) rows 1–8 | Signed iOS + Android | [ ] |
| 3 | Externals ≥3 runs | ≥6/8 (or same ratio at larger cohort) | [ ] |
| 4 | First-run churn | No dominant 1-run quit after v2.1.1 | [ ] |
| 5 | Share signal | ≥1 validated Telegram share (native or paste) | [ ] |
| 6 | OG + SEO | Live after `adopt:og` Vercel redeploy | [ ] |
| 7 | Median external run proxy | ≥30s (or documented exception) | [ ] |

---

## If GO

- First paid test: AdsGram **Telegram Network** → `https://t.me/CorporateLadder_bot` ([ads-acquisition-plan.md](ads-acquisition-plan.md))
- Full channel announcement; reuse [docs/assets/marketing/](assets/marketing/)

## If NO-GO

- Iterate **v2.1.1** onboarding (tutorial copy, pulse timing) — **not** paid acquisition or v1.1 platform work
- Schedule re-review +7 days

---

## Baseline at review open (2026-06-11)

| Signal | Value |
|--------|-------|
| Median years/run (external) | 5.0y |
| Median run seconds (proxy) | 11.25s |
| Externals ≥3 runs | 6/15 |
| CONDITIONAL GO | [FF_REVIEW_2026-06-14.md](FF_REVIEW_2026-06-14.md) |

**Update this doc** when the Jun 28 review completes.
