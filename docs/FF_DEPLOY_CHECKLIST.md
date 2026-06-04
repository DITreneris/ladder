# Combined deploy — v1.9.0 + v2.0.0 + F&F UX pack

**When:** After local `lint` / `test` / `build` green.  
**Refs:** [DEPLOY.md](../DEPLOY.md) · [DEVICE_QA_v2.0.md](DEVICE_QA_v2.0.md) · [FF_METRICS_2026-06-04.md](FF_METRICS_2026-06-04.md)

## Pre-deploy (local)

```powershell
cd packages\api; pytest
cd ..\..\apps\mini-app
npm run lint; npm test; npm run build
npm run preview
# separate terminal:
npm run qa:viewport; npm run qa:layout; npm run qa:coffee
python ..\..\scripts\ff-metrics.py
```

## 1. Supabase

- [ ] Run [002_v2_hardening.sql](../supabase/migrations/002_v2_hardening.sql) (`submit_cooldowns`, `api_sessions`)

## 2. Railway API + Bot

- [ ] Redeploy API from `packages/api`
- [ ] Redeploy bot from `apps/bot` (synergy_sprint in rotation)
- [ ] `GET /health` → 200

## 3. Vercel mini-app

- [ ] Redeploy `apps/mini-app`
- [ ] Verify prod bundle hash in [DEBUG_ENV_TRIAGE.md](DEBUG_ENV_TRIAGE.md)
- [ ] Telegram cache bust — reopen from @bot

## 4. Post-deploy smoke

- [ ] `python scripts/ff-metrics.py` → `submit_pipeline_ok: true`
- [ ] Play one run → score on Daily LB
- [ ] Leaderboard self-row visible when signed in
- [ ] Tap avatar on home → emoji cycles

## 5. Device QA

- [ ] [DEVICE_QA_v2.0.md](DEVICE_QA_v2.0.md) rows 1–10 (iOS + Android)
- [ ] [DEVICE_QA_v1.8.5.md](DEVICE_QA_v1.8.5.md) regression rows 1–5
- [ ] Close [todo.md](todo.md) Tier A V-08–V-14

## 6. Tag

```powershell
git tag -a v1.9.0 -m "v1.9.0 — near-miss wince, Synergy Sprint, F&F UX pack"
git tag -a v2.0.0 -m "v2.0.0 — platform hardening + Corporate triage"
git push origin --tags
```

Cut CHANGELOG `[Unreleased]` → ship sections on tag day.
