---
name: revive-monetization
description: AdsGram rewarded revive on game-over — gate logic, env vars, score defer. Use when wiring or debugging Mandatory HR Training revive flow.
---

# Revive Monetization (AdsGram Reward)

**Scope:** Optional in-app monetization only — rewarded video → one run resume. No virtual currency, no forced interstitials. Acquisition ads are separate — [docs/ads-acquisition-plan.md](../../docs/ads-acquisition-plan.md).

## Environment

| Variable | Purpose |
|----------|---------|
| `VITE_ADSGRAM_REVIVE_ENABLED` | Master switch (`true` to enable revive UI) |
| `VITE_ADSGRAM_BLOCK_ID` | AdsGram Reward block ID (`revive-game-over` on prod); unset = ad-free revive for local testing |

See [.env.example](../../.env.example) and [DEPLOY.md](../../DEPLOY.md) § AdsGram revive.

## Flow

```
Game over (engine)
  → shouldOfferRevive() gate (revive.ts)
  → show #reviveAdBtn “Mandatory HR Training”
  → user taps → showRewardAd() (adsgram.ts)
  → on reward → engine.reviveFromSnapshot(); score submit STILL DEFERRED
  → final death → submitRun() as usual
Background/close before revive taken → deferred submit fires (pending-submit.ts / pagehide)
```

**Rule:** Score does not submit until final death when revive was offered — see [score-pipeline](../score-pipeline/SKILL.md).

## Gate logic (`revive.ts`)

Offer revive when **all** base gates true:

- `isReviveFeatureEnabled()` (env flag)
- Not already used this run (`reviveUsedThisRun`)
- Not sprint death (`deathType !== "sprint"`)
- `yearsSurvived >= 3`

Then **any** stake signal (OR):

- Meaningful run: `yearsSurvived >= 8`
- Near career high: `highScore - yearsSurvived <= 2` (when `highScore > 0`)
- Near #1 on leaderboard: `leaderboardGap <= 3` (when gap known and > 0)

**v2.2 first-run path** (when stake signals false, OR branch):

- `reapplyCount <= 1`
- `yearsSurvived >= 5`
- Within 3y of career high: `highScore - yearsSurvived <= 3`

Copy variants via `buildReviveCopy()` — gap-to-#1, gap-to-PB, or default subline.

## AdsGram hardening (v2.2)

- `showRewardAd()` in [adsgram.ts](../../apps/mini-app/src/lib/adsgram.ts) rejects incomplete/error ads
- Game-over toast when HR Training unavailable (moderation, SDK failure, user dismiss)

Track events: `revive_offer`, `revive_complete` via [analytics.ts](../../apps/mini-app/src/lib/analytics.ts).

## Key files

| File | Role |
|------|------|
| `apps/mini-app/src/lib/revive.ts` | Gate + copy |
| `apps/mini-app/src/lib/revive.test.ts` | Unit tests |
| `apps/mini-app/src/lib/adsgram.ts` | SDK load + `showRewardAd()` |
| `apps/mini-app/src/lib/pending-submit.ts` | Defer submit on pagehide when revive offered |
| `apps/mini-app/src/game/engine.ts` | `reviveFromSnapshot()`, `reviveUsed` flag |
| `apps/mini-app/src/template.ts` | `#reviveAdBtn` shell |
| `apps/mini-app/src/app.ts` | Game-over IO, defer submit, revive click handler |

## Debugging

1. Set `VITE_ADSGRAM_REVIVE_ENABLED=true` without Block ID — revive should work ad-free locally
2. Qualifying death: ≥8y run, within 2y of career high, within 3y of daily #1, or v2.2 first-run (≥5y, ≤3y PB, `reapplyCount <= 1`)
3. After revive, confirm score not on leaderboard until second death
4. Background app on game-over with revive visible — score should still submit (defer path)
5. Sprint deaths and `<3y` runs must never show revive button

## Scope boundary

- **In scope:** One rewarded revive per run; executive exception satire
- **Out of scope:** Currency, skins, interstitials between runs, pay-to-skip ads — [mvp-scope](../../docs/mvp-scope.md)
