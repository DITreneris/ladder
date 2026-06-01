# Manual repro checklist — reactions (R1–R5)

Use with `?debug=1` on preview or dev. Debug strip shows last tap/coffee/gameover event.

| # | Action | Expected | Pass |
|---|--------|----------|------|
| R1 | Intern rungs 1–5, tap safe side | climb-pop on `#playerClimber`, slot hint on next rung | [ ] |
| R2 | Reach coffee rung, tap coffee side | 🤤 ~550ms, HR memo ☕, meter flash, badge pickup pop, debug `coffee: callback` | [ ] |
| R3 | Tap into meeting obstacle | red death flash, death emoji (💥/📅/🌀/📉) through shake, game over | [ ] |
| R4 | Tap safe side past meeting | climb-pop only (no wince — v1.9) | [ ] |
| R5 | DevTools → Rendering → prefers-reduced-motion | game still playable; shorter animations | [ ] |

## Layout checklist (L1–L5)

| # | Check | Pass |
|---|-------|------|
| L1 | HUD vs play vs tap same outer width (±2px) | [ ] — `npm run qa:layout` |
| L2 | `#gameContentColumn` wraps HUD + play + tap | [ ] |
| L3 | Tap deck not wider than HUD | [ ] |
| L4 | Home badge/ticker/CTA one gutter column | [ ] |
| L5 | Leaderboard / How to Play use `cl-shell-gutter` (no p-5 jump) | [ ] |

Automated: `npm run qa:viewport`, `npm run qa:layout`, `scripts/smoke-local.ps1`.
