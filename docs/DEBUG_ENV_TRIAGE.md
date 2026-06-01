# Environment triage — gameplay + layout audit (2026-06-01)

Pass/fail after trust hotfix push (`c253d26`+). Re-check after each deploy.

| Surface | Bundle hash | 4 plotiai? | Kava reaction? | Death reaction? | Notes |
|---------|-------------|------------|----------------|-----------------|-------|
| Telegram prod | `main-BVz1aF34.js` (2026-06-01 curl) | Retest on device | Retest | Retest | Vercel redeployed; hard-reopen bot |
| Browser preview | local `npm run build` | Run `npm run qa:layout` | R2 in DEBUG_REPRO | R3 in DEBUG_REPRO | |
| npm run dev | n/a (HMR) | Visual | `?debug=1` | `?debug=1` | |

**Prod check command:**

```powershell
curl.exe -s "https://www.promptanatomy.lol" | Select-String "main-.*\.js"
curl.exe -s https://ladder-production-642d.up.railway.app/health
```

**If Telegram still shows old hash:** force-close Mini App, reopen from bot, or clear Telegram cache.
