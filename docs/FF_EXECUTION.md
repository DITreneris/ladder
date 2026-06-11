# F&F execution runbook — Corporate Ladder

**Goal:** Soft-launch GO on **2026-06-14** (F&F expansion only — no public marketing)  
**Window:** 2026-06-01 → 2026-06-14  
**Tracker:** [FF_TEST.md](FF_TEST.md) · **GO plan:** [FF_REVIEW_2026-06-14.md](FF_REVIEW_2026-06-14.md) · **Device QA:** [DEVICE_QA_v2.0.md](DEVICE_QA_v2.0.md) + [DEVICE_QA_v1.8.5.md](DEVICE_QA_v1.8.5.md)

---

## Phase A — Engineering (complete in repo)

- [x] Score submit failure toasts (auth / rate limit / network)
- [x] Auth degradation banner on home when profile sync fails
- [x] Deterministic Meeting Monday badges (rung id)
- [x] Share toast: "Review copied! Paste into Telegram to share."
- [x] Leaderboard tab: Last 7 Days; satirical empty state
- [x] API rank vs years validation on `/runs`
- [x] v1.9 juice + F&F UX pack + v2.0 hardening in repo

**Before external F&F:** redeploy Vercel + Railway API + Supabase `002` (see Phase B).

---

## Phase B — Deploy and smoke (v1.9 + v2.0 train)

### Pre-deploy (local)

| Step | Result |
|------|--------|
| `scripts/smoke-local.ps1` | [ ] pytest + vitest + lint/build + qa:viewport/layout/coffee |
| Supabase `002_v2_hardening.sql` | [ ] applied — confirm `python scripts/ff-metrics.py` → `migration_002_ok: true` |
| Push `main` → Vercel + Railway | [ ] |

### Post-deploy smoke (production)

| Step | Result |
|------|--------|
| API health | [ ] `{"status":"ok"}` |
| Prod bundle hash | [ ] recorded in [DEBUG_ENV_TRIAGE.md](DEBUG_ENV_TRIAGE.md) |
| `python scripts/ff-metrics.py` | [ ] `submit_pipeline_ok: true` |
| Telegram cache bust | [ ] reopen from @CorporateLadder_bot |

| # | Check | Pass |
|---|-------|------|
| 1 | `GET https://ladder-production-642d.up.railway.app/health` → ok | [ ] |
| 2 | `/start` (private) → shift + WebApp button; `/go@bot` (group) → `t.me?startapp` | [ ] |
| 3 | Ladder fills column (no narrow 192px frame) | [ ] manual — **P0** |
| 4 | Full run → game over → submit toast (success or explicit failure) | [ ] |
| 5 | Score on Daily leaderboard; self-row highlight (v1.9) | [ ] |
| 6 | Share includes `Shift:` line (clipboard paste in Telegram) | [ ] manual — **P0** |
| 7 | Home auth banner hidden after fresh bot open | [ ] manual |
| 8 | Triage prompt at Manager+ (v2.0) | [ ] manual |

**Optional — API keep-warm:** Ping health every 5 min if cold-start reported.

Update [DEPLOY_STATUS.md](DEPLOY_STATUS.md) steps 12–13 when deploy complete.

---

## Phase C — Device QA sign-off

| Platform | v1.8.5 rows 1–5 | v1.8.5 rows 6–10 | v2.0 rows 1–8 | Date |
|----------|-------------------|------------------|---------------|------|
| **iOS** | [x] 2026-06-01 | [ ] | [ ] | |
| **Android** | [x] 2026-06-01 | [ ] | [ ] | |

**P0 rows:** one tap = one climb; BackButton → home; responsive ladder; score on Daily LB; readable share.

---

## Phase D — Internal dogfood (core team, Telegram)

Complete before external invite:

| # | Run | Pass |
|---|-----|------|
| 1 | Intern-phase death; tap deck + HUD hint | [ ] |
| 2 | Reach Manager or die to reorg; HR memo sane | [ ] |
| 3 | Share once; verify performance review text + `Shift:` line | [ ] |

Log pain items in [FF_TEST.md](FF_TEST.md). Fix P0/P1 before Phase E.

**Tier A trust:** V-08–V-14 in [todo.md](todo.md) §6 — sign during dogfood.

---

## Phase E — External F&F (soft launch cohort)

**Target:** **8 testers** · ≥2 iOS · ≥2 Android · not core team · **≥6 must complete 3-run script**

**Invite message:**

> Corporate Ladder — satirical office climb game in Telegram (**soft launch — your feedback shapes the game**). Open **https://t.me/corporateladder_bot** and play **3 runs** over the next few days. Tell me: (1) do taps feel responsive? (2) boring after run 2? (3) would you share your score?

Track in [FF_TEST.md](FF_TEST.md) tester table.

---

## Phase F — Monitor (Jun 4, 7, 10, 14)

Run `python scripts/ff-metrics.py` + Supabase SQL from FF_TEST.md.

**Hotfix within 24h:** tap bugs, layout, score submit, BackButton, crash.  
**Defer to Jun 14:** samey, too hard, backlog items in [FF_REVIEW_2026-06-14.md](FF_REVIEW_2026-06-14.md) §E.

| Check-in | Date | Notes |
|----------|------|-------|
| Day 4 | 2026-06-04 | [FF_METRICS_2026-06-04.md](FF_METRICS_2026-06-04.md): 346 runs, 5 players |
| Day 7 | 2026-06-07 | Mid-window; Tier A due; update FF_TEST metrics |
| Day 10 | 2026-06-10 | [FF_METRICS_2026-06-10.md](FF_METRICS_2026-06-10.md); DEVICE_QA rows 6–10; verify §B gates |
| Day 14 | 2026-06-14 | Soft-launch GO review |

---

## Phase G — Review (2026-06-14)

**Full agenda:** [FF_REVIEW_2026-06-14.md](FF_REVIEW_2026-06-14.md) §G.

1. Walk pre-review gate checklist (§B)
2. Vote soft-launch GO matrix (§C)
3. Fill backlog decisions (§E — default defer)
4. If GO: cut CHANGELOG (§H) · tag `v1.9.0` + `v2.0.0` · run verifier
5. If GO: invite 5 more testers; schedule public-launch review ~2026-06-28

---

## 9/10 scorecard (soft launch)

| Criterion | Status |
|-----------|--------|
| v1.9 + v2.0 deployed to prod | [ ] |
| Supabase `002` applied | [ ] |
| Automated CI gates | [x] vitest + lint + build (repo) |
| API health + `ff-metrics.py` | [x] 2026-06-04 · re-verify post-deploy |
| iOS DEVICE_QA v2.0 rows 1–8 | [ ] |
| Android DEVICE_QA v2.0 rows 1–8 | [ ] |
| Submit/auth errors visible | [x] code shipped |
| Share clipboard + `Shift:` line | [ ] device verify |
| 8 external testers invited | [ ] |
| ≥6 externals completed 3-run script | [ ] |
| Tier A V-08–V-14 signed | [ ] |
| Zero open pain items | [ ] |
| Jun 14 GO plan ready | [x] [FF_REVIEW_2026-06-14.md](FF_REVIEW_2026-06-14.md) |
| v1.8.5 tagged | [x] `46abf19` |
| v1.9.0 + v2.0.0 tagged | [x] 2026-06-14 release cut |
