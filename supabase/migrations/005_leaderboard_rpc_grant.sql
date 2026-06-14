-- Grant leaderboard RPC to service role (explicit intent for PostgREST)

GRANT EXECUTE ON FUNCTION leaderboard_best_runs(timestamptz) TO service_role;
