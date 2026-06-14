-- v2.3 leaderboard aggregation RPC (best score per user in period)

CREATE OR REPLACE FUNCTION leaderboard_best_runs(since_ts timestamptz)
RETURNS TABLE (
    telegram_id bigint,
    username text,
    first_name text,
    years_survived numeric,
    final_rank text
) AS $$
    SELECT
        u.telegram_id,
        COALESCE(u.username, u.first_name, 'Employee') AS username,
        u.first_name,
        MAX(gr.years_survived) AS years_survived,
        (ARRAY_AGG(gr.final_rank ORDER BY gr.years_survived DESC))[1] AS final_rank
    FROM game_runs gr
    JOIN users u ON u.id = gr.user_id
    WHERE gr.created_at >= since_ts
    GROUP BY u.telegram_id, u.username, u.first_name;
$$ LANGUAGE sql STABLE;
