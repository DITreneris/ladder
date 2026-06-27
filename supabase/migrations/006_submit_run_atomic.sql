-- v2.4.1 atomic run submit: idempotency + cooldown lock in one transaction

ALTER TABLE game_runs
    ADD COLUMN IF NOT EXISTS client_run_id UUID;

CREATE UNIQUE INDEX IF NOT EXISTS idx_game_runs_user_client_run
    ON game_runs (user_id, client_run_id)
    WHERE client_run_id IS NOT NULL;

CREATE OR REPLACE FUNCTION submit_run_atomic(
    p_telegram_id BIGINT,
    p_username TEXT,
    p_first_name TEXT,
    p_client_run_id UUID,
    p_years_survived NUMERIC(6, 1),
    p_final_rank TEXT,
    p_termination_cause TEXT,
    p_rungs_climbed INT
)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_best_score NUMERIC(6, 1);
    v_best_rank TEXT;
    v_last_submit TIMESTAMPTZ;
    v_recent_years NUMERIC(6, 1);
    v_run_id UUID;
    v_elapsed_seconds DOUBLE PRECISION;
BEGIN
    SELECT id, best_score, best_rank
    INTO v_user_id, v_best_score, v_best_rank
    FROM users
    WHERE telegram_id = p_telegram_id;

    IF v_user_id IS NULL THEN
        INSERT INTO users (telegram_id, username, first_name, best_score, best_rank)
        VALUES (p_telegram_id, p_username, p_first_name, 0, 'Intern')
        RETURNING id, best_score, best_rank
        INTO v_user_id, v_best_score, v_best_rank;
    ELSE
        UPDATE users
        SET username = p_username,
            first_name = p_first_name,
            updated_at = NOW()
        WHERE id = v_user_id;
    END IF;

    IF p_client_run_id IS NOT NULL THEN
        SELECT gr.id
        INTO v_run_id
        FROM game_runs gr
        WHERE gr.user_id = v_user_id
          AND gr.client_run_id = p_client_run_id;

        IF v_run_id IS NOT NULL THEN
            SELECT best_score, best_rank
            INTO v_best_score, v_best_rank
            FROM users
            WHERE id = v_user_id;

            RETURN jsonb_build_object(
                'ok', true,
                'years_survived', p_years_survived,
                'best_score', v_best_score,
                'best_rank', v_best_rank,
                'run_id', v_run_id,
                'idempotent', true
            );
        END IF;
    END IF;

    INSERT INTO submit_cooldowns (telegram_id, last_submit_at)
    VALUES (p_telegram_id, NOW() - INTERVAL '1 day')
    ON CONFLICT (telegram_id) DO NOTHING;

    SELECT last_submit_at
    INTO v_last_submit
    FROM submit_cooldowns
    WHERE telegram_id = p_telegram_id
    FOR UPDATE;

    v_elapsed_seconds := EXTRACT(EPOCH FROM (NOW() - v_last_submit));

    IF v_elapsed_seconds < 10 THEN
        SELECT gr.years_survived
        INTO v_recent_years
        FROM game_runs gr
        WHERE gr.user_id = v_user_id
          AND gr.created_at >= v_last_submit
        ORDER BY gr.created_at DESC
        LIMIT 1;

        IF v_recent_years IS NULL OR p_years_survived <= v_recent_years THEN
            RETURN jsonb_build_object('ok', false, 'error', 'cooldown');
        END IF;
    END IF;

    INSERT INTO game_runs (
        user_id,
        years_survived,
        final_rank,
        termination_cause,
        rungs_climbed,
        client_run_id
    )
    VALUES (
        v_user_id,
        p_years_survived,
        p_final_rank,
        p_termination_cause,
        p_rungs_climbed,
        p_client_run_id
    )
    RETURNING id INTO v_run_id;

    IF p_years_survived > v_best_score THEN
        UPDATE users
        SET best_score = p_years_survived,
            best_rank = p_final_rank
        WHERE id = v_user_id
          AND best_score < p_years_survived;

        v_best_score := GREATEST(v_best_score, p_years_survived);
        v_best_rank := p_final_rank;
    END IF;

    SELECT best_score, best_rank
    INTO v_best_score, v_best_rank
    FROM users
    WHERE id = v_user_id;

    UPDATE submit_cooldowns
    SET last_submit_at = NOW()
    WHERE telegram_id = p_telegram_id;

    RETURN jsonb_build_object(
        'ok', true,
        'years_survived', p_years_survived,
        'best_score', v_best_score,
        'best_rank', v_best_rank,
        'run_id', v_run_id,
        'idempotent', false
    );
END;
$$ LANGUAGE plpgsql;
