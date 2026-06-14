from datetime import datetime, timezone

from main import build_help_text, build_welcome_text
from shifts import PRESETS, WEEKDAY_PRESET, preset_for_date


def test_weekday_preset_table_length():
    assert len(WEEKDAY_PRESET) == 7


def test_preset_for_date_weekday_map():
    cases = [
        (datetime(2026, 6, 15, 12, 0, tzinfo=timezone.utc), "meeting_monday"),
        (datetime(2026, 6, 16, 12, 0, tzinfo=timezone.utc), "standard"),
        (datetime(2026, 6, 17, 12, 0, tzinfo=timezone.utc), "coffee_break"),
        (datetime(2026, 6, 18, 12, 0, tzinfo=timezone.utc), "reorg_week"),
        (datetime(2026, 6, 19, 12, 0, tzinfo=timezone.utc), "synergy_sprint"),
        (datetime(2026, 6, 20, 12, 0, tzinfo=timezone.utc), "coffee_break"),
        (datetime(2026, 6, 21, 12, 0, tzinfo=timezone.utc), "standard"),
    ]
    for dt, expected_id in cases:
        preset = preset_for_date(dt)
        assert preset["id"] == expected_id
        assert preset["label"] == PRESETS[expected_id]["label"]
        assert preset["description"] == PRESETS[expected_id]["description"]


def test_build_welcome_text_includes_controls_and_shift():
    preset = PRESETS["meeting_monday"]
    text = build_welcome_text(preset)
    assert "Can you survive" in text
    assert "Intern" in text
    assert "+25% Energy" in text
    assert preset["label"] in text
    assert preset["description"] in text
    assert "Punch In & Climb" in text
    assert "promptanatomy.app" not in text
    assert "http" in text


def test_build_help_text_covers_basics():
    text = build_help_text()
    assert "LEFT or RIGHT" in text
    assert "Coffee" in text
    assert "Daily and Weekly" in text
    assert "Punch In & Climb" in text
