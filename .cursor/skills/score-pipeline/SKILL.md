---
name: score-pipeline
description: End-to-end flow from game over to leaderboard update. Use when wiring score submission, debugging leaderboard, or changing run/game_runs schema.
---

# Score Pipeline

## Flow

```
Game Over (engine.ts)
  → onGameOver callback (app.ts)
  → submitRun(initData, payload) (api.ts)
  → POST /runs (runs.py)
  → validate initData + sanity checks
  → upsert user + insert game_runs
  → update best_score if improved
  → Leaderboard reads via GET /leaderboard
```

## Client Payload

```json
{
  "initData": "...",
  "years_survived": 12.5,
  "final_rank": "Manager",
  "termination_cause": "Deadline Crash",
  "rungs_climbed": 50
}
```

## Server Validation

- `years_survived`: 0–100
- `rungs_climbed` ≈ `years_survived * 4` (±1 tolerance)
- `final_rank` consistent with years (v1.8.2): Intern < 10y, Manager 10–<35y, CEO ≥ 35y — else 400
- Rate limit: 1 submit per 10 seconds per telegram_id

## Leaderboard Query

- **daily**: runs since UTC midnight, best per user, top 50
- **weekly**: runs in last 7 days, best per user, top 50
- Optional `initData` query param marks `is_current_user: true` on matching row

Example: `GET /leaderboard?period=daily&limit=50&initData=...`

**Note:** `termination_cause` strings come from UI constants (human-readable labels), not engine type IDs.

## Files

| Layer | File |
|-------|------|
| Game engine | `apps/mini-app/src/game/engine.ts` |
| Submit call | `apps/mini-app/src/lib/api.ts` |
| API route | `packages/api/app/routes/runs.py` |
| DB schema | `supabase/migrations/001_initial_schema.sql` |
| Leaderboard | `packages/api/app/routes/leaderboard.py` |

## Debugging

1. Check API logs on Railway for 401/400/429
2. Verify Supabase `game_runs` table has new rows
3. Confirm `VITE_API_URL` points to correct Railway URL
4. Test `/leaderboard?period=daily` directly
