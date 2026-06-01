# Device QA — v1.8.5 (delta)

**Release:** v1.8.5 corridor + tutorial + office hazards · **Base:** [DEVICE_QA_v1.8.4.md](DEVICE_QA_v1.8.4.md) full delta + [DEVICE_QA_v1.8.2.md](DEVICE_QA_v1.8.2.md)

**F&F gate:** [FF_EXECUTION.md](FF_EXECUTION.md) · **Tag after pass:** `v1.8.5`

**Prod bundle:** redeploy from `main` — verify new JS hash on https://www.promptanatomy.lol

Sign off on real Telegram **iOS** and **Android** after Vercel redeploy.

---

## Automated preflight (2026-06-01 Wave 1 sprint)

Repo gates green before device sign-off:

| Check | Result |
|-------|--------|
| `pytest` (API) | 16 passed |
| `npm run lint` / `test` / `build` | pass (57 tests) |
| `npm run qa:viewport` | pass |
| `npm run qa:layout` (post-tap width) | pass — 390px: 316→316px; 320px: 246→246px |
| Local bundle | `main-BWQOXY_x.js` — **redeploy Vercel before device QA** |
| Prod bundle (pre-redeploy) | `main-mUiaglh1.js` |

**Human steps after redeploy:** G-3 cache bust → fill rows 1–10 below on iOS + Android → G-7 tag → G-8 F&F.

---

## v1.8.5 delta — Telegram iOS

| # | Test | Pass |
|---|------|------|
| 1 | Player starts in **center corridor** before first tap | [ ] |
| 2 | Tap 1: either side climbs; Years tick; HR memo explains corridor | [ ] |
| 3 | Tap 2: meeting on RIGHT → must TAP LEFT to survive | [ ] |
| 4 | Tap 3: coffee on LEFT → TAP LEFT picks up +25% energy | [ ] |
| 5 | Play-area width stable taps 0–8 (no ladder shrink) | [ ] |
| 6 | `#imminentHint` readable first ~12 rungs | [ ] |
| 7 | Throttle toast on double-tap (“Too fast”) | [ ] |
| 8 | Manager+ run: occasional **Gate** badge (not more deaths than v1.8.4) | [ ] |
| 9 | CEO run: occasional **Plant** badge | [ ] |
| 10 | v1.8.4 regressions still pass (REJECTED stamp, Frozen reorg, score submit) | [ ] |

**Tester / date:** _______________

---

## v1.8.5 delta — Telegram Android

| # | Test | Pass |
|---|------|------|
| 1 | Player starts in **center corridor** before first tap | [ ] |
| 2 | Tap 1: either side climbs; Years tick; HR memo explains corridor | [ ] |
| 3 | Tap 2: meeting on RIGHT → must TAP LEFT to survive | [ ] |
| 4 | Tap 3: coffee on LEFT → TAP LEFT picks up +25% energy | [ ] |
| 5 | Play-area width stable taps 0–8 (no ladder shrink) | [ ] |
| 6 | `#imminentHint` readable first ~12 rungs | [ ] |
| 7 | Throttle toast on double-tap (“Too fast”) | [ ] |
| 8 | Manager+ run: occasional **Gate** badge | [ ] |
| 9 | CEO run: occasional **Plant** badge | [ ] |
| 10 | v1.8.4 regressions still pass | [ ] |

**Tester / date:** _______________

---

## Automated (repo)

```bash
cd apps/mini-app && npm run lint && npm test && npm run build
cd apps/mini-app && npm run preview
# separate terminal:
cd apps/mini-app && npm run qa:viewport
```

---

## Sign-off

| Platform | Pass | Notes |
|----------|------|-------|
| iOS | [ ] | |
| Android | [ ] | |
| Viewport QA script | [ ] | |
