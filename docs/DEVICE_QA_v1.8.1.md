# Device QA — v1.8.1

**Release:** v1.8.1 (2026-05-31) · **Deploy:** https://www.promptanatomy.lol · **Bot:** `@CorporateLadderBot`

**F&F gate:** Sign off before external invites · **Runbook:** [FF_EXECUTION.md](FF_EXECUTION.md) · **iOS owner:** core team

**Prod bundle:** `d862c3c` (v1.8.2) · **Sign-off now:** run full checklist below on Telegram iOS, then fill tester/date at bottom.

Sign off on real Telegram **iOS** and **Android** as **regression** before [DEVICE_QA_v1.8.2](DEVICE_QA_v1.8.2.md) delta. Release tag: `v1.8.2` after both checklists — [ROADMAP.md](../ROADMAP.md) Status.

---

## Automated post-deploy (verified 2026-06-01)

- [x] `main` @ `d862c3c` on origin (v1.8.2 bundle)
- [x] API `GET /health` → `{"status":"ok"}`
- [x] Production bundle includes v1.8.1+ markers (`sound-fab`, `tapControlsBar`, `BackButton`, `viewport-fit=cover`)
- [x] Local smoke + viewport QA green

---

## Manual — Telegram iOS

| # | Test | Pass |
|---|------|------|
| 1 | No duplicate in-app header | [ ] |
| 2 | BackButton → home from game / LB / how-to-play | [ ] |
| 3 | Bottom tap deck | TAP LEFT / TAP RIGHT visible; one tap = one climb | [ ] |
| 4 | All 7 rungs visible | [ ] |
| 5 | HUD tap hint (`#hudTapHint`) references TAP LEFT / TAP RIGHT | [ ] |
| 6 | Safe-side hints (first 5 taps) | [ ] |
| 7 | Sound FAB not clipped by notch | [ ] |
| 8 | `/start` → Mini App; today's shift in bot message | [ ] |

**Tester / date:** _______________

---

## Manual — Telegram Android

| # | Test | Pass |
|---|------|------|
| 1 | No duplicate in-app header | [ ] |
| 2 | BackButton → home from game / LB / how-to-play | [ ] |
| 3 | Bottom tap deck | TAP LEFT / TAP RIGHT visible; one tap = one climb | [ ] |
| 4 | All 7 rungs visible | [ ] |
| 5 | HUD tap hint (`#hudTapHint`) references TAP LEFT / TAP RIGHT | [ ] |
| 6 | Safe-side hints (first 5 taps) | [ ] |
| 7 | Sound FAB not clipped by gesture bar | [ ] |
| 8 | `/start` → Mini App; today's shift in bot message | [ ] |

**Tester / date:** _______________

---

## Regression spot-check (either platform)

- [ ] Daily shift badge on home; share includes `Shift:` line
- [ ] Game-over: death cause, retry tip, RE-APPLY flavor, LB gap
- [ ] Score on Daily leaderboard when authenticated

---

## On full pass

1. Mark [DEPLOY_STATUS.md](DEPLOY_STATUS.md) step 9 **Done**
2. Check [ROADMAP.md](../ROADMAP.md) current gate (v1.8.2) and [DEPLOY_STATUS.md](DEPLOY_STATUS.md) steps 9–10
3. Check [apps/mini-app/README.md](../apps/mini-app/README.md) manual QA rows
4. Start [FF_TEST.md](FF_TEST.md)
