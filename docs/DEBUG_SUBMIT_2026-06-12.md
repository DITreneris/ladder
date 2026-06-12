# Debug session — score submit / leaderboard stale (2026-06-12)

**Status:** Fixes in repo `[Unreleased]`; Railway API redeploy required; Vercel mini-app redeploy required for client 429 retry  
**Owner:** [debug-steward](../.cursor/agents/debug-steward.md)  
**Related:** [CHANGELOG.md](../CHANGELOG.md) `[Unreleased]`, [20260612_analize.md](20260612_analize.md), [score-pipeline](../.cursor/skills/score-pipeline/SKILL.md), [DEBUG_ENV_TRIAGE.md](DEBUG_ENV_TRIAGE.md)

---

## TL;DR

| | |
|---|---|
| **User report** | Score visible on game-over (e.g. Kristupas 19.5y / 22.8y / 30y; Prompt_Anatom high runs) but **missing from daily leaderboard** |
| **Not the cause** | Leaderboard query bug — `GET /leaderboard` reflects `game_runs`; problem is **failed `POST /runs`** |
| **Root causes (confirmed)** | (1) **429** 10s submit cooldown on rapid Re-apply; (2) **422/400** stale `final_rank` vs v2.1 Director bands; (3) **`_check_rate_limit` NameError** — `body` out of scope broke DB cooldown upgrade path; (4) **Prod Vercel bundle stale** — no client 429 retry; (5) separate bucket: **400 plausibility** (`auth_date` session vs rungs) |
| **Fix train** | Server: cooldown upgrade bypass, payload normalizer, NameError fix. Client: immediate submit on revive-eligible runs, `rankFromYears`, 429 auto-retry (3 attempts), filing toast |
| **Verify** | Railway `submit_run rejected` logs ↓; `game_runs` row for run years; prod bundle contains `11e3` retry constant |

---

## Debug path (how we got here)

### Phase 0 — Classify (≤15 min)

Bucket: **API / trust** ([debug-triage](../.cursor/skills/debug-triage/SKILL.md) Step 0).

| Check | Result |
|-------|--------|
| User sees score on game-over | Yes — client state OK |
| Daily LB shows lower / missing score | Yes — server never persisted best run |
| `GET /leaderboard` | **200 OK** — query works |

**Conclusion:** Trust pipeline break between game-over UI and `POST /runs` persistence.

### Phase 1 — Production evidence

**Railway API logs (Jun 12):**

| Signal | Count / pattern |
|--------|-----------------|
| `POST /runs` **200** | Many succeeds — pipeline not fully dead |
| **429** Too many submissions | Rapid Re-apply / double game-over |
| **422** Unprocessable Entity | Pydantic validation (bad payload shape) |
| **400** rank inconsistent | Client sent `Manager` @ 25–30y (pre–Director bands) |
| **400** session duration plausibility | `rungs_climbed` vs `now - auth_date` (see Phase 5) |

**Supabase / `ff-metrics.py` (same day):**

| User | On-screen claim | DB today |
|------|-----------------|----------|
| Kristupas | 22.8y, 30y | Max **19.0y**; 13 runs filed |
| Prompt_Anatom (`612095108`) | Higher runs | **17.0y** + **2.3y** filed; highs lost to reject paths |
| Any user | — | **Zero** runs ≥22y on daily board |

### Phase 2 — Hypotheses → verdicts

| ID | Hypothesis | Verdict | Evidence |
|----|------------|---------|----------|
| A | v2.1 rank band mismatch (`Manager` @ 25–30y) | **CONFIRMED** | Railway 400/422; client sent wrong `final_rank` |
| B | 429 cooldown drops best score on mash Re-apply | **CONFIRMED** | Multiple 429; Kristupas 304 lifetime runs |
| C | Revive path deferred submit until flush | **CONFIRMED (design)** | Scores ≥3y + revive eligible waited; LB fetched before flush — **fixed: submit immediately** |
| D | `rungs_climbed` float / shape → 422 | **CONFIRMED possible** | 422 lines in logs; server normalizer added |
| E | Prod mini-app missing 429 retry | **CONFIRMED** | Prod `main-BPeXNAlB.js` — no `11000`/`11e3`; local build `main-DfYjaxCu.js` has `11e3` |
| F | `_check_rate_limit` NameError | **CONFIRMED (code)** | Referenced `body.years_survived` outside `submit_run` scope → Exception → in-memory fallback **without** upgrade bypass |
| G | Plausibility cap false reject | **OPEN** | `telegram_id=8641419451` — 12.0y rejected: `Score exceeds session duration plausibility` |

### Phase 3 — Code trace (score pipeline)

```
onGameOver → runPostGameOverIo → submitRun → POST /runs
                                      ↓ fail (429/400/422)
                              fetchLeaderboard (still 200, stale data)
                              game-over UI shows local yearsSurvived
```

Key files:

| Layer | File | Role |
|-------|------|------|
| Client submit | `apps/mini-app/src/lib/api.ts` | `rankFromYears`, 429 retry, payload coerce |
| Client game-over | `apps/mini-app/src/app.ts` | Submit-then-fetch LB; revive immediate submit |
| API route | `packages/api/app/routes/runs.py` | Validation, logging, cooldown hook |
| Cooldown | `packages/api/app/routes/_cooldowns.py` | 10s window + **upgrade bypass** if new years > last filed |
| Normalizer | `packages/api/app/models.py` | Derive `final_rank` from years; int `rungs_climbed` |
| Plausibility | `packages/api/app/routes/_plausibility.py` | `rungs_climbed` ≤ session × 2.5 rungs/s + 2 |

### Phase 4 — Fixes shipped (Unreleased)

**API**

- `check_submit_cooldown(..., incoming_years)` — allow resubmit within 10s when score **improves**
- `RunSubmitRequest` before-validator — normalize rank + rungs (stops stale-client 422/400)
- `_check_rate_limit(telegram_id, incoming_years)` — **NameError fix**; in-memory fallback also respects upgrade
- Structured `submit_run rejected` warning logs (telegram_id, status, years, rank)

**Mini-app**

- Revive-eligible runs submit **immediately** (no defer)
- `SUBMIT_MAX_ATTEMPTS = 3`, `SUBMIT_COOLDOWN_RETRY_MS = 11000`
- Toast: “Filing score with HR…” + clearer rate-limit copy
- `rankFromYears(yearsSurvived)` at submit + engine game-over

### Phase 5 — Post-deploy prod log (follow-up)

After Railway redeploy, container start + health OK, then:

```
submit_run rejected telegram_id=8641419451 status=400
detail=Score exceeds session duration plausibility years=12.0 rank=Manager
POST /runs → 400
GET /leaderboard → 200
```

This is a **different bucket** from 429/rank: Telegram `auth_date` in initData defines `session_seconds`; if initData is fresh/stale relative to actual play time, plausible runs can fail. Track separately — do not confuse with cooldown/rank fixes.

---

## Verification checklist

| Step | Command / action | Pass |
|------|------------------|------|
| 1 | Deploy Railway `packages/api` | [ ] |
| 2 | Deploy Vercel `apps/mini-app` | [ ] |
| 3 | Prod bundle grep `11e3` in `main-*.js` | [ ] |
| 4 | Play run ≥20y → toast “Score submitted…” | [ ] |
| 5 | Daily LB shows run within ~30s | [ ] |
| 6 | Rapid Re-apply: higher score still files (upgrade bypass) | [ ] |
| 7 | Railway: no `NameError` / `body` in cooldown warnings | [ ] |
| 8 | `python scripts/ff-metrics.py` → submit_pipeline_ok | [ ] |

**Local repro (optional):**

```bash
# API
cd packages/api && uvicorn app.main:app --reload --port 8000

# Mini-app — VITE_API_URL=http://localhost:8000
cd apps/mini-app && npm run dev
```

---

## Lessons learned

1. **Measure DB vs UI first** — game-over shows client state; LB shows `game_runs` only.
2. **Read Railway status codes separately** — 429 ≠ 422 ≠ 400 plausibility; one fix does not cover all.
3. **Prod bundle hash** — server-only fixes help old clients; retry UX needs Vercel deploy ([DEBUG_ENV_TRIAGE.md](DEBUG_ENV_TRIAGE.md)).
4. **Scope bugs in helper functions** — `_check_rate_limit` NameError silently disabled upgrade bypass via exception fallback.
5. **`auth_date` is not run timer** — plausibility cap needs its own triage if reports continue after submit fixes.

---

## Cross-links

- Analysis: [20260612_analize.md](20260612_analize.md)
- DEVICE_QA share/429 rows: [DEVICE_QA_v2.0.md](DEVICE_QA_v2.0.md)
- Cohort impact: [FF_COHORT_OUTREACH_2026-06-12.md](FF_COHORT_OUTREACH_2026-06-12.md)
