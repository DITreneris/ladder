-- Leaderboard-safe public view (no telegram_id) for optional anon reads

CREATE OR REPLACE VIEW leaderboard_runs_public AS
SELECT
    COALESCE(u.username, u.first_name, 'Employee') AS display_name,
    gr.years_survived,
    gr.final_rank,
    gr.created_at
FROM game_runs gr
JOIN users u ON u.id = gr.user_id;

-- No RLS policy added — view not exposed to anon in MVP; API uses service role.
