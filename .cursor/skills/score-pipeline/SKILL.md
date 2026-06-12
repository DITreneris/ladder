---
name: score-pipeline
description: End-to-end flow from game over to leaderboard update. Use when wiring score submission, debugging leaderboard, or changing run/game_runs schema.
---

# Score Pipeline

## Flow

```
Launch → POST /auth/me (initData) → profile + session_token cached (api.ts)
Game Over (engine.ts)
  → onGameOver callback (app.ts)
  → [optional] revive offer — score submit DEFERRED until final death (revive.ts)
  → submitRun(initData, payload) (api.ts)
  → POST /runs (runs.py)
  → validate initData + plausibility + sprint_mode
  → upsert user + insert game_runs + submit_cooldowns
  → update best_score if improved
Leaderboard:
  → submitRun completes first (Unreleased: daily LB fetch after submit, not parallel)
  → GET /leaderboard?period=daily|weekly
  → POST /leaderboard/me { sessionToken, period } for self-row highlight
```

## Client Payload

```json
{
  "initData": "...",
  "years_survived": 12.5,
  "final_rank": "Manager",
  "termination_cause": "Deadline Crash",
  "rungs_climbed": 50,
  "sprint_mode": false
}
```

## Server Validation

- `years_survived`: 0–100 (lower cap on Synergy Sprint days)
- `rungs_climbed` ≈ `years_survived * 4` (±1 tolerance)
- `final_rank` consistent with years (v2.1.0 contiguous bands) — else 400:
  - Intern: `[0, 10)`
  - Manager: `[10, 20)`
  - Director: `[20, 35)`
  - CEO: `[35, ∞)`
- **Deploy rule:** ship API with mini-app when rank bands change — old API rejects Director submits
- `sprint_mode`: must match UTC daily preset (`synergy_sprint` on sprint days only) — v2.0
- Plausibility cap: session duration vs rungs/years — `_plausibility.py` (not full replay)
- Rate limit: 1 submit per 10s per telegram_id via Supabase `submit_cooldowns` (migration 002); in-memory fallback in tests/dev

## Leaderboard Query

- **daily**: runs since UTC midnight, best per user, top 50
- **weekly**: runs in last 7 days, best per user, top 50
- Fetches up to **2000** recent runs before best-per-user aggregation in Python
- Self highlight: `POST /leaderboard/me` with `session_token` from `/auth/me` — **not** initData in GET URL

Example: `GET /leaderboard?period=daily&limit=50` then `POST /leaderboard/me { "sessionToken": "...", "period": "daily" }`

**Note:** `termination_cause` strings come from UI constants (human-readable labels), not engine type IDs.

## Client trust (v1.8.4+)

Career high on home must not bump until submit succeeds:

| File | Role |
|------|------|
| `apps/mini-app/src/lib/score-trust.ts` | `nextHighScoreAfterSubmit()` — pure helper |
| `apps/mini-app/src/lib/score-trust.test.ts` | Unit tests for submit-fail / profile-best paths |
| `apps/mini-app/src/app.ts` | Calls helper after `submitRun` resolves |

**Rule:** If `submitOk === false`, return `currentHigh` unchanged. If API returns profile best, prefer that over local bump.

**Revive defer:** When revive is offered, score does not submit until player declines revive or dies again after revive — see [revive-monetization](../revive-monetization/SKILL.md).

## Files

| Layer | File |
|-------|------|
| Game engine | `apps/mini-app/src/game/engine.ts` |
| Submit call | `apps/mini-app/src/lib/api.ts` |
| Revive gate | `apps/mini-app/src/lib/revive.ts` |
| API auth | `packages/api/app/routes/auth.py`, `auth/session.py` |
| API route | `packages/api/app/routes/runs.py`, `routes/_cooldowns.py`, `routes/_plausibility.py` |
| DB schema | `supabase/migrations/001_initial_schema.sql`, `002_v2_hardening.sql` |
| Leaderboard | `packages/api/app/routes/leaderboard.py` |
| Share prepare | `packages/api/app/routes/share.py` (see [share-virality](../share-virality/SKILL.md)) |

## Debugging

1. Check API logs on Railway for 401/400/422/429
2. Verify Supabase `game_runs` table has new rows; `submit_cooldowns` for rate limit
3. Confirm `VITE_API_URL` points to correct Railway URL
4. Test `GET /leaderboard?period=daily` and `POST /leaderboard/me` with valid session token
5. `python scripts/ff-metrics.py` → `submit_pipeline_ok: true`, `migration_002_ok: true`
