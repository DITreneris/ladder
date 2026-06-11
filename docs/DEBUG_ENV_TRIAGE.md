# Environment triage — gameplay + layout audit

**Canonical prod bundle reference** — update this table after each Vercel deploy; other docs link here instead of duplicating hashes.

**Postmortem (ladder width, debug session):** [DEBUG_FIX_2026-06-01.md](DEBUG_FIX_2026-06-01.md)

Re-check after each deploy.

| Surface | Bundle hash | 4 plotiai? | Kava reaction? | Death reaction? | Notes |
|---------|-------------|------------|----------------|-----------------|-------|
| Telegram prod | `main-C5waaxFU.js` (2026-06-11 curl) | verify rows 1–5 | verify row 4 | verify row 3 | `b7c19be` v2.1.0 sprint; DEVICE_QA v2.0 pending |
| Local build | `main-DEv7UjEZ.js` (2026-06-11) | `qa:layout` pass | `qa:coffee` pass | vitest 119 pass | v2.1.1 + v2.2.0 retention train |
| Browser preview | local `npm run build` | Run `npm run qa:layout` | `npm run qa:coffee` | same | |
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

**Post v2.0 deploy also verify:**

- Run Supabase migration `002_v2_hardening.sql`
- `POST /auth/me` returns `session_token`
- `GET /leaderboard` has no `initData` query param in mini-app network tab
- `python scripts/ff-metrics.py` → `submit_pipeline_ok: true`

**If Telegram still shows old hash:** force-close Mini App, reopen from bot, or clear Telegram cache.
