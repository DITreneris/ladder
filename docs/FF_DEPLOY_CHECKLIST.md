# Combined deploy — v1.9.0 + v2.0.0 + F&F UX pack

**When:** Jun 4–5 (pre soft-launch F&F). **Tags:** Jun 14 after [FF_REVIEW GO vote](FF_REVIEW_2026-06-14.md).  
**Refs:** [DEPLOY.md](../DEPLOY.md) · [FF_REVIEW_2026-06-14.md](FF_REVIEW_2026-06-14.md) · [DEVICE_QA_v2.0.md](DEVICE_QA_v2.0.md)

## Pre-deploy (local)

| Step | Result |
|------|--------|
| `scripts/smoke-local.ps1` | [x] 2026-06-04 — pytest 20, vitest 76, build |
| `python scripts/ff-metrics.py` | [x] `submit_pipeline_ok: true` |

## 1. Supabase

- [ ] Run [002_v2_hardening.sql](../supabase/migrations/002_v2_hardening.sql) (`submit_cooldowns`, `api_sessions`)

## 2. Railway API + Bot

- [ ] Redeploy API from `packages/api` (if not auto from `main`)
- [ ] Redeploy bot from `apps/bot`
- [x] `GET /health` → 200 (2026-06-04)

## 3. Vercel mini-app

- [x] Prod bundle `main-CJgmaRAS.js` matches local build (2026-06-04 curl)
- [ ] Telegram cache bust — reopen from @bot; confirm v1.9 features (avatar picker, LB self-row)
- [ ] Record hash in [DEBUG_ENV_TRIAGE.md](DEBUG_ENV_TRIAGE.md) after device verify

## 4. Post-deploy smoke

- [x] `python scripts/ff-metrics.py` → `submit_pipeline_ok: true` (2026-06-04)
- [ ] Play one run → score on Daily LB
- [ ] Leaderboard self-row visible when signed in
- [ ] Tap avatar on home → emoji cycles
- [ ] Share paste includes `Shift:` line

## 5. Device QA

- [ ] [DEVICE_QA_v2.0.md](DEVICE_QA_v2.0.md) rows 1–8 (iOS + Android)
- [ ] [DEVICE_QA_v1.8.5.md](DEVICE_QA_v1.8.5.md) rows 6–10 spot-check
- [ ] Close [todo.md](todo.md) Tier A V-08–V-14

## 6. Tag (Jun 14 GO only)

See [FF_REVIEW_2026-06-14.md](FF_REVIEW_2026-06-14.md) §H — cut CHANGELOG then:

```powershell
git tag -a v1.9.0 -m "v1.9.0 — F&F juice + UX pack (soft launch)"
git tag -a v2.0.0 -m "v2.0.0 — platform hardening + triage rung"
git push origin v1.9.0 v2.0.0
```
