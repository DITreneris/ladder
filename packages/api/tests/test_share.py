"""Tests for POST /share/prepare and share copy builder."""

from unittest.mock import MagicMock, patch

import httpx
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.share_copy import (
    SPRINT_SHARE_LINE,
    build_inline_article,
    build_share_text,
    _pick_death_line,
)
from app.telegram.bot_api import BotApiError, save_prepared_inline_message
from tests.conftest import TEST_USER, build_init_data

client = TestClient(app)

SHARE_PAYLOAD = {
    "years_survived": 12.5,
    "final_rank": "Manager",
    "shift_label": "Meeting Monday",
    "termination_detail": "Reply-All collision on rung 14",
    "termination_flavor": "Your synergy did not scale optimally with our paradigms.",
    "death_type": "meeting",
}


def test_pick_death_line_prefers_short_flavor():
    assert _pick_death_line("Long detail here.", "Short flavor.") == "Short flavor"


def test_pick_death_line_falls_back_to_detail():
    long_flavor = "x" * 100
    assert _pick_death_line("First sentence. Second.", long_flavor) == "First sentence"


def test_build_share_text_variant_a_hook():
    from app.models import SharePrepareRequest

    body = SharePrepareRequest(initData="x", **SHARE_PAYLOAD)
    text = build_share_text(TEST_USER, body)
    lines = text.split("\n")
    assert len(lines) == 3
    assert lines[0] == (
        "Manager · 12.5y — Your synergy did not scale optimally with our paradigms."
    )
    assert lines[1] == "Think you can outlast me?"
    assert "startapp=c_125" in lines[2]
    assert "Employee:" not in text
    assert "CORPORATE PERFORMANCE REVIEW" not in text
    assert "Prompt Anatomy" not in text
    assert "Shift:" not in text


def test_build_share_text_sprint_line():
    from app.models import SharePrepareRequest

    body = SharePrepareRequest(
        initData="x",
        **{**SHARE_PAYLOAD, "death_type": "sprint"},
    )
    text = build_share_text(TEST_USER, body)
    assert SPRINT_SHARE_LINE.rstrip(".") in text.split("\n")[0]


def test_build_inline_article_card_has_pa_on_description_only():
    from app.models import SharePrepareRequest

    body = SharePrepareRequest(initData="x", **SHARE_PAYLOAD)
    share_text = build_share_text(TEST_USER, body)
    article = build_inline_article(share_text, body, TEST_USER)
    assert article["title"] == "Manager · 12.5y — Corporate Ladder"
    assert "Built with Prompt Anatomy" in article["description"]
    assert "promptanatomy" not in article["description"].lower()
    assert "Prompt Anatomy" not in article["input_message_content"]["message_text"]


def test_share_prepare_valid(mock_supabase, valid_init_data, monkeypatch):
    captured: dict = {}

    def fake_save(user_id, result, **kwargs):
        captured["user_id"] = user_id
        captured["result"] = result
        captured["kwargs"] = kwargs
        return {"id": "prepared-msg-abc", "expiration_date": 9999999999}

    monkeypatch.setattr(
        "app.routes.share.save_prepared_inline_message",
        fake_save,
    )

    response = client.post(
        "/share/prepare",
        json={"initData": valid_init_data, **SHARE_PAYLOAD},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["preparedMessageId"] == "prepared-msg-abc"
    assert captured["user_id"] == TEST_USER["id"]
    assert captured["result"]["type"] == "article"
    assert captured["kwargs"]["allow_group_chats"] is True
    msg = captured["result"]["input_message_content"]["message_text"]
    assert len(msg.split("\n")) == 3
    assert "startapp=c_125" in msg


def test_share_prepare_invalid_init():
    response = client.post(
        "/share/prepare",
        json={"initData": "auth_date=1&user={}&hash=bad", **SHARE_PAYLOAD},
    )
    assert response.status_code == 401


def test_share_prepare_telegram_api_error(mock_supabase, valid_init_data, monkeypatch):
    def fake_save(*_args, **_kwargs):
        raise BotApiError("Bad Request: inline mode disabled", status_code=502)

    monkeypatch.setattr(
        "app.routes.share.save_prepared_inline_message",
        fake_save,
    )

    response = client.post(
        "/share/prepare",
        json={"initData": valid_init_data, **SHARE_PAYLOAD},
    )
    assert response.status_code == 502
    assert "inline mode" in response.json()["detail"].lower()


def test_save_prepared_inline_message_success(monkeypatch):
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "ok": True,
        "result": {"id": "msg-1", "expiration_date": 123},
    }

    with patch("app.telegram.bot_api.httpx.post", return_value=mock_response) as post:
        result = save_prepared_inline_message(
            12345,
            {"type": "article", "id": "x", "title": "t", "input_message_content": {"message_text": "hi"}},
            allow_group_chats=True,
        )

    assert result["id"] == "msg-1"
    payload = post.call_args.kwargs["json"]
    assert payload["allow_group_chats"] is True
    assert payload["user_id"] == 12345


def test_save_prepared_inline_message_telegram_error(monkeypatch):
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {"ok": False, "description": "USER_ID_INVALID"}

    with patch("app.telegram.bot_api.httpx.post", return_value=mock_response):
        with pytest.raises(BotApiError, match="USER_ID_INVALID"):
            save_prepared_inline_message(1, {"type": "article", "id": "x", "title": "t", "input_message_content": {"message_text": "hi"}})


def test_save_prepared_inline_message_http_error(monkeypatch):
    with patch(
        "app.telegram.bot_api.httpx.post",
        side_effect=httpx.ConnectError("connection refused"),
    ):
        with pytest.raises(BotApiError, match="request failed"):
            save_prepared_inline_message(1, {"type": "article", "id": "x", "title": "t", "input_message_content": {"message_text": "hi"}})
