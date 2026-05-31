import hashlib
import hmac
import json
import time

import pytest

from app.auth.telegram import TelegramAuthError, validate_init_data


def _build_init_data(user: dict, bot_token: str) -> str:
    """Build valid initData for testing."""
    auth_date = str(int(time.time()))
    user_json = json.dumps(user, separators=(",", ":"))
    pairs = {"auth_date": auth_date, "user": user_json}
    data_check_string = "\n".join(f"{k}={v}" for k, v in sorted(pairs.items()))
    secret_key = hmac.new(b"WebAppData", bot_token.encode(), hashlib.sha256).digest()
    hash_val = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()
    return f"auth_date={auth_date}&user={user_json}&hash={hash_val}"


BOT_TOKEN = "123456789:ABCdefGHIjklMNOpqrsTUVwxyz"


def test_validate_init_data_success():
    user = {"id": 12345, "username": "testuser", "first_name": "Test"}
    init_data = _build_init_data(user, BOT_TOKEN)
    result = validate_init_data(init_data, BOT_TOKEN)
    assert result["id"] == 12345
    assert result["username"] == "testuser"


def test_validate_init_data_invalid_hash():
    user = {"id": 12345}
    init_data = _build_init_data(user, BOT_TOKEN) + "tampered"
    with pytest.raises(TelegramAuthError):
        validate_init_data(init_data, BOT_TOKEN)


def test_validate_init_data_missing_hash():
    with pytest.raises(TelegramAuthError):
        validate_init_data("auth_date=123&user={}", BOT_TOKEN)


def test_validate_init_data_expired():
    user = {"id": 12345, "username": "testuser"}
    old_auth_date = int(time.time()) - 90000
    init_data = _build_init_data(user, BOT_TOKEN)
    # Rebuild with stale auth_date
    auth_date = str(old_auth_date)
    user_json = json.dumps(user, separators=(",", ":"))
    pairs = {"auth_date": auth_date, "user": user_json}
    data_check_string = "\n".join(f"{k}={v}" for k, v in sorted(pairs.items()))
    secret_key = hmac.new(b"WebAppData", BOT_TOKEN.encode(), hashlib.sha256).digest()
    hash_val = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()
    stale_init_data = f"auth_date={auth_date}&user={user_json}&hash={hash_val}"
    with pytest.raises(TelegramAuthError, match="expired"):
        validate_init_data(stale_init_data, BOT_TOKEN)
