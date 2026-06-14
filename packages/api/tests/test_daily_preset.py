"""Tests for UTC daily preset parity with bot/mini-app."""

from datetime import datetime, timezone

from app.daily_preset import preset_id_for_date, today_preset_id, WEEKDAY_PRESET

# Fixed UTC week 2026-06-15 (Mon) through 2026-06-21 (Sun)
WEEK_PARITY_CASES = [
    (datetime(2026, 6, 15, 12, 0, tzinfo=timezone.utc), "meeting_monday"),
    (datetime(2026, 6, 16, 12, 0, tzinfo=timezone.utc), "standard"),
    (datetime(2026, 6, 17, 12, 0, tzinfo=timezone.utc), "coffee_break"),
    (datetime(2026, 6, 18, 12, 0, tzinfo=timezone.utc), "reorg_week"),
    (datetime(2026, 6, 19, 12, 0, tzinfo=timezone.utc), "synergy_sprint"),
    (datetime(2026, 6, 20, 12, 0, tzinfo=timezone.utc), "coffee_break"),
    (datetime(2026, 6, 21, 12, 0, tzinfo=timezone.utc), "standard"),
]


def test_weekday_preset_table_length():
    assert len(WEEKDAY_PRESET) == 7


def test_preset_id_for_date_weekday_map():
    for dt, expected in WEEK_PARITY_CASES:
        assert preset_id_for_date(dt) == expected


def test_same_utc_calendar_day_maps_to_same_preset():
    a = preset_id_for_date(datetime(2026, 6, 15, 0, 0, tzinfo=timezone.utc))
    b = preset_id_for_date(datetime(2026, 6, 15, 23, 59, tzinfo=timezone.utc))
    assert a == b == "meeting_monday"


def test_today_preset_id_returns_valid_preset():
    assert today_preset_id() in (
        "standard",
        "meeting_monday",
        "coffee_break",
        "reorg_week",
        "synergy_sprint",
    )
