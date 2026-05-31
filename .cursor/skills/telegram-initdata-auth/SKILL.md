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
