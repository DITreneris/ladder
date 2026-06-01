---
name: debug-triage
description: Fast debug triage for Corporate Ladder Mini App — bundle hash, layout width after tap, reactions, API trust. Use when gameplay looks broken, ladder narrows, or prod differs from repo.
---

# Debug triage skill

Load this skill **before** deep-diving game logic or UX copy. Target: **15 minutes to know which bucket** (deploy / layout / reactions / API).

**Incident history:** [docs/DEBUG_FIX_2026-06-01.md](../../docs/DEBUG_FIX_2026-06-01.md)  
**Manual checklists:** [docs/DEBUG_REPRO.md](../../docs/DEBUG_REPRO.md)  
**Prod hash table:** [docs/DEBUG_ENV_TRIAGE.md](../../docs/DEBUG_ENV_TRIAGE.md)  
**Agent owner:** [.cursor/agents/debug-steward.md](../../agents/debug-steward.md)

---

## Step 0 — Classify the report

| Bucket | User says | First check |
|--------|-----------|-------------|
| **Deploy** | “Worked yesterday”, “fix not on phone” | Bundle hash ([DEBUG_ENV_TRIAGE.md](../../docs/DEBUG_ENV_TRIAGE.md)) |
| **Layout width** | “Ladder narrow”, “4 bands”, “misaligned tap deck” | Width at tap 0 vs tap 1 (Step 2) |
| **Layout height** | “Rungs squashed”, “can’t see ladder” | Play area height + rung height; HR memo visible |
| **Reactions** | “No emoji”, “coffee invisible”, “tap dead” | [DEBUG_REPRO.md](../../docs/DEBUG_REPRO.md) R1–R5 |
| **API / trust** | “Score not saved”, “leaderboard empty” | Network tab, `/runs`, `/leaderboard`, CHANGELOG trust fixes |

Work **one bucket at a time**.

---

## Step 1 — Environment (≤5 min)

1. Read [DEBUG_ENV_TRIAGE.md](../../docs/DEBUG_ENV_TRIAGE.md).
2. Compare prod bundle hash vs local `npm run build` output filename.
3. If prod is stale → stop debugging code; redeploy and retest.

```powershell
curl.exe -s "https://www.promptanatomy.lol" | Select-String "main-.*\.js"
```

---

## Step 2 — Layout width (≤5 min)

**Critical regression from 2026-06-01:** play area must not shrink after first tap.

1. `cd apps/mini-app && npm run build && npm run preview`
2. Open game, note `#gamePlayArea` width (DevTools or script below).
3. Perform **one** tap (button or Arrow key).
4. Wait ≥500ms; measure again.

```javascript
// DevTools console at game screen
const w = () => document.getElementById("gamePlayArea")?.clientWidth;
console.log({ before: w(), afterTap: "tap once then re-run w()" });
```

**Pass:** delta ≤ 2px.  
**Fail:** investigate `#app` / `body` layout (`index.html`, `#app` rules in `style.css`). See [DEBUG_FIX_2026-06-01.md](../../docs/DEBUG_FIX_2026-06-01.md).

Automated: `npm run qa:layout` (column alignment at start). Future: layout audit after simulated tap.

---

## Step 3 — Automated layout QA (≤5 min)

```bash
cd apps/mini-app
npm run lint && npm test && npm run build
npm run preview   # separate terminal
npm run qa:viewport
npm run qa:layout
```

---

## Step 4 — Reactions / debug mode

1. Enable debug: `?debug=1` or `localStorage.setItem('cl_debug','1')` then reopen.
2. Run [DEBUG_REPRO.md](../../docs/DEBUG_REPRO.md) R1–R5 manually or spot-check.
3. Use `#imminentHint` + debug strip to confirm tap → engine → render chain.

Do **not** use `window.engine` — it is not part of the public API.

---

## Step 5 — Document and hand off

| Outcome | Action |
|---------|--------|
| Multi-hour session | Create/update `docs/DEBUG_FIX_YYYY-MM-DD.md` |
| User-visible fix | [CHANGELOG.md](../../CHANGELOG.md) `[Unreleased]` + link to incident doc |
| Checklist change | Update DEBUG_REPRO or DEBUG_ENV_TRIAGE |
| Ready to ship | Run [verifier](../../agents/verifier.md) |

---

## Anti-patterns (learned 2026-06-01)

- Debugging game logic before measuring `#gamePlayArea.clientWidth` at tap 1
- Assuming HR memo text causes horizontal shrink (memo alone does not)
- Measuring `getBoundingClientRect().width` mid-animation
- Treating vertical rung compression (HR memo) as horizontal “narrow ladder” without checking both axes
- Testing prod behavior against an unpushed local fix
