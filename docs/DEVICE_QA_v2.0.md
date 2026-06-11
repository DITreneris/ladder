# Device QA — v2.0.0 (Corporate Triage + Platform Hardening)

**Gate:** Soft-launch GO **2026-06-14** ([FF_REVIEW_2026-06-14.md](FF_REVIEW_2026-06-14.md)) · `v2.0.0` tagged · **Baseline:** [DEVICE_QA_v1.8.5.md](DEVICE_QA_v1.8.5.md) rows 1–10 must still pass

**Prod bundle:** [DEBUG_ENV_TRIAGE.md](DEBUG_ENV_TRIAGE.md)

---

## v2.0-specific rows

| # | Area | Steps | Pass criteria | iOS | Android |
|---|------|-------|---------------|-----|---------|
| 1 | **Triage prompt** | Reach Manager (~10y); keep climbing until HR triage memo | Memo appears; next tap does **not** climb | [ ] | [ ] |
| 2 | **Triage choice** | Tap LEFT (or RIGHT) on prompt | Confirm toast; climb resumes on following taps | [ ] | [ ] |
| 3 | **Triage bias** | After choice, observe 2–3 imminent hazards | More hazards on chosen side; always one safe side | [ ] | [ ] |
| 4 | **Tutorial unaffected** | Fresh run taps 1–3 | Scripted meeting/coffee unchanged | [ ] | [ ] |
| 5 | **Background drain** | Start run; background Telegram 30s; return | Energy does not drain while hidden | [ ] | [ ] |
| 6 | **Keyboard throttle** | Desktop/browser arrows spam | "Too fast" toast on keyboard (same as buttons) | [ ] | n/a |
| 7 | **Leaderboard highlight** | Submit run; open Daily tab | Your row highlighted (session token flow) | [ ] | [ ] |
| 8 | **Score submit** | Offline game over | Failure toast; career high unchanged | [ ] | [ ] |
| 9 | **429 cooldown** | Two quick deaths | "Score filing cooldown" toast | [ ] | [ ] |
| 10 | **Synergy Sprint** | On sprint day, 60s cap | Sprint HUD + timeout game over | [ ] | [ ] |
| 11 | **Native share (DM)** | Finish run → Share → send to saved messages or contact | Prepared performance review sends; `share_success` native or clipboard toast | [ ] | [ ] |
| 12 | **Native share (group)** | Open via `/go@bot` in supergroup → finish run → Share to same group | Message appears in group; no WebView crash | [ ] | [ ] |

---

## Regression spot-check

Re-run [DEVICE_QA_v1.8.5.md](DEVICE_QA_v1.8.5.md) rows 1–5 (corridor, width, coffee, meeting death).

---

## Sign-off

| Platform | Tester | Date | Bundle hash |
|----------|--------|------|-------------|
| iOS | | | per [DEBUG_ENV_TRIAGE](DEBUG_ENV_TRIAGE.md) |
| Android | | | per [DEBUG_ENV_TRIAGE](DEBUG_ENV_TRIAGE.md) |

**Due:** 2026-06-10 · **Gate:** [FF_REVIEW_2026-06-14.md](FF_REVIEW_2026-06-14.md) §B row 4 (rows 1–8 required for soft-launch GO)

---

## Automated coverage (2026-06-11, post v2.2.0 train deploy)

Prod bundle to sign against: `main-C0cdc3so.js` @ `d0c9305` (tags `v2.1.0`/`v2.1.1`/`v2.2.0` on `origin`). Local smoke green same day: pytest 30 · vitest 119 · lint/build · deploy preflight · live SEO smoke (prod) · `ff-metrics.py` `submit_pipeline_ok: true`. Bundle markers verified live: `startapp=c_`, `challengeBanner`, `tutorial_complete`/`share_tap`/`share_success`/`revive_offer`/`revive_complete`, "Mandatory HR Training", `/og.png` 200.

Local CI smoke before manual device sign-off:

| Row | Automated signal |
|-----|------------------|
| 4 Tutorial rungs 1–3 | `engine.test.ts` — `TUTORIAL_RUNG_SPECS` + v2.1.1 overlay gating in app |
| 7 LB highlight | `api.test.ts` + session token flow |
| 8 Score submit | API pytest submit pipeline |
| Share | `telegram.test.ts` + `test_share.py`; manual DM + group rows 11–12 for gate #8 |

**Manual only:** triage prompt (1–3), background drain (5), keyboard throttle (6), layout/tap feel, Telegram BackButton, native share on device.

Operator: complete iOS + Android columns above, then update sign-off table.
