-- Grant atomic submit RPC to service role (explicit intent for PostgREST)

GRANT EXECUTE ON FUNCTION submit_run_atomic(
    BIGINT,
    TEXT,
    TEXT,
    UUID,
    NUMERIC,
    TEXT,
    TEXT,
    INT
) TO service_role;
