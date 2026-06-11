"""Outbound Telegram Bot API helpers."""

from __future__ import annotations

from typing import Any

import httpx

from app.config import settings

TELEGRAM_API_BASE = "https://api.telegram.org"
REQUEST_TIMEOUT_S = 5.0


class BotApiError(Exception):
    """Telegram Bot API returned ok=false or HTTP error."""

    def __init__(self, message: str, *, status_code: int | None = None):
        super().__init__(message)
        self.status_code = status_code


def _require_bot_token() -> str:
    token = settings.telegram_bot_token.strip()
    if not token:
        raise BotApiError("Telegram bot token not configured", status_code=503)
    return token


def save_prepared_inline_message(
    user_id: int,
    result: dict[str, Any],
    *,
    allow_user_chats: bool = True,
    allow_bot_chats: bool = True,
    allow_group_chats: bool = True,
    allow_channel_chats: bool = True,
) -> dict[str, Any]:
    """Call savePreparedInlineMessage; return PreparedInlineMessage dict."""
    token = _require_bot_token()
    payload = {
        "user_id": user_id,
        "result": result,
        "allow_user_chats": allow_user_chats,
        "allow_bot_chats": allow_bot_chats,
        "allow_group_chats": allow_group_chats,
        "allow_channel_chats": allow_channel_chats,
    }
    url = f"{TELEGRAM_API_BASE}/bot{token}/savePreparedInlineMessage"
    try:
        response = httpx.post(url, json=payload, timeout=REQUEST_TIMEOUT_S)
    except httpx.HTTPError as exc:
        raise BotApiError(f"Telegram API request failed: {exc}") from exc

    if response.status_code >= 500:
        raise BotApiError("Telegram API unavailable", status_code=502)

    data = response.json()
    if not data.get("ok"):
        description = data.get("description", "Unknown Telegram API error")
        raise BotApiError(description, status_code=502)

    result_body = data.get("result")
    if not isinstance(result_body, dict) or not result_body.get("id"):
        raise BotApiError("Telegram API returned invalid prepared message", status_code=502)

    return result_body
