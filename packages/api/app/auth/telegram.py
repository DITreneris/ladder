"""Telegram WebApp initData HMAC validation."""

import hashlib
import hmac
import json
import time
from urllib.parse import parse_qsl, unquote


class TelegramAuthError(Exception):
    pass


def validate_init_data(init_data: str, bot_token: str, max_age_seconds: int = 86400) -> dict:
    """
    Validate Telegram Mini App initData per official spec.
    Returns parsed user dict from initData.
    """
    if not init_data or not bot_token:
        raise TelegramAuthError("Missing initData or bot token")

    parsed = dict(parse_qsl(init_data, keep_blank_values=True))
    received_hash = parsed.pop("hash", None)
    if not received_hash:
        raise TelegramAuthError("Missing hash in initData")

    data_check_string = "\n".join(f"{k}={v}" for k, v in sorted(parsed.items()))

    secret_key = hmac.new(b"WebAppData", bot_token.encode(), hashlib.sha256).digest()
    computed_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()

    if not hmac.compare_digest(computed_hash, received_hash):
        raise TelegramAuthError("Invalid initData signature")

    auth_date = int(parsed.get("auth_date", 0))
    if time.time() - auth_date > max_age_seconds:
        raise TelegramAuthError("initData expired")

    user_raw = parsed.get("user")
    if not user_raw:
        raise TelegramAuthError("No user in initData")

    user = json.loads(unquote(user_raw) if user_raw.startswith("%") else user_raw)
    if "id" not in user:
        raise TelegramAuthError("Invalid user payload")

    return user
