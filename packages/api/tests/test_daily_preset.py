"""Tests for UTC daily preset parity with bot/mini-app."""

from datetime import datetime, timezone

from app.daily_preset import hash_date_key, preset_id_for_date, today_preset_id


def test_preset_order_matches_bot():
    dt = datetime(2026, 6, 1, 15, 30, tzinfo=timezone.utc)
    pid = preset_id_for_date(dt)
    assert pid in (
        "standard",
        "meeting_monday",
        "coffee_break",
        "reorg_week",
        "synergy_sprint",
    )
    idx = hash_date_key("2026-06-01") % 5
    order = (
        "standard",
        "meeting_monday",
        "coffee_break",
        "reorg_week",
        "synergy_sprint",
    )
    assert pid == order[idx]


def test_today_preset_id_returns_string():
    assert today_preset_id() in (
        "standard",
        "meeting_monday",
        "coffee_break",
        "reorg_week",
        "synergy_sprint",
    )
