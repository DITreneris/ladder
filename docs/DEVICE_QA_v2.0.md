# Device QA — v2.0.0 (Corporate Triage + Platform Hardening)

**Gate:** Soft-launch GO on **2026-06-14** ([FF_REVIEW_2026-06-14.md](FF_REVIEW_2026-06-14.md)) · tag `v2.0.0` after sign-off · **Baseline:** [DEVICE_QA_v1.8.5.md](DEVICE_QA_v1.8.5.md) rows 1–10 must still pass

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

---

## Regression spot-check

Re-run [DEVICE_QA_v1.8.5.md](DEVICE_QA_v1.8.5.md) rows 1–5 (corridor, width, coffee, meeting death).

---

## Sign-off

| Platform | Tester | Date | Bundle hash |
|----------|--------|------|-------------|
| iOS | | | `main-CJgmaRAS.js` |
| Android | | | `main-CJgmaRAS.js` |

**Due:** 2026-06-10 · **Gate:** [FF_REVIEW_2026-06-14.md](FF_REVIEW_2026-06-14.md) §B row 4 (rows 1–8 required for soft-launch GO)
