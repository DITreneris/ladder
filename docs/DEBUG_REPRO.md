# Manual repro checklist — reactions (R1–R5)

**Incident history & triage order:** [DEBUG_FIX_2026-06-01.md](DEBUG_FIX_2026-06-01.md) · **Agent:** [debug-steward](../.cursor/agents/debug-steward.md)

Use with `?debug=1` on the URL **or** in Telegram DevTools console once:

```javascript
localStorage.setItem('cl_debug', '1')
```

Then reopen the Mini App. Debug persists across sessions until `localStorage.removeItem('cl_debug')`.

The debug panel shows:
- **Line 1:** what the next rung needs (e.g. `Meeting on RIGHT → tap LEFT`)
- **Line 2:** what your last tap did (e.g. `Tap LEFT → safe climb`)
- **History:** last 5 events

During the first 12 rungs (and always in debug), the HUD line `#imminentHint` repeats the same plain-English next-rung text.

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
| L1 | HUD vs play vs tap same outer width (±2px) | [ ] — `npm run qa:layout`; also stable **after first tap** — [DEBUG_FIX_2026-06-01.md](DEBUG_FIX_2026-06-01.md) |
| L2 | `#gameContentColumn` wraps HUD + play + tap | [ ] |
| L3 | Tap deck not wider than HUD | [ ] |
| L4 | Home badge/ticker/CTA one gutter column | [ ] |
| L5 | Leaderboard / How to Play use `cl-shell-gutter` (no p-5 jump) | [ ] |

Automated: `npm run qa:viewport`, `npm run qa:layout`, `scripts/smoke-local.ps1`.
