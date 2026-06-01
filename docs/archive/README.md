# Archive — historical reference only

Files here are **origin artifacts** from v0.1 planning and the HTML prototype. They are **not** part of routine agent audits, release gates, or day-to-day implementation.

## Active sources of truth (use these instead)

| Need | Read |
|------|------|
| Mechanics / scope | [docs/mvp-scope.md](../mvp-scope.md), [ROADMAP.md](../../ROADMAP.md) § Shipped baseline, `apps/mini-app/src/game/` |
| Satirical tone | [.cursor/rules/satirical-copy.mdc](../../.cursor/rules/satirical-copy.mdc), `constants.ts` |
| UI patterns | [DESIGN_SYSTEM.md](../../DESIGN_SYSTEM.md) |
| Product status | [ROADMAP.md](../../ROADMAP.md) **Status** |

## Archived files

| File | What it was | When to open |
|------|-------------|--------------|
| [snippet.txt](snippet.txt) | Single-file HTML prototype (Lumberjack-style climb) | Disputes about *original* control layout; parity archaeology only |
| [primal.txt](primal.txt) | MVP concept v0.1 narrative | Historical tone / pitch archaeology only |

**Policy:** Do not port new features from archive files without updating [mvp-scope.md](../mvp-scope.md) and [ROADMAP.md](../../ROADMAP.md) first. Shipped product intentionally diverges (Energy/Deadline labels, rank gates, v1.6+ fairness, v1.8.2 tap deck).

**Tip:** Add `docs/archive/` to repo-root `.cursorignore` so Cursor skips these files in @-context and audits (optional; policy above still applies).
