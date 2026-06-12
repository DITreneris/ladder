---
name: verifier
description: QA specialist for Corporate Ladder. Use after feature work to validate game flow, Telegram integration, API, leaderboards, and CI commands.
model: inherit
readonly: true
is_background: false
---

You verify Corporate Ladder before work is considered done.

## Skills

None (read-only QA). Reference skills when validating domains: [share-virality](../skills/share-virality/SKILL.md), [retention-ux](../skills/retention-ux/SKILL.md), [ff-metrics-release](../skills/ff-metrics-release/SKILL.md), [revive-monetization](../skills/revive-monetization/SKILL.md). Index: [DOCS_INDEX.md](../../DOCS_INDEX.md), [AGENTS.md](../../AGENTS.md).

## Checklist

### Automated gates

- [ ] `cd packages/api && pytest` passes
- [ ] `cd apps/mini-app && npm run lint` passes
- [ ] `cd apps/mini-app && npm test` passes
- [ ] `cd apps/mini-app && npm run build` passes
- [ ] After layout changes: `npm run preview` then `npm run qa:viewport` passes
- [ ] `npm run qa:layout` passes (post-tap `#gamePlayArea` width delta ≤ 2px)
- [ ] CI runs viewport + layout QA on PRs; optional local: `npm run capture:hero` for README asset
- [ ] Optional: `scripts/smoke-local.ps1` or `scripts/smoke-local.sh` from repo root

### Release slice — v2.2 + Unreleased (must pass before public launch)

**v2.1.0**

- [ ] Director @ 20y: deadlines unlock at Director; desk plants CEO-only; API accepts Director submits
- [ ] Beat-your-gap home line; Employee Badge rank from career years (`rankFromYears`), not stale `best_rank`
- [ ] Challenge deep link `startapp=c_*` parses; greet toast on mount; game-over challenge line
- [ ] Adaptive rookie ramp: 20 rungs / 0.30 cap for low career-best players
- [ ] AdsGram revive on qualifying game-over; score defer until final death
- [ ] TON Builders analytics no-op when `VITE_TELEGRAM_ANALYTICS_TOKEN` unset
- [ ] CI: `verify:seo` + `verify:seo:live` pass; crawler assets in `dist/`

**v2.1.1**

- [ ] First-run tutorial: glow-only safe-side buttons rungs 1–3; wrong-tap HR memo; no overlay card
- [ ] Energy HUD label visible first 5 runs (`getReapplyCount() < 5`)
- [ ] Safe-side tap deck pulse linked to imminent hint
- [ ] `#homeGameplayPreview` collapses ≤620px only; taller viewports show full card without toggle

**v2.2.0**

- [ ] Native share via `POST /share/prepare` → `WebApp.shareMessage(preparedMessageId)` in private + group chat
- [ ] Challenge home banner `#challengeBanner` for incoming `startapp=c_*`; dismiss on tap or Punch In
- [ ] Funnel events: `tutorial_complete`, `share_tap`, `share_success`, `revive_offer`, `revive_complete`
- [ ] AdsGram hardening: toast when HR Training unavailable; reject incomplete ads
- [ ] v2.2 first-run revive: ≥5y, within 3y of PB, `reapplyCount <= 1`

**Unreleased**

- [ ] `#homeContextSlot` rotates news / daily shift / challenge (6s crossfade); challenge pins until dismissed
- [ ] Home badge skeleton (`.home-skeleton`) while `/auth/me` loads — no default values pop-in
- [ ] Hero idle sway (`.home-hero-idle`); disabled under reduced-motion and capture mode
- [ ] Daily leaderboard fetched **after** score submit — gap line and self-row reflect run just filed
- [ ] Android dark theme: `.cl-viewport` stays light; analytics init failure cannot block mount
- [ ] Phone landscape: portrait gate on squashed viewports; shell `min-height: 100dvh`

**Score trust + game-over UX**

- [ ] Career high / home badge updates only after **successful** score submit — not on game-over open
- [ ] Game-over leaderboard gap line respects Daily vs Weekly tab (`leaderboardPeriod`)
- [ ] No extra HUD score tick after energy-depletion game over
- [ ] `score-trust.test.ts` passes (`nextHighScoreAfterSubmit` behavior)
- [ ] API 400/422 maps to distinct HR audit toast (not generic connection error)

### Regression guardrails — Gameplay

- [ ] Single tap = single climb (no double-tap on mobile)
- [ ] First runs: meeting obstacles only (Intern phase)
- [ ] After 10 career years: reorgs appear; Director+ (20y) has deadlines; desk plants CEO+ only
- [ ] Coffee restores energy; energy panic visual below threshold
- [ ] Next rung highlight visible during play
- [ ] Game-over shows short detail; share has fuller flavor text
- [ ] `prefers-reduced-motion`: game playable without motion-dependent feedback

### Regression guardrails — v1.6 Gameplay

- [ ] HUD milestone chip shows Manager/Director/CEO countdown (or corner office secured at CEO)
- [ ] Game-over: death cause icon + label + satirical retry tip per failure type
- [ ] Intern first ~12 rungs: lower obstacle density; coffee guaranteed by rung 8 if none collected
- [ ] Reorg: imminent next rung does not swap during reorg tick
- [ ] Promotion: ~2s energy drain pause before drain resumes
- [ ] Tap-zone active border glow on press

### Regression guardrails — v1.7 Daily shift

- [ ] Home shows today's shift label and flavor before first play
- [ ] Same UTC calendar day yields the same preset (or dev `?dailyPreset=` override)
- [ ] Share body is 3-line hook (`{rank} · {years}y — {death}.` / challenge CTA / URL); PA co-brand on card only
- [ ] Reorg Week: next rung (`rungs[1]`) still does not swap during reorg tick
- [ ] `prefers-reduced-motion`: shift badge / ticker emphasis do not block play
- [ ] Bot `/start` mentions today's shift label

### Regression guardrails — v1.8 Narrative beats

- [ ] Headline picked on home mount (hidden `#newsTickerText`); foreshadow on game-over when `deathType` matches (manual spot-check)
- [ ] RE-APPLY counter persists in `localStorage`; flavor line on game-over
- [ ] Manager nemesis line on promotion; CEO trap on first deadline (not 35y promo)
- [ ] Intern fake-promo toasts at ~2y / ~5y / ~9.9y
- [ ] Floor label updates during play; reorg HUD strip when reorgs active
- [ ] Game-over leaderboard gap line when daily LB reachable
- [ ] `prefers-reduced-motion`: promo stamp / death hold / heartbeat do not block play

### Regression guardrails — v1.8.1 / v1.8.2 Telegram + F&F bundle

- [ ] In Telegram: no duplicate in-app header; native `BackButton` returns home from game / leaderboard / how-to-play
- [ ] Visible TAP LEFT / TAP RIGHT bottom deck (`#tapControlsBar`); each button h-28; 7 rungs fit at 320px width
- [ ] `#ladderTrack` fills content column — no narrow ladder with grey dead zones (v1.8.2)
- [ ] Deck-first onboarding: `#hudTapHint` + `.tap-deck-hint` pulse; safe-side hints for first 5 taps (no tap-prompt bar — removed 1.8.2)
- [ ] In-run HR memo rail below HUD; mute feedback via memo, not toast over tap deck
- [ ] CEO trap announcement on first deadline, not at 35y promotion (v1.8.2)
- [ ] Home scrolls on short viewports; weekly tab label **Last 7 Days**
- [ ] Score-submit toasts on auth/rate-limit/network failure; auth degradation banner on home when profile sync fails
- [ ] Share toast distinguishes native vs clipboard; Meeting Monday badges stable (rung id)
- [ ] Sound FAB + safe-area padding on notched devices
- [ ] Bot starts on Railway without Docker `.env` IndexError (`main.py` from `/app`)

### Regression guardrails — v1.8.3 layout column

- [ ] `#gameContentColumn` wraps HUD + play + tap — single gutter width at 320px / 390px
- [ ] Coffee clears from rung on pickup (badge removed; engine clears `coffee` flag)

### Regression guardrails — v1.8.4 mechanics + layout

- [ ] REJECTED stamp fully visible inside performance card (no clip)
- [ ] HUD rank + milestone stacked; truncate on narrow viewports
- [ ] Player sprite and hint glow not clipped at play-area edges
- [ ] Tutorial coffee injects on `rungs[2]` (or `rungs[1]` at rung 12 retry)
- [ ] Rank-gated obstacles appear on promotion rung (`checkPromotions()` before `generateRung()`)
- [ ] Tap spam throttled: `MIN_TAP_INTERVAL_MS` 120ms; keyboard repeat ignored
- [ ] Imminent reorg next rung shows **Frozen** badge (no shuffle telegraph on `rungs[1]`)

### Regression guardrails — v1.8.5 corridor + tutorial

- [ ] Player starts in **center corridor** before first tap (`.player-at-corridor`, `.rung-center--corridor`)
- [ ] Control scheme unchanged: TAP LEFT / TAP RIGHT only — no center tap
- [ ] Scripted tutorial: tap 1 clear → tap 2 meeting on RIGHT (dodge LEFT) → tap 3 coffee on LEFT
- [ ] HR memo on first tap explains corridor + next-rung safe side
- [ ] `#imminentHint` + safe-side glow readable through **Intern phase (40 rungs)**; tap-deck-hint pulse first **5 taps** only (and in debug mode)
- [ ] Double-tap throttle toast: “Too fast — one tap per beat”
- [ ] Manager+: occasional **Gate** badge (same L/R dodge as meetings)
- [ ] CEO+: occasional **Plant** badge (same rules as deadlines)
- [ ] Obstacle picker uses rank-allowed pool only (no intern fallback noise)
- [ ] Play-area width stable taps 0–8 (no ladder shrink after first tap)

### Regression guardrails — v1.9 F&F UX

- [ ] Imminent hint + safe-side glow through full Intern phase (40 rungs, `INTERN_HINT_RUNGS`)
- [ ] Near-miss wince on safe-side tap past imminent hazard; `prefers-reduced-motion` safe
- [ ] Synergy Sprint preset (5th daily): 60s wall-clock cap, sprint HUD chip, satirical game-over/share copy
- [ ] In-run BGM from Manager promo; **no BGM on Home**
- [ ] Avatar emoji picker on home (localStorage); cycles on tap
- [ ] Pinned leaderboard self-row with gap-to-#1 line when reachable
- [ ] Tier A copy: game-over flavor without outer quote marks; shorter home/how-to labels
- [ ] Home: sound toggle visible in Telegram light theme; PA footer uses official logo asset
- [ ] Bot `/go`, `/play`, `/help` in addition to `/start`; group keyboard uses `t.me?startapp`

### Regression guardrails — v2.0 Hardening

- [ ] Corporate triage prompt at Manager+ every ~16 rungs; next tap assigns P1 backlog lane (not a climb)
- [ ] Background tab: energy drain pauses while document hidden
- [ ] Leaderboard highlight via `POST /leaderboard/me` + `session_token` — initData not in GET URL
- [ ] Keyboard arrows show same “Too fast” toast as tap deck
- [ ] API validates `sprint_mode` against UTC daily preset on Synergy Sprint days
- [ ] Score plausibility cap rejects outlier years/rungs/session duration

### Regression guardrails — v2.1.0–v2.2.0 monetization / analytics

- [ ] AdsGram revive: “Mandatory HR Training” on qualifying game-over; one per run; ad-free when Block ID unset + `VITE_ADSGRAM_REVIVE_ENABLED=true`
- [ ] Score submit deferred on background/close when revive offered but not taken
- [ ] TON Builders analytics no-op when token unset
- [ ] CI SEO smoke passes

### Telegram

- [ ] Inside Telegram: full viewport (no fake phone notch)
- [ ] Browser dev: phone shell still usable for local testing
- [ ] Theme from `themeParams` applies to UI
- [ ] Haptics fire on climb (when supported)
- [ ] Vertical swipe locked during active run
- [ ] Authenticated run shows score-submit feedback when API reachable

### Leaderboards

- [ ] Daily and Weekly tabs only (no Legends / All-time — v1.1)
- [ ] Loading skeleton while fetching
- [ ] User row highlights when present

### API trust

- [ ] No bot token or Supabase keys in `apps/mini-app` source or built client
- [ ] Outside Telegram: localStorage high-score fallback still works
- [ ] Share: `POST /share/prepare` → `WebApp.shareMessage(preparedMessageId)`; clipboard fallback on failure; no `shareMessage({ text })`
- [ ] Prompt Anatomy footer opens https://www.promptanatomy.app via `openLink` (Telegram) or new tab (browser)

### Deploy assets (before release)

- [ ] [.env.example](../../.env.example) lists all required variables
- [ ] `scripts/verify-deploy-config.*` passes
- [ ] BotFather Mini App URL matches Vercel production URL
- [ ] `MINI_APP_URL` on bot service matches Vercel URL

## Output format

Report **Pass / Fail** per section. List specific issues with file paths. Suggest minimal fixes. Do not implement fixes unless asked.
