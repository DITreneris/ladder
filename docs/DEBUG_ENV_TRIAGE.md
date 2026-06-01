# Environment triage — gameplay + layout audit (2026-06-01)

**Postmortem (ladder width, debug session):** [DEBUG_FIX_2026-06-01.md](DEBUG_FIX_2026-06-01.md)

Pass/fail after trust hotfix push (`c253d26`+). Re-check after each deploy.

| Surface | Bundle hash | 4 plotiai? | Kava reaction? | Death reaction? | Notes |
|---------|-------------|------------|----------------|-----------------|-------|
| Telegram prod | `main-mUiaglh1.js` (2026-06-01 curl) | Retest on device | Retest | Retest | Pre–Wave-1 sprint deploy; redeploy after C-02/C-03 fixes |
| Local build (post-sprint) | `main-BWQOXY_x.js` (2026-06-01) | `qa:layout` pass — play 316px stable tap 0→1 @390px | R2 in DEBUG_REPRO | R3 in DEBUG_REPRO | `npm run preview` + `qa:layout` |
| Browser preview | local `npm run build` | Run `npm run qa:layout` | R2 in DEBUG_REPRO | R3 in DEBUG_REPRO | |
| npm run dev | n/a (HMR) | Visual | `?debug=1` | `?debug=1` | |

**Layout measurements (local preview, post-sprint):**

| Viewport | `#gamePlayArea` tap 0 | tap 1 | Delta |
|----------|----------------------|-------|-------|
| 390px | 316px | 316px | 0px |
| 320px | 246px | 246px | 0px |

**Prod check command:**

```powershell
curl.exe -s "https://www.promptanatomy.lol" | Select-String "main-.*\.js"
curl.exe -s https://ladder-production-642d.up.railway.app/health
```

**If Telegram still shows old hash:** force-close Mini App, reopen from bot, or clear Telegram cache.
