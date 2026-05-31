-- Corporate Ladder initial schema
-- users: one row per Telegram user
-- game_runs: every completed session

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    telegram_id BIGINT UNIQUE NOT NULL,
    username TEXT,
    first_name TEXT,
    best_score NUMERIC(6, 1) NOT NULL DEFAULT 0,
    best_rank TEXT NOT NULL DEFAULT 'Intern',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE game_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    years_survived NUMERIC(6, 1) NOT NULL,
    final_rank TEXT NOT NULL,
    termination_cause TEXT,
    rungs_climbed INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_game_runs_created_at ON game_runs (created_at DESC);
CREATE INDEX idx_game_runs_user_created ON game_runs (user_id, created_at DESC);
CREATE INDEX idx_users_telegram_id ON users (telegram_id);

-- RLS: public read for leaderboard aggregation; writes via service role only
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read users" ON users
    FOR SELECT USING (true);

CREATE POLICY "Public read game_runs" ON game_runs
    FOR SELECT USING (true);

-- No INSERT/UPDATE/DELETE policies for anon/authenticated — API uses service role

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
