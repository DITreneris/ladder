# v1.9.0 implementation spike — ready for 2026-06-14 review

**Do not merge before F&F review** unless hotfix train overrides. Default package if mixed feedback: **near-miss wince + Synergy Sprint** ([ROADMAP.md](../ROADMAP.md) F&F decision tree).

---

## Agent tracks (parallel after decision)

### Track A — Near-miss wince (Animation, effort S)

**Detect (no collision rule change):**

- Player taps safe side while `rungs[1].obstacle` is on the other side
- Reorg swap completes with player already on newly safe side (≤1 tick margin)

**Fire:** brief player wince + optional haptic; `prefers-reduced-motion` → static frame only.

| File | Change |
|------|--------|
| [engine.ts](../apps/mini-app/src/game/engine.ts) | Emit `onNearMiss` callback |
| [effects.ts](../apps/mini-app/src/lib/effects.ts) | Wince animation class |
| [app.ts](../apps/mini-app/src/app.ts) | Wire callback + haptic |
| [style.css](../apps/mini-app/src/style.css) | `.near-miss-wince` micro-motion |

**Tests:** engine unit test for safe-side + opposite obstacle tick; reduced-motion smoke in verifier.

---

### Track B — Synergy Sprint preset (Mechanics + UI, effort M)

**Spec:**

- 60s wall-clock cap; score = years at timeout
- Satirical game-over: sprint retro / standup velocity copy
- Same `handleTap` — spawn weights may tighten; **no** speed multiplier on tap interval
- New `DailyPresetId` or run flag (not level select)

| File | Change |
|------|--------|
| [daily-modifier.ts](../apps/mini-app/src/game/daily-modifier.ts) | `synergy-sprint` preset id + label |
| [engine.ts](../apps/mini-app/src/game/engine.ts) | Timer flag, timeout game-over |
| [constants.ts](../apps/mini-app/src/game/constants.ts) | Sprint failure flavor + share line |
| [app.ts](../apps/mini-app/src/app.ts) | HUD timer chip (optional one-line) |

**Tests:** daily-modifier rotation; engine timeout at 60s mock clock.

---

### Track C — Stretch (if F&F asks)

| Item | Files |
|------|-------|
| Soft drain cap @ ~20y | [engine.ts](../apps/mini-app/src/game/engine.ts), [constants.ts](../apps/mini-app/src/game/constants.ts) |
| Clean-climb streak (copy-only) | [engine.ts](../apps/mini-app/src/game/engine.ts), [constants.ts](../apps/mini-app/src/game/constants.ts) |

---

## Ship gate (v1.9.0)

- [x] Decision recorded in [FF_TEST.md](FF_TEST.md) end-of-F&F section (provisional default)
- [x] `[Unreleased]` CHANGELOG entries
- [x] `npm run lint && npm test && npm run build` — 61 tests pass (2026-06-01)
- [ ] Verifier pass before tag
- [x] No new obstacle logic; [mvp-scope](mvp-scope.md) boundary OK; match [ROADMAP](../ROADMAP.md) § Shipped baseline

**Tag after verifier:** `git tag -a v1.9.0 -m "..."`
