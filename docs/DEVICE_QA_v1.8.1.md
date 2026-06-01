# Device QA — v1.8.1

**Release:** v1.8.1 (2026-05-31) · **Deploy:** https://www.promptanatomy.lol · **Bot:** `@CorporateLadderBot`

**F&F gate:** Sign off before external invites · **Runbook:** [FF_EXECUTION.md](FF_EXECUTION.md) · **iOS owner:** core team

**Prod bundle:** `d862c3c` (v1.8.2) · **Sign-off now:** run full checklist below on Telegram iOS, then fill tester/date at bottom.

Sign off on real Telegram **iOS** and **Android** before marking [DEPLOY_STATUS.md](DEPLOY_STATUS.md) step 9 complete.

---

## Automated post-deploy (verified 2026-05-31)

- [x] `main` pushed; tag `v1.8.1` on origin
- [x] API `GET /health` → `{"status":"ok"}`
- [x] Production bundle includes v1.8.1 markers (`sound-fab`, `tapControlsBar`, `BackButton`, `viewport-fit=cover`)
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
2. Check ROADMAP v1.8.1 ship gate device QA + deploy gate last row
3. Check [apps/mini-app/README.md](../apps/mini-app/README.md) manual QA rows
4. Start [FF_TEST.md](FF_TEST.md)
