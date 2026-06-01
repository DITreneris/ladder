# Environment triage — gameplay + layout audit (2026-06-01)

**Postmortem (ladder width, debug session):** [DEBUG_FIX_2026-06-01.md](DEBUG_FIX_2026-06-01.md)

Pass/fail after trust hotfix push (`c253d26`+). Re-check after each deploy.

| Surface | Bundle hash | 4 plotiai? | Kava reaction? | Death reaction? | Notes |
|---------|-------------|------------|----------------|-----------------|-------|
| Telegram prod | `main-7DTXR6XJ.js` (2026-06-01) | pass (rows 1–5) | pass (row 4) | pass (row 3) | Human sign-off 2026-06-01 |
| Local build | `main-BOIp6dYp.js` (v1.9 unreleased) | `qa:layout` pass | `qa:coffee` pass | `qa:coffee` pass | Redeploy pending |
| Browser preview | local `npm run build` | Run `npm run qa:layout` | `?qa=1` + `npm run qa:coffee` | same | |
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
