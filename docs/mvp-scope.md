# Corporate Ladder — MVP Scope

**Doc map:** [DOCS_INDEX.md](../DOCS_INDEX.md) · **Release train:** [ROADMAP.md](../ROADMAP.md) · **Ship history:** [CHANGELOG.md](../CHANGELOG.md)

Canonical scope for the shipped v1 product (including v1.5 design polish and v1.6 fairness/onboarding). Origin concept: [primal.txt](../primal.txt) (historical). Playable reference: [snippet.txt](../snippet.txt) (mechanics canon with parity notes).

## One-Line Pitch

A fast-paced Telegram Mini App where players climb the corporate ladder while dodging meetings, reorganizations, and deadline crashes — all while their energy meter drains like a Friday afternoon.

## v1 — Shipped (core + polish)

### Gameplay

- Tap left/right to climb one rung per tap (Lumberjack-style)
- Three obstacle types, **rank-gated:**
  - **Meeting** — static block (Intern phase)
  - **Reorganization** — swaps sides periodically (Manager+)
  - **Deadline** — cloud block (CEO phase; code type `burnout`)
- **Energy meter:** constant depletion after first tap; climbing adds small recovery; coffee pickups add +25%
- Three ranks: Intern → Manager (10 years) → CEO (35 years)
- Primary score: Career Years Survived; secondary: final rank at termination
- Satirical promotion and failure messages with rank-flavored variants
- **v1.6 fairness/onboarding:** Intern tutorial ramp (lower spawn rate first 12 rungs; guaranteed coffee by rung 8 if none collected); reorg fairness (next rung exempt from swap); 2s energy drain pause on promotion; HUD milestone chip; game-over death cause + retry tips

### Screens

- Home (news ticker, best score, Punch In)
- Game (HUD, tap zones, climb arena)
- Game Over (performance card, share, retry)
- Leaderboard (Daily + Weekly tabs)
- How to Play (career phases, obstacle tutorial)

### Telegram Integration

- Auto-login via Telegram WebApp `initData`
- Display user name from Telegram profile (read-only in Telegram)
- Native share via `Telegram.WebApp.shareMessage()` with clipboard fallback
- Full viewport in Telegram; theme from `themeParams`; haptics; vertical-swipe lock during runs

### Leaderboards (v1)

- **Daily** — best run today (UTC midnight cutoff)
- **Weekly** — best run in rolling 7-day window
- Top 50 entries per period; current user row highlight when authenticated

### Co-branding (DITreneris family)

- Prompt Anatomy footer, share attribution, and bot “Visit Prompt Anatomy” link
- Not a v1.1 feature — family requirement shipped in v1.5

### Infrastructure

- Mini App on Vercel (TypeScript + Vite + Tailwind)
- Python FastAPI API on Railway
- Telegram bot on Railway (`/start` opens Mini App)
- Supabase Postgres for users and game runs
- CI: API pytest, bot import, mini-app lint/test/build/viewport QA

### Post-MVP polish releases

v1.5 (design system, effects, co-branding) and v1.6 (progress/fairness) are **polish on v1**, not scope expansion. Detailed inventory: [ROADMAP.md](../ROADMAP.md) § Shipped baseline.

## Terminology

| Context | Term |
|---------|------|
| UI / player-facing copy | **Energy**, **Deadline** |
| Engine obstacle type ID | `burnout` (unchanged in code) |
| API `termination_cause` | Human strings e.g. `"Deadline Crash"`, `"Meeting Collision"` |
| Concept / pitch narrative | “burnout” acceptable as workplace satire, not HUD label |

## v1.1 — Deferred

- Friends leaderboard
- All-time / Legends tab
- Server-side replay validation (anti-cheat)
- Analytics (session length, share rate, retention)
- Admin dashboard

## Explicitly Out of Scope

- Virtual currency
- Marketplace
- Skins
- Clans
- Quests
- NFTs / blockchain
- Complex progression trees (Director, VP, etc.)

## Success Metrics

Track after launch:

- Average session length (target: 30–90 seconds)
- Games per user
- Share rate
- Daily retention
- Leaderboard participation

## Design Principle

**The humor is the product.** Workplace satire differentiates Corporate Ladder from generic arcade clones. Preserve tone in all copy changes — see [.cursor/rules/satirical-copy.mdc](../.cursor/rules/satirical-copy.mdc) and [DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md).
