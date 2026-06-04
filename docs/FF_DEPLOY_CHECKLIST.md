# Combined deploy — v1.9.0 + v2.0.0 + F&F UX pack

**When:** Jun 4–14 soft-launch F&F. **Tags:** `v1.9.0` + `v2.0.0` applied 2026-06-14 — [CHANGELOG](../CHANGELOG.md#190---2026-06-14).  
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

- [x] Prod bundle per [DEBUG_ENV_TRIAGE.md](DEBUG_ENV_TRIAGE.md) (2026-06-04 curl)
- [ ] **OG redeploy** after `npm run adopt:og` — verify `https://www.promptanatomy.lol/og.png`
- [ ] Telegram cache bust — reopen from @bot; confirm v1.9 features (avatar picker, LB self-row)

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

## 6. Tag (done 2026-06-14)

CHANGELOG cut per [FF_REVIEW_2026-06-14.md](FF_REVIEW_2026-06-14.md) §H. Tags on release-cut commit:

```powershell
git tag -a v1.9.0 -m "v1.9.0 — F&F juice, UX pack, OG adopt, onboarding clarity"
git tag -a v2.0.0 -m "v2.0.0 — platform hardening + triage rung"
git push origin v1.9.0 v2.0.0
```
