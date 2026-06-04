# Device QA — v1.8.5 (delta)

**Release:** v1.8.5 corridor + tutorial + office hazards · **Base:** [DEVICE_QA_v1.8.4.md](DEVICE_QA_v1.8.4.md) full delta + [DEVICE_QA_v1.8.2.md](DEVICE_QA_v1.8.2.md)

**F&F gate:** [FF_EXECUTION.md](FF_EXECUTION.md) · **Tag:** `v1.8.5` on `46abf19` (done)

**Prod bundle:** see [DEBUG_ENV_TRIAGE.md](DEBUG_ENV_TRIAGE.md) — https://www.promptanatomy.lol

Sign off on real Telegram **iOS** and **Android** after Vercel redeploy.

---

## Automated preflight (2026-06-01 — Gameplay visual fix sprint)

Repo gates green before device sign-off:

| Check | Result |
|-------|--------|
| `pytest` (API) | 16 passed |
| `npm run lint` / `test` / `build` | pass |
| `npm run qa:viewport` | pass |
| `npm run qa:layout` (post-tap width) | pass |
| `npm run qa:coffee` (tutorial coffee + meeting collision) | pass |
| Prod bundle | per [DEBUG_ENV_TRIAGE](DEBUG_ENV_TRIAGE.md) |

**Human sign-off:** Telegram rows 1–5 confirmed 2026-06-01. Rows 6–10 due **2026-06-10** — tracked in [FF_REVIEW_2026-06-14.md](FF_REVIEW_2026-06-14.md) §B gate 5.

---

## v1.8.5 delta — Telegram iOS

| # | Test | Pass |
|---|------|------|
| 1 | Player starts in **center corridor** before first tap | [x] |
| 2 | Tap 1: either side climbs; Years tick; HR memo explains corridor | [x] |
| 3 | Tap 2: meeting on RIGHT → must TAP LEFT to survive | [x] |
| 4 | Tap 3: coffee on LEFT → TAP LEFT picks up +25% energy | [x] |
| 5 | Play-area width stable taps 0–8 (no ladder shrink) | [x] |
| 6 | `#imminentHint` readable first ~12 rungs | [ ] |
| 7 | Throttle toast on double-tap (“Too fast”) | [ ] |
| 8 | Manager+ run: occasional **Gate** badge (not more deaths than v1.8.4) | [ ] |
| 9 | CEO run: occasional **Plant** badge | [ ] |
| 10 | v1.8.4 regressions still pass (REJECTED stamp, Frozen reorg, score submit) | [ ] |

**Tester / date:** Tomas — 2026-06-01 (Telegram confirmed)

---

## v1.8.5 delta — Telegram Android

| # | Test | Pass |
|---|------|------|
| 1 | Player starts in **center corridor** before first tap | [x] |
| 2 | Tap 1: either side climbs; Years tick; HR memo explains corridor | [x] |
| 3 | Tap 2: meeting on RIGHT → must TAP LEFT to survive | [x] |
| 4 | Tap 3: coffee on LEFT → TAP LEFT picks up +25% energy | [x] |
| 5 | Play-area width stable taps 0–8 (no ladder shrink) | [x] |
| 6 | `#imminentHint` readable first ~12 rungs | [ ] |
| 7 | Throttle toast on double-tap (“Too fast”) | [ ] |
| 8 | Manager+ run: occasional **Gate** badge | [ ] |
| 9 | CEO run: occasional **Plant** badge | [ ] |
| 10 | v1.8.4 regressions still pass | [ ] |

**Tester / date:** Tomas — 2026-06-01 (Telegram confirmed)

---

## Automated (repo)

```bash
cd apps/mini-app && npm run lint && npm test && npm run build
cd apps/mini-app && npm run preview
# separate terminal:
cd apps/mini-app && npm run qa:viewport && npm run qa:layout && npm run qa:coffee
```

---

## Sign-off

| Platform | Pass | Notes |
|----------|------|-------|
| iOS | [x] | Rows 1–5 pass — corridor, tutorial, width (2026-06-01) |
| Android | [x] | Rows 1–5 pass — corridor, tutorial, width (2026-06-01) |
| Viewport QA script | [x] | CI + local |

**Gate:** `v1.8.5` tagged → F&F active ([FF_EXECUTION.md](FF_EXECUTION.md)). Rows 6–10 spot-check by **2026-06-10**.
