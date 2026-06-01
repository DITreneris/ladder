# Device QA — v1.8.4 (delta)

**Release:** v1.8.4 pre-F&F trust hotfix · **Base:** [DEVICE_QA_v1.8.1.md](DEVICE_QA_v1.8.1.md) full regression + [DEVICE_QA_v1.8.2.md](DEVICE_QA_v1.8.2.md) delta

**F&F gate:** [FF_EXECUTION.md](FF_EXECUTION.md) · **Tag after pass:** `v1.8.4`

**Prod bundle:** redeploy from `main` after trust hotfix merge — verify new JS hash (not `main-BO_qJQT_.js`) on https://www.promptanatomy.lol

Sign off on real Telegram **iOS** and **Android** after Vercel redeploy.

---

## v1.8.4 delta — Telegram iOS

| # | Test | Pass |
|---|------|------|
| 1 | Single content column — HUD, ladder, tap deck same width | [ ] |
| 2 | Game over: REJECTED stamp fully visible (not clipped) | [ ] |
| 3 | HUD rank + milestone readable on narrow phone (no clip) | [ ] |
| 4 | Player sprite + hint glow not cropped at play-area edges | [ ] |
| 5 | Tutorial: coffee on next rung by ~rung 10 if none collected | [ ] |
| 6 | Imminent reorg: next rung shows **Frozen** badge (not shuffle telegraph) | [ ] |
| 7 | Death screen appears immediately on game over (not frozen waiting on network) | [ ] |
| 8 | Share Results copies text; toast says paste into Telegram | [ ] |
| 9 | Score submit fail toast visible on game-over screen (airplane mode) | [ ] |
| 10 | Score on Daily leaderboard after successful run | [ ] |

**Tester / date:** _______________

---

## v1.8.4 delta — Telegram Android

| # | Test | Pass |
|---|------|------|
| 1 | Single content column — HUD, ladder, tap deck same width | [ ] |
| 2 | Game over: REJECTED stamp fully visible (not clipped) | [ ] |
| 3 | HUD rank + milestone readable on narrow phone (no clip) | [ ] |
| 4 | Player sprite + hint glow not cropped at play-area edges | [ ] |
| 5 | Tutorial: coffee on next rung by ~rung 10 if none collected | [ ] |
| 6 | Imminent reorg: next rung shows **Frozen** badge (not shuffle telegraph) | [ ] |
| 7 | Death screen appears immediately on game over (not frozen waiting on network) | [ ] |
| 8 | Share Results copies text; toast says paste into Telegram | [ ] |
| 9 | Score submit fail toast visible on game-over screen (airplane mode) | [ ] |
| 10 | Score on Daily leaderboard after successful run | [ ] |

**Tester / date:** _______________

---

## Automated (before manual)

- [ ] `cd apps/mini-app && npm run lint && npm test && npm run build`
- [ ] `cd packages/api && pytest`
- [ ] `npm run preview` → `npm run qa:viewport`
- [ ] `scripts/smoke-local.ps1` from repo root

---

## On full pass

1. Mark [DEPLOY_STATUS.md](DEPLOY_STATUS.md) step 11 **Done**
2. Run verifier ([.cursor/agents/verifier.md](../.cursor/agents/verifier.md))
3. Tag `v1.8.4` and push tags
4. Start Phase D dogfood in [FF_EXECUTION.md](FF_EXECUTION.md)
