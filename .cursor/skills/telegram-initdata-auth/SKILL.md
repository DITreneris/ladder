---
name: telegram-initdata-auth
description: Validate Telegram Mini App initData HMAC and debug auth failures. Use when implementing or debugging Telegram login, initData, or /auth/me endpoint.
---

# Telegram initData Auth

## Validation Steps

1. Parse `initData` as URL query string
2. Extract `hash`, remove from params
3. Build `data_check_string`: sorted `key=value` pairs joined by `\n`
4. Secret key: `HMAC-SHA256("WebAppData", bot_token)` 
5. Computed hash: `HMAC-SHA256(secret_key, data_check_string)`
6. Compare with `hash` using constant-time compare
7. Check `auth_date` is within 24 hours
8. Parse `user` JSON field for `id`, `username`, `first_name`

## Implementation

See [packages/api/app/auth/telegram.py](../../packages/api/app/auth/telegram.py).

Frontend sends `initData` from `Telegram.WebApp.initData` in POST body as `{ "initData": "..." }`.

## Session token lifecycle (v2.0)

After successful `/auth/me`:

1. API returns `session_token` in profile response ([auth.py](../../packages/api/app/routes/auth.py))
2. Client caches token in [api.ts](../../apps/mini-app/src/lib/api.ts) (`cachedSessionToken`)
3. **Leaderboard highlight:** `POST /leaderboard/me` with `{ sessionToken, period }` — initData not in GET URL
4. **Score submit:** still uses `initData` on `POST /runs` (unchanged)

Token storage: Supabase `api_sessions` table (migration 002). Prune on `/auth/me`: expired rows + max 3 tokens per user.

**Do not** pass initData as leaderboard GET query param — removed in v2.0 for log hygiene.

## Common Failures

| Error | Cause |
|-------|-------|
| Invalid signature | Wrong bot token, tampered data, wrong sort order |
| initData expired | auth_date > 24h old; reopen Mini App |
| No user in initData | Opened outside Telegram; use dev fallback |
| Missing hash | Malformed initData string |

## Test Vectors

Run `pytest packages/api/tests/test_telegram_auth.py` for HMAC test helper.

## Env Vars

- `TELEGRAM_BOT_TOKEN` or `TELEGRAM_WEBAPP_SECRET` on Railway API
