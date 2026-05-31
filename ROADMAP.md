# Roadmap — Corporate Ladder

**Doc map:** [DOCS_INDEX.md](DOCS_INDEX.md) · **Scope:** [docs/mvp-scope.md](docs/mvp-scope.md) · **Visual tokens:** [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) · **Copy tone:** [.cursor/rules/satirical-copy.mdc](.cursor/rules/satirical-copy.mdc)

This roadmap is organized around four product pillars — **mechanics**, **graphics**, **animation**, and **satirical voice** — not feature lists alone. Each release should move at least one pillar forward without breaking the Lumberjack-style core loop ([snippet.txt](snippet.txt)).

---

## Product pillars (how work is prioritized)

| Pillar | What it means here | Primary files | Guardrail |
|--------|-------------------|---------------|-----------|
| **Mechanics** | Left/right climb, obstacles, energy, rank gates, spawn fairness | [`engine.ts`](apps/mini-app/src/game/engine.ts), [`constants.ts`](apps/mini-app/src/game/constants.ts) | No new control schemes; rank phases = progression |
| **Graphics** | Emoji-first arena, badges, HUD, contrast, office mood | [`template.ts`](apps/mini-app/src/template.ts), [`app.ts`](apps/mini-app/src/app.ts), [`style.css`](apps/mini-app/src/style.css) | Clarity over decoration; playfield stays readable |
| **Animation** | Tap feedback, telegraphs, death/promo juice, reduced-motion safe | [`effects.ts`](apps/mini-app/src/lib/effects.ts), [`style.css`](apps/mini-app/src/style.css) | 100–200ms micro-motions; no parallax clutter |
| **Satirical view** | HR framing, corporate jargon, shareable failure stories | [`constants.ts`](apps/mini-app/src/game/constants.ts), shell copy, [`apps/bot/main.py`](apps/bot/main.py) | Humor is the product; deadpan, not mean |

**Visual direction (locked):** *Funny cartoon* discipline on a *minimal arcade* playfield — sticker-like badges, emoji actor, office grid; satire in shell and game-over, clarity in the climb zone ([DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) §1).

---

## Release train

| Version | Theme | Status | Tag when |
|---------|--------|--------|----------|
| **v1.5.0** | Design system, onboarding, effects baseline | Code done | Production deploy + device QA |
| **v1.6.0** | Progress & fairness | Code done ([CHANGELOG.md](CHANGELOG.md) `[Unreleased]`) | After v1.5 tag + smoke |
| **v1.7.0** | **Daily replays** (selected next) | Planned | After v1.6 tag |
| **v1.8.0** | Arena identity + satire depth | Backlog | Data-informed |
| **v1.1** | Platform (Legends, analytics, anti-cheat) | Deferred — explicit approval | See below |

---

## Shipped baseline (v1.5 + v1.6)

Inventory by pillar — do not regress without spec update.

### Mechanics

| Item | Notes |
|------|--------|
| Tap left/right, one rung per tap | Core loop unchanged |
| Obstacles: Meeting, Reorg, Deadline (`burnout`) + Coffee | Rank-gated: Intern → meetings; Manager → +reorgs; CEO → +deadlines |
| Energy drain + climb/coffee recovery | Pauses until first tap; 2s pause on promotion (v1.6) |
| Intern tutorial ramp | 22% obstacle rate first 12 rungs; forced coffee if none by rung 8 |
| Reorg fairness | Next rung (`rungs[1]`) does not swap during reorg ticks |
| Milestone progression | Intern @ 0y → Manager @ 10y → CEO @ 35y |

### Graphics

| Item | Notes |
|------|--------|
| Design-system shell | `btn-cl-*`, `card-light`, rank badges, Telegram `--cl-*` theme |
| Obstacle badges | Color-coded: red meeting, amber reorg, red deadline (v1.6 contrast) |
| HUD | Longevity, rank pill, energy meter, **milestone chip** (v1.6) |
| Game-over card | Performance review layout, REJECTED stamp, death cause row (v1.6) |
| Climb arena | Office grid, skyline silhouettes, ladder rails — intentionally minimal |

### Animation

| Item | File / class | Purpose |
|------|--------------|---------|
| Climb pop | `climb-pop` | Tap confirmation |
| Rung advance | `rung-advance` | Upward progress |
| Reorg slide + telegraph | `reorg-slide-*`, `reorg-warning` | Fairness feedback |
| Safe-side hint (3 taps) | `safe-side-hint` | Onboarding |
| Next-rung warn | `next-obstacle-warn` | Threat read |
| Panic / stress | `player-panic`, `burnout-stress` | Low energy |
| Coffee / promo particles | `float-particle`, `promo-confetti` | Reward beats |
| Death sequence | `death-flash`, `shake-finite`, death emoji flash | Failure punch |
| Character micro-states | `idle-bob`, emoji flashes 🤤/😎 (v1.6) | Personality |
| Tap zone glow | `tap-zone-left/right:active` (v1.6) | Control feel |
| Reduced motion | `@media (prefers-reduced-motion: reduce)` | A11y |

### Satirical view

| Surface | Implementation |
|---------|----------------|
| Failure flavor | `FAILURE_REASONS`, `FAILURE_BY_RANK` in constants |
| Promotion dialogue | `PROMOTION_DIALOGUES` + overlay + toasts |
| Game-over framing | HR exit interview, termination detail + flavor quote |
| Retry tips | `RETRY_TIPS` by `deathType` (v1.6) — actionable + deadpan |
| Share text | Performance review block in `app.ts` |
| Home ticker | CSS news scroll — corporate absurdity |
| Employee badge | ACTIVE EMPLOYMENT, nickname, best career years |

---

## v1.7.0 — Daily Replays (**selected — ship first**)

**Goal:** Replay variety and daily retention **without** new screens, obstacle logic, or API changes.

**Fastest path:** Client-side UTC date → deterministic spawn preset → one home-screen line. Effort **S** (1–2 days). Pairs with existing **Daily leaderboard**.

### MoSCoW for v1.7

| Idea | Must | Should | Want | v1.7 |
|------|------|--------|------|------|
| Daily spawn modifier | | **✓** | | **In** |
| Obstacle reskins (copy/emoji only) | | **✓ stretch** | | Optional |
| New obstacle mechanics | | | | **Out** |
| Antagonist characters | | | | **Out** |
| Level select / campaign | | | | **Out** |

---

### v1.7 — Mechanics

| Task | Detail | Files |
|------|--------|-------|
| Daily modifier resolver | `getDailyModifier(utcDate)` — hash `YYYY-MM-DD` to preset id | New `daily-modifier.ts` or `constants.ts` |
| Spawn weight overrides | Per preset: adjust `OBSTACLE_SPAWN_RATE`, `COFFEE_SPAWN_THRESHOLD`, optional early reorg eligibility flag | [`engine.ts`](apps/mini-app/src/game/engine.ts) reads active preset |
| Rank gates unchanged | Manager @ 10y, CEO @ 35y; modifiers tune density only | No change to `MANAGER_YEARS` / `CEO_YEARS` |
| Share hook | Append `Shift: {modifierLabel}` to share text | [`app.ts`](apps/mini-app/src/app.ts) |

**Launch presets (rotate by date):**

| Preset | Mechanic tweak | Satirical label |
|--------|----------------|-----------------|
| Standard | Default weights | Open Floor Plan |
| Meeting Monday | Higher meeting spawn weight | Meeting Monday |
| Coffee Break | Higher coffee spawn weight | Coffee Break |
| Reorg Week | Reorgs can appear before Manager rank* | Reorg Week |

\* *Reorg Week:* only if fairness holds — reorg grace on `rungs[1]` stays; test heavily on device.

**Definition of done (mechanics):**

- [ ] Same modifier for all players on a given UTC day
- [ ] Left/right loop and collision rules unchanged
- [ ] Unit tests for date → preset mapping and weight application

---

### v1.7 — Graphics

| Task | Detail | Files |
|------|--------|-------|
| Today's shift badge | Home screen pill under ticker: `Today's shift: Meeting Monday` | [`template.ts`](apps/mini-app/src/template.ts), [`app.ts`](apps/mini-app/src/app.ts) |
| In-run hint (optional) | One-time toast on first tap: `Shift rules active` | `app.ts` |
| Preset tint (optional) | Subtle `office-grid` hue per modifier — e.g. amber wash Reorg Week | [`style.css`](apps/mini-app/src/style.css) — **max one layer** |
| Obstacle reskins (stretch) | Meeting → `📧 Reply-All` / `🧍 Standup` random label; same hitbox | [`createObstacleBadge`](apps/mini-app/src/app.ts) |

**Definition of done (graphics):**

- [ ] Modifier visible before first play
- [ ] No reduction in obstacle contrast on next rung
- [ ] Reskins use existing badge layout (`text-nano` label)

---

### v1.7 — Animation

| Task | Detail | Priority |
|------|--------|----------|
| Shift badge entrance | Short fade/slide on home mount | Nice-to-have |
| Ticker emphasis | Pulse `ticker-bar` border on modifier days | Nice-to-have |
| New climb animations | — | **Defer** — not required for v1.7 |

Keep all new motion behind `prefers-reduced-motion` ([`effects.ts`](apps/mini-app/src/lib/effects.ts) pattern).

---

### v1.7 — Satirical view

| Task | Detail | Files |
|------|--------|-------|
| Modifier names | Deadpan HR shift titles (table above) | `constants.ts` or `daily-modifier.ts` |
| Modifier descriptions | One-line flavor on home: *"Synergy optional. Attendance mandatory."* | `template.ts` |
| Death/share copy | Reference shift in share block only — do not rewrite `FAILURE_REASONS` per day | `app.ts` |
| Bot welcome (optional) | `/start` mentions today's shift | [`apps/bot/main.py`](apps/bot/main.py) — only if bot deploy is coordinated |

**Copy rules:** [.cursor/rules/satirical-copy.mdc](.cursor/rules/satirical-copy.mdc) — short, jargon-heavy, self-aware misery.

---

### v1.7 release gate

```bash
cd apps/mini-app && npm run lint && npm test && npm run build
```

- [ ] Manual: force two presets (dev flag or date mock); verify spawn feel
- [ ] Manual: share text includes shift name
- [ ] [CHANGELOG.md](CHANGELOG.md) → `## [1.7.0]`
- [ ] Tag `v1.7.0` after deploy smoke ([DEPLOY.md](DEPLOY.md))

---

## v1.8.0 — Arena identity & juice (backlog)

**Goal:** Make the climb zone feel more *office* and the emoji actor more *memorable* — still emoji-first, no sprite pipeline.

Prioritize **graphics + animation + satire**; mechanics only where they support clarity.

### Mechanics (light)

| Item | Effort | Notes |
|------|--------|-------|
| Leaderboard gap on game over | S | *"#1 is 4.1y ahead"* — retention hook |
| Soft drain cap after 20y | S | Expert runs fail to skill/obstacles, not timer only |
| Synergy Sprint preset | M | 60s fixed timer — mode flag, not level select |

### Graphics

| Item | Effort | Notes |
|------|--------|-------|
| Floor labels on ladder rail | S | *Floor 12 — Open Office* tied to years |
| Rank props | S | Intern lanyard dot; Manager clipboard; CEO monocle stack |
| Reorg HUD strip | S | Amber micro-bar when reorgs active: *ORG CHART UNSTABLE* |
| Sticky-note / coffee stain decals | S | Static arena decoration, low opacity |

### Animation

| Item | Effort | Notes |
|------|--------|-------|
| Heartbeat SFX under 15% energy | S | [`audio.ts`](apps/mini-app/src/game/audio.ts) — tension without visual noise |
| Promotion stamp on overlay | S | Rotate-in *PROMOTED* beside 🎉 |
| Death cause icon hold | S | Keep cause emoji on game-over card 400ms+ |
| Near-miss wince (optional) | M | One-frame 😅 after safe pass — only if not noisy |

### Satirical view

| Item | Effort | Notes |
|------|--------|-------|
| Expand `FAILURE_BY_RANK` | S | 2–3 more lines per rank |
| Rank-up nemesis line | S | Copy-only VP/HR one-liner on Manager promotion — **not** a new character system |
| Rotating news ticker pool | S | 10+ headlines in constants; random on load |
| Modifier-specific death tips | M | After v1.7 presets prove stable |

---

## v1.9+ / v2.0 — Data-informed (Want)

Build only if friends-and-family or v1.1 analytics show retention plateau.

| Item | Pillars | Trigger |
|------|---------|---------|
| Server-seeded daily + modifier LB | Mechanics + platform | Daily DAU &gt; threshold |
| Antagonist beat (emoji NPC) | Graphics + satire | Sessions feel samey post–v1.7 |
| 2–3 mode presets (Endless / Sprint / Today) | Mechanics + UI | Not a 5-level campaign |
| Vector mascot | Graphics + animation | Art bandwidth; emoji ceiling hit |
| Full level select / campaign map | All | **Avoid** unless product pivot |

---

## v1.1 — Platform (deferred — explicit approval)

From [docs/mvp-scope.md](docs/mvp-scope.md). Not a substitute for v1.7 game juice.

- All-time / Legends leaderboard tab
- Friends leaderboard
- Server-side replay validation (anti-cheat)
- Analytics (session length, share rate, retention)
- Admin dashboard

**Recommendation:** Lightweight analytics is **Should** before large v2 bets; keep gated until v1.6/v1.7 are live and measured.

---

## Deploy gate (v1.5 / v1.6 — complete before v1.7)

| Step | Status |
|------|--------|
| Production Mini App on Vercel | [ ] |
| API health check ok | [ ] |
| Bot `/start` opens Mini App | [ ] |
| Score on Daily leaderboard | [ ] |
| Telegram iOS + Android QA ([apps/mini-app/README.md](apps/mini-app/README.md)) | [ ] |
| Tag `v1.5.0` / `v1.6.0` with [CHANGELOG.md](CHANGELOG.md) | [ ] |

**Deploy checklist:** [DEPLOY.md](DEPLOY.md) · **Progress:** [docs/DEPLOY_STATUS.md](docs/DEPLOY_STATUS.md)

```bash
# After device QA
git tag v1.6.0
git push origin main --tags
```

### Friends-and-family test (post-deploy)

1. Share bot with 5–10 testers  
2. Track: session length (30–90s), games/user, share rate, daily return  
3. Log issues via [.github/ISSUE_TEMPLATE/bug_report.md](.github/ISSUE_TEMPLATE/bug_report.md)  
4. Use results to confirm or cut v1.8 items  

---

## Explicitly out of scope

Per [docs/mvp-scope.md](docs/mvp-scope.md) — do not slip into roadmap without product decision:

- Virtual currency, skins shop, clans, quests, NFTs  
- Complex rank tree (Director, VP, …)  
- New obstacle logic (both sides lethal, moving hazards, hold-to-dodge)  
- Separate antagonist AI / combat  
- Heavy parallax or full arena redesign  

---

## Pillar checklist for any future task

Before merging gameplay or UI work, ask:

1. **Mechanics** — Does it preserve left/right clarity and fair telegraphs?  
2. **Graphics** — Is the next rung still readable at a glance on mobile?  
3. **Animation** — Is it &lt;200ms, optional under reduced motion?  
4. **Satire** — Does copy sound like HR/bureaucracy, not generic game over text?  

If any answer is no, cut scope or defer.

---

## Related docs

| Doc | Use when |
|-----|----------|
| [snippet.txt](snippet.txt) | Mechanics canon |
| [primal.txt](primal.txt) | Product narrative |
| [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) | Shell tokens and utilities |
| [CHANGELOG.md](CHANGELOG.md) | Shipped vs planned |
| [.cursor/agents/verifier.md](.cursor/agents/verifier.md) | Pre-tag QA |
