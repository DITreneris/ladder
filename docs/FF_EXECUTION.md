# F&F execution runbook — Corporate Ladder

**Goal:** 9/10 friends-and-family readiness · **Window:** 2026-05-31 → 2026-06-14  
**Tracker:** [FF_TEST.md](FF_TEST.md) · **Device QA:** [DEVICE_QA_v1.8.1.md](DEVICE_QA_v1.8.1.md) + [DEVICE_QA_v1.8.2.md](DEVICE_QA_v1.8.2.md)

---

## Phase A — Engineering (complete in repo)

- [x] Score submit failure toasts (auth / rate limit / network)
- [x] Auth degradation banner on home when profile sync fails
- [x] Deterministic Meeting Monday badges (rung id)
- [x] Share toast: "Share sheet opened"
- [x] Leaderboard tab: Last 7 Days; satirical empty state
- [x] API rank vs years validation on `/runs`

**Before inviting testers:** redeploy Vercel + Railway API (if not auto-deployed from `main`).

---

## Phase B — Deploy and smoke

### Pre-deploy (local)

```powershell
cd c:\Users\tomas\Desktop\069_ladder
.\scripts\smoke-local.ps1
cd apps\mini-app
npm run preview
# second terminal:
npm run qa:viewport
```

### Post-deploy smoke (production) — 2026-06-01

| Step | Result |
|------|--------|
| API health | `{"status":"ok"}` |
| Local smoke | Passed (pytest 15, vitest 38, build) |
| Viewport QA | Passed (preview :4175) |
| Vercel redeploy | **Manual** — push `main` to trigger |
| Telegram full run | **Manual** — after redeploy |

| # | Check | Pass |
|---|-------|------|
| 1 | `GET https://ladder-production-642d.up.railway.app/health` → ok | [ ] |
| 2 | `/start` → today's shift + WebApp button | [ ] |
| 3 | Ladder fills column (no narrow 192px frame) | [ ] |
| 4 | Full run → game over → submit toast (success or explicit failure) | [ ] |
| 5 | Score on Daily leaderboard | [ ] |
| 6 | Share includes `Shift:` line | [ ] |
| 7 | Home auth banner hidden after fresh bot open | [ ] |

Update [DEPLOY_STATUS.md](DEPLOY_STATUS.md) step 10 when redeploy done.

---

## Phase C — Device QA sign-off

| Platform | Owner | v1.8.1 | v1.8.2 delta | Date |
|----------|-------|--------|--------------|------|
| **iOS** | Core team | [ ] | [ ] | |
| **Android** | Recruited signer | [ ] | [ ] | |

**P0 rows (block F&F if fail):** one tap = one climb; BackButton → home; responsive ladder; score on Daily LB; readable share.

On full pass → mark DEPLOY_STATUS steps 9–10 **Done**.

---

## Phase D — Internal dogfood (core team, Telegram)

Each member before external invite:

| # | Run | Pass |
|---|-----|------|
| 1 | Intern-phase death; tap deck + HUD hint | [ ] |
| 2 | Reach Manager or die to reorg; HR memo sane | [ ] |
| 3 | Share once; verify performance review text | [ ] |

Log pain items in [FF_TEST.md](FF_TEST.md) feedback buckets. Fix P0/P1 before Phase E.

---

## Phase E — External F&F launch

**Invite message:**

> Corporate Ladder — satirical office climb game in Telegram. Open **https://t.me/CorporateLadderBot** and play **3 runs** over the next few days. Tell me: (1) do taps feel responsive? (2) boring after run 2? (3) would you share your score?

**Recruit:** 5–10 testers · ≥2 iOS · ≥2 Android · not all core team.

Fill tester table in [FF_TEST.md](FF_TEST.md).

---

## Phase F — Monitor (days 1, 4, 7, 10)

Run Supabase SQL from FF_TEST.md; update metrics table.

**Hotfix within 24h:** tap bugs, layout, score submit, BackButton, crash.  
**Defer to Jun 14:** samey, too hard, v1.9 juice.

| Check-in | Date | Runs (avg) | Shares | Pain items |
|----------|------|------------|--------|------------|
| Day 1 | | | | |
| Day 4 | | | | |
| Day 7 | | | | |
| Day 10 | | | | |

---

## Phase G — Review (2026-06-14)

1. Taps solid? → hotfix train if no  
2. Sessions samey? → decals / NPC  
3. Shorter runs wanted? → Synergy Sprint  

Record v1.9 picks in FF_TEST + [ROADMAP.md](../ROADMAP.md). Cut CHANGELOG, tag release, run verifier.

---

## 9/10 scorecard

| Criterion | Status |
|-----------|--------|
| Prod = main with trust fixes | [ ] post-deploy smoke |
| iOS DEVICE_QA signed | [ ] |
| Android DEVICE_QA signed | [ ] |
| Submit/auth errors visible | [x] code shipped |
| No badge flicker | [x] code shipped |
| 5–10 testers invited | [ ] |
| ≥3 runs from majority | [ ] |
| Hotfix protocol active | [ ] |
| Jun 14 review scheduled | [x] 2026-06-14 |
