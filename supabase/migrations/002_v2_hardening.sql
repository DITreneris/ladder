-- v2.0 platform hardening: shared submit cooldown + API session tokens

CREATE TABLE submit_cooldowns (
    telegram_id BIGINT PRIMARY KEY,
    last_submit_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE api_sessions (
    token TEXT PRIMARY KEY,
    telegram_id BIGINT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_api_sessions_telegram ON api_sessions (telegram_id);
CREATE INDEX idx_api_sessions_expires ON api_sessions (expires_at);

ALTER TABLE submit_cooldowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_sessions ENABLE ROW LEVEL SECURITY;

-- No public policies — API uses service role only
