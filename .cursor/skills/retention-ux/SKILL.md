---
name: retention-ux
description: First-run tutorial, home trim, context slot, onboarding friction. Use when changing home above-the-fold, tutorial flow, or retention UX from the audit plan.
---

# Retention UX

**Scope:** First-session and home-screen retention polish — not new game mechanics. Full phased plan: [docs/UX_RETENTION_PLAN.md](../../docs/UX_RETENTION_PLAN.md). Pre-launch audit: [docs/prelaunch_audit2.md](../../docs/prelaunch_audit2.md) §15.

## When to load

- First-run tutorial changes
- Home above-the-fold density (`#homeContextSlot`, `#homeGameplayPreview`)
- Employee Badge loading states
- Onboarding friction fixes from F&F data

## Key DOM + flags

| Element / flag | Role |
|----------------|------|
| `#homeContextSlot` | Rotating slot: news ticker, daily shift, challenge banner (6s crossfade) |
| `#challengeBanner` | Pins in context slot until dismissed (see [share-virality](../share-virality/SKILL.md)) |
| `#homeGameplayPreview` | Mechanics card; collapses ≤620px only (Unreleased) |
| `.home-skeleton` | Badge fields pulse while `/auth/me` loads |
| `.home-hero-idle` | Briefcase hero micro-animation; off under reduced-motion / capture |
| `#imminentHint` | Next-rung guidance through Intern phase (40 rungs) |
| `corp_ladder_tutorial_done` | localStorage flag when tutorial completes |
| `getReapplyCount()` | Energy HUD label first 5 runs; revive first-run gate |

## First-run tutorial (current — Unreleased)

**Glow-only rungs 1–3:**
- Safe-side button glow on scripted rungs
- Wrong-tap → HR memo only (no death)
- **No overlay card** on rungs 1–3
- Rung 4+ restores normal imminent hint flow

**Do not** re-add forced overlay tutorial card without ROADMAP / UX plan update.

## Reduced motion

- Daily shift shown statically under context slot when `prefers-reduced-motion`
- No hero idle sway under reduced-motion or OG capture mode
- Tutorial glow may simplify — game must remain playable

## Files

| File | Role |
|------|------|
| `apps/mini-app/src/app.ts` | Home context rotation, tutorial gating, preview collapse |
| `apps/mini-app/src/template.ts` | `#homeContextSlot`, gameplay preview shell |
| `apps/mini-app/src/style.css` | `.home-skeleton`, `.home-hero-idle`, context slot utilities |
| `apps/mini-app/src/lib/debug.ts` | `getSafeTapSide()`, `INTERN_HINT_RUNGS` |
| `apps/mini-app/src/lib/analytics.ts` | `tutorial_complete` event |

## Verifier checks

- [ ] First run: glow-only tutorial rungs 1–3; no overlay card blocking tap deck
- [ ] Energy label visible first 5 runs
- [ ] Home badge skeleton during profile load
- [ ] Context slot rotates; challenge pins when active
- [ ] `#homeGameplayPreview` behavior matches viewport rules (≤620px collapse)

## Out of scope

- Friends leaderboard, quests with currency — [mvp-scope](../../docs/mvp-scope.md)
- Full v1.1 analytics dashboard — funnel events via TON SDK only
