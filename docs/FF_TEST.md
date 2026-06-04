# Friends-and-family test — Corporate Ladder

**Window:** 2026-05-31 → 2026-06-14 · **Scope:** **Soft launch only** — no public marketing until ~2026-06-28 review

**Execution runbook:** [FF_EXECUTION.md](FF_EXECUTION.md) · **GO plan:** [FF_REVIEW_2026-06-14.md](FF_REVIEW_2026-06-14.md)



Use results to pick **1–2 v1.9 items** — see [ROADMAP.md](../ROADMAP.md) § v1.9+ and provisional v1.9.0 row.



---



## Pre-F&F engineering (2026-06-01)



- [x] Score submit failure toasts

- [x] Auth degradation banner

- [x] Deterministic Meeting Monday badges

- [x] Share toast accuracy

- [x] API rank vs years validation

- [x] Production redeploy from `main` (Vercel + Railway API) — `d862c3c` 2026-06-01 *(API upsert fix `786d6d8` requires separate Railway redeploy — see data audit below)*
- [x] Post-deploy smoke — API health + OG meta (automated); Telegram steps 2–7 manual in [FF_EXECUTION.md](FF_EXECUTION.md) Phase B

### Known limits for F&F (documented — not blockers)

| ID | Limit | Target fix |
|----|-------|------------|
| C-06 | Client-trusted scores (no server replay) | v1.1 anti-cheat |
| C-07 | In-memory 10s submit cooldown (per Railway worker) | v2.0 shared store |
| S-02 | Background tab energy drain (wall-clock `setInterval`) | v1.9+ fixed timestep |

Wave 1 sprint fixes (2026-06-01): C-02 career high trust, C-03 coffee animation order, C-01 layout CI guard (`qa:layout` post-tap), C-09/C-10/C-11/C-12 hygiene.

### Data audit — Supabase (2026-06-01)

**Tool:** `python scripts/ff-metrics.py` (reads root `.env`; no secrets printed)

| Check | Result |
|-------|--------|
| Supabase `users` | **2** testers (+ audit probe on script run) |
| Supabase `game_runs` | **12+** (same-day group + private plays) |
| Prod `GET /leaderboard` daily + weekly | **200**, **2** entries each |
| Prod `POST /auth/me` + `/runs` (signed probe) | **200** — `submit_pipeline_ok: true` |
| Group launch | `/go@CorporateLadder_bot` in Prompt_Anatomy supergroup → Punch In → runs persisted |

**Prior blocker (fixed):** new-user upsert 500 — resolved; scores now land in Supabase. Re-run `python scripts/ff-metrics.py` after deploy or tester sessions.


## Device QA assignment



| Platform | Signer | Status |

|----------|--------|--------|

| **iOS** | Core team | **Signed** — [DEVICE_QA_v1.8.5.md](DEVICE_QA_v1.8.5.md) rows 1–5 (2026-06-01) |

| **Android** | Core team | **Signed** — same checklist (2026-06-01) |

**Automated gates (2026-06-01):** vitest 61 passed · lint/build green · `qa:layout` + `qa:coffee` · API health ok · **`v1.8.5` tagged** on `46abf19`.



---



## Recruit (8 external testers — soft launch)

**Target:** 8 invited · **≥6 must complete 3-run script** · ≥2 iOS · ≥2 Android · not core team

**Share message:**

> Corporate Ladder — satirical office climb game in Telegram (**soft launch — your feedback shapes the game**). Open **https://t.me/CorporateLadderBot** and play **3 runs** over the next few days. Tell me: (1) do taps feel responsive? (2) boring after run 2? (3) would you share your score?

**Bot (primary entry):** https://t.me/CorporateLadderBot · `@CorporateLadderBot`

| # | Tester | Platform | Invited | Runs (≥3?) | Shared? | Notes |
|---|--------|----------|---------|------------|---------|-------|
| 1 | _(prior — re-test post v2 deploy)_ | iOS / Android | [x] | [ ] | [ ] | Submit 500 fixed — re-test after deploy |
| 2 | _(Android QA signer)_ | Android | [x] | [ ] | [ ] | DEVICE_QA only |
| 3 | | iOS / Android | [ ] | [ ] | [ ] | |
| 4 | | iOS / Android | [ ] | [ ] | [ ] | |
| 5 | | iOS / Android | [ ] | [ ] | [ ] | |
| 6 | | iOS / Android | [ ] | [ ] | [ ] | |
| 7 | | iOS | [ ] | [ ] | [ ] | |
| 8 | | Android | [ ] | [ ] | [ ] | |

**Completion count (externals with ≥3 runs):** ___ / 8 (GO requires ≥6)



---



## Internal dogfood (core team, before external invite)

**Phase D runbook** — map to [todo.md](todo.md) verification IDs:

| Run | Goal | Verify |
|-----|------|--------|
| 1 | Intern death; tap deck + HUD hint | V-04, V-06, V-15, V-08 |
| 2 | Manager/reorg; HR memo layout | V-17, P2-7, V-10 |
| 3 | Share + performance review text | V-13, V-14 |

| Member | Run 1 | Run 2 | Run 3 + share | Date |
|--------|-------|-------|---------------|------|
| Tomas | [ ] | [ ] | [ ] | |
| | [ ] | [ ] | [ ] | |



---



## Metrics (targets from [mvp-scope.md](mvp-scope.md))

**Check-in dates:** Jun 4 · Jun 7 · Jun 10 · Jun 14 review — see [FF_EXECUTION.md](FF_EXECUTION.md) Phase F.

| Metric | Target | Jun 4 | Jun 7 | Jun 10 | Jun 14 |
|--------|--------|-------|-------|--------|--------|
| Session length | 30–90s | on track | | | |
| External testers (≥3 runs) | **≥6 / 8** | 0 ext | | | |
| Distinct players (14d) | ≥8 | **5** | | | |
| Share rate | ≥1 pasted in Telegram | unknown | | | |
| Daily return (engaged) | ≥2 days/wk | **4 active days** (top 3) | | | |
| Tier A verification | V-08–V-14 | pending deploy | | | |
| Soft-launch GO gates | all §B green | | | pre-read | **vote** |

**Jun 4 detail:** [FF_METRICS_2026-06-04.md](FF_METRICS_2026-06-04.md) — 346 runs, Manager reached, no CEO in sample. **Jun 14:** `v1.9.0` + `v2.0.0` tagged — prod bundle per [DEBUG_ENV_TRIAGE](DEBUG_ENV_TRIAGE.md).



### Supabase SQL (last 14 days)



```sql

SELECT user_id, COUNT(*) AS runs,

       MIN(created_at) AS first_run,

       MAX(created_at) AS last_run,

       COUNT(DISTINCT DATE(created_at AT TIME ZONE 'UTC')) AS active_days

FROM game_runs

WHERE created_at > NOW() - INTERVAL '14 days'

GROUP BY user_id

ORDER BY runs DESC;

```



### Monitor check-ins (run SQL on days 1, 4, 7, 10)



| Day | Date | Notes |
|-----|------|-------|
| 1 | 2026-06-01 | Tag v1.8.5 + F&F kickoff; **data audit:** 0 users/runs; prod submit 500 (upsert bug) |
| 4 | 2026-06-04 | F&F UX pack in repo; [FF_METRICS_2026-06-04.md](FF_METRICS_2026-06-04.md): 346 runs, 5 players, Manager yes / CEO no |

| 7 | 2026-06-07 | |

| 10 | 2026-06-10 | |



---



## Feedback buckets



Log in GitHub Issues or a scratch column:



| Bucket | Examples |

|--------|----------|

| **pain** | Missed taps, unreadable rungs, BackButton broken |

| **samey** | Same feel every run despite v1.8 beats |

| **too hard** | Energy drain, obstacle density |

| **love it** | Share moments, funny copy |



| Date | Tester | Bucket | Detail | Action |
|------|--------|--------|--------|--------|
| 2026-06-01 | ~3–4 external | **pain** | Played via bot + game over; no scores in Supabase / empty leaderboard | **Hotfix:** `upsert_user` `maybe_single()` None guard — redeploy Railway API |



- Bugs → [.github/ISSUE_TEMPLATE/bug_report.md](../.github/ISSUE_TEMPLATE/bug_report.md)

- Ideas → [.github/ISSUE_TEMPLATE/feature_request.md](../.github/ISSUE_TEMPLATE/feature_request.md)



**Hotfix policy:** ship **pain** within 24h; defer **samey** / **too hard** to Jun 14 review.



---



## End-of-F&F review (2026-06-14)

**Soft-launch GO plan:** [FF_REVIEW_2026-06-14.md](FF_REVIEW_2026-06-14.md) — full checklist, GO matrix, tag ceremony.

Answer (qualitative):



1. **Taps solid on real devices?** → If no: hotfix, not v1.9

2. **Sessions samey?** → Antagonist NPC or decals

3. **Want shorter runs?** → Synergy Sprint preset



### Decision matrix → v1.9 pick



| Signal | Pick |

|--------|------|

| Unfair deaths / didn't see threat | Near-miss wince |

| Runs too long / "one more try" | Synergy Sprint preset |

| Arena flat | Sticky-note decals |

| Still same every day | Antagonist emoji NPC |

| Need numbers | Lightweight analytics (v1.1 — approval required) |



**Provisional default (if mixed):** Near-miss wince + Synergy Sprint — confirm in ROADMAP v1.9.0 row before coding.

**Implementation spike (agent-ready):** [V19_SPIKE.md](V19_SPIKE.md)

**Record decision here:**



- [x] Review date: **2026-06-14** (scheduled)
- [x] v1.9 item 1: **Near-miss wince** — implemented in `[Unreleased]`; confirm at review
- [x] v1.9 item 2: **Synergy Sprint preset** — implemented in `[Unreleased]`; confirm at review
- [ ] Verifier pass before tag: [ ]
- [ ] CHANGELOG cut + git tag: `v1.9.0` (post-review)


