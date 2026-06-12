# Environment triage — gameplay + layout audit

**Canonical prod bundle reference** — update this table after each Vercel deploy; other docs link here instead of duplicating hashes.

**Postmortem (ladder width, debug session):** [DEBUG_FIX_2026-06-01.md](DEBUG_FIX_2026-06-01.md)

Re-check after each deploy.

| Surface | Bundle hash | 4 plotiai? | Kava reaction? | Death reaction? | Notes |
|---------|-------------|------------|----------------|-----------------|-------|
| Telegram prod | `main-E7DOQaNb.js` (2026-06-12 post-push) | verify rows 1–5 | verify row 4 | verify row 3 | Vercel live @ `5928b85` · tag **`v2.2.1`** · DEVICE_QA v2.0 unsigned · gate #8 hardening rows still 0 — confirm Railway API deploy + device cooldown |
| Local build | `main-CvPR04Oz.js` (2026-06-12 pre-push) | `qa:layout` pass | vitest 126 pass | pytest 41 pass | Vercel prod hash may differ from local (CI build) |
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

**Post v2.2.1 deploy also verify:**

- `python scripts/ff-metrics.py` → `hardening_table_rows.submit_cooldowns` **> 0** (gate #8; was 0 rows 2026-06-12 pre-API redeploy)
- `POST /share/prepare` in Railway logs after device share test ([DEVICE_QA_v2.0.md](DEVICE_QA_v2.0.md) rows 11–12)
- Run Supabase migration `002_v2_hardening.sql`
- `POST /auth/me` returns `session_token`
- `GET /leaderboard` has no `initData` query param in mini-app network tab
- `python scripts/ff-metrics.py` → `submit_pipeline_ok: true`

**If Telegram still shows old hash:** force-close Mini App, reopen from bot, or clear Telegram cache.
