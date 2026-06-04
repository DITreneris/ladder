# Corporate Ladder — MVP Scope

**Doc map:** [DOCS_INDEX.md](../DOCS_INDEX.md) · **Shipped inventory:** [ROADMAP.md](../ROADMAP.md) § Shipped baseline · **History:** [CHANGELOG.md](../CHANGELOG.md) · **v0.1 archive:** [archive/README.md](archive/README.md)

**Role of this file:** Scope **boundaries** only (what v1 is, what is deferred, what is forbidden). Do **not** duplicate the mechanics/UI inventory here — that lives in [ROADMAP.md](../ROADMAP.md) § Shipped baseline (through v1.8.5; v1.9 F&F + v2.0 triage in [CHANGELOG](../CHANGELOG.md)).

---

## Product (v1)

Telegram Mini App: tap left/right to climb the corporate ladder; dodge meetings, reorgs, and deadlines; energy drains over time. Score = **Career Years Survived**. Satirical HR framing on promotions and game-over.

**Pitch:** Fast-paced office climb where your energy meter drains like a Friday afternoon.

**Current release context:** [ROADMAP.md](../ROADMAP.md) **Status** (v1.9.0 + v2.0.0 tagged; soft launch / F&F active).

---

## v1 boundary (one screen)

| In v1 | Out (needs v1.1+ or product decision) |
|-------|----------------------------------------|
| Core L/R climb + rank-gated obstacles + energy + coffee | Friends / Legends leaderboard |
| Daily + Weekly (Last 7 Days) leaderboards | All-time tab |
| Telegram auth, share, bot `/start`, native shell (BackButton, safe areas) | Server analytics dashboard |
| Daily shift presets (UTC) | Anti-cheat replay validation (full server replay — v1.1) |
| Co-branding (Prompt Anatomy footer / bot link) | Currency, skins, clans, quests, NFTs |
| Trust UX: score-submit toasts, auth banner, API rank/years check | New control schemes (swipe, hold-to-dodge, etc.) |
| Three-lane **visual** corridor (v1.8.5) — center aisle + TAP LEFT/RIGHT only | Third tap / center spawn / stay-center mechanic |
| **v2.0** score plausibility cap + session leaderboard tokens | — |
| **v2.0** Corporate triage rung (Manager+ spawn bias) — [V2_TRIAGE_SPIKE.md](V2_TRIAGE_SPIKE.md) | Other new obstacle logic without product approval |

**Everything shipped in v1.5–v1.8.5** (fairness, narrative, mobile UX, OG meta, corridor onboarding) is **polish on this boundary**, not a new product — see [CHANGELOG](../CHANGELOG.md) and ROADMAP release train.

---

## Terminology (locked)

| Context | Term |
|---------|------|
| UI / player-facing copy | **Energy**, **Deadline** |
| Engine obstacle type ID | `burnout` (unchanged in code) |
| API `termination_cause` | Human strings e.g. `"Deadline Crash"`, `"Meeting Collision"` |
| Pitch / narrative | “burnout” OK as workplace satire; not a HUD label |

---

## v1.1 — Deferred (explicit approval required)

- Friends leaderboard
- All-time / Legends tab
- Server-side replay validation (anti-cheat)
- Product analytics (session length, share rate, retention) — not Vercel page views alone
- Admin dashboard

Listed in [CHANGELOG](../CHANGELOG.md) `[Unreleased]` → Planned (v1.1). Do not implement as part of v1.9 juice without approval.

---

## Explicitly out of scope (never slip in casually)

Align with [ROADMAP.md](../ROADMAP.md) § Explicitly out of scope:

- Virtual currency, marketplace, skins, clans, quests, NFTs / blockchain
- Complex rank tree (Director, VP, …)
- New obstacle logic (both sides lethal, moving hazards, hold-to-dodge) — except explicit v2 “triage rung” thesis after F&F
- Separate antagonist AI / combat
- Heavy parallax or full arena redesign
- Breaking fourth wall (“this is a game”)
- Random negative coffee / decaf trap

---

## Success metrics (F&F and post-launch)

Track via [FF_TEST.md](FF_TEST.md) / Supabase — not in mini-app alone:

| Metric | Target |
|--------|--------|
| Session length | 30–90 seconds |
| Games per user | Rise over F&F window |
| Share rate | Qualitative + count |
| Daily return | Repeat opens within 7 days |
| Leaderboard participation | At least one submitted run |

---

## Design principle

**The humor is the product.** Tone: [.cursor/rules/satirical-copy.mdc](../.cursor/rules/satirical-copy.mdc). Visual canon: [DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md).

---

## Where agents should read (audit router)

| Question | Document |
|----------|----------|
| Can we ship this feature in v1? | **This file** + ROADMAP § Explicitly out of scope |
| What is already built? | **ROADMAP** § Shipped baseline |
| What ships next? | **ROADMAP** Status + v1.9 / F&F |
| Per-release diff | **CHANGELOG** |
| Original HTML / concept v0.1 | **docs/archive/** (excluded from routine audits) |
