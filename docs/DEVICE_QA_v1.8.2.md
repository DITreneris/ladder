# Device QA — v1.8.2 (delta)

**Release:** v1.8.2 mobile UX hotfix + F&F trust UX · **Base checklist:** [DEVICE_QA_v1.8.1.md](DEVICE_QA_v1.8.1.md) (run full regression first)

**F&F gate:** [FF_EXECUTION.md](FF_EXECUTION.md) · **Android owner:** recruit before external invite

**Prod bundle:** `d862c3c` (v1.8.2) · Run [DEVICE_QA_v1.8.1.md](DEVICE_QA_v1.8.1.md) regression first, then delta below on Telegram Android.

Sign off on real Telegram **iOS** and **Android** after redeploy from `main` (includes trust UX + responsive ladder).

---

## v1.8.2 delta — Telegram iOS

| # | Test | Pass |
|---|------|------|
| 1 | First run: `#hudTapHint` mentions TAP LEFT / TAP RIGHT | [ ] |
| 2 | First run: tap deck pulses (`.tap-deck-hint`) until 5th tap or 3s | [ ] |
| 3 | Short phone: home scrolls; **PUNCH IN & CLIMB** reachable | [ ] |
| 4 | Manager promo: at most 2 HR memo transitions (not 3+) | [ ] |
| 5 | Mute during game: HR memo feedback (not toast over tap deck) | [ ] |
| 6 | CEO trap memo appears when first deadline visible (not at promotion) | [ ] |
| 7 | Score submit fail toast visible (airplane mode on game over) | [ ] |
| 8 | Auth banner on home when profile sync fails (optional dismiss) | [ ] |

**Tester / date:** _______________

---

## v1.8.2 delta — Telegram Android

| # | Test | Pass |
|---|------|------|
| 1 | First run: `#hudTapHint` mentions TAP LEFT / TAP RIGHT | [ ] |
| 2 | First run: tap deck pulses until 5th tap or 3s | [ ] |
| 3 | Short phone: home scrolls; primary CTA reachable | [ ] |
| 4 | Manager promo: at most 2 HR memo transitions | [ ] |
| 5 | Mute during game: HR memo feedback (not toast over tap deck) | [ ] |
| 6 | CEO trap memo on first deadline spawn | [ ] |
| 7 | Score submit fail toast visible (airplane mode on game over) | [ ] |
| 8 | Auth banner on home when profile sync fails (optional dismiss) | [ ] |

**Tester / date:** _______________

---

## Automated (before manual)

- [x] `cd apps/mini-app && npm run lint && npm test && npm run build` (2026-06-01)
- [x] `npm run preview` → `npm run qa:viewport` (2026-06-01 — passed)

---

## On full pass

1. Mark [DEPLOY_STATUS.md](DEPLOY_STATUS.md) v1.8.2 redeploy **Done**
2. Tag `v1.8.2` and push
3. Start or continue [FF_TEST.md](FF_TEST.md)
