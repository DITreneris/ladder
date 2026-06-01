from datetime import datetime, timezone

from main import build_help_text, build_welcome_text
from shifts import PRESET_ORDER, PRESETS, hash_date_key, preset_for_date, utc_date_key


def test_preset_order_matches_mini_app():
    assert PRESET_ORDER == (
        "standard",
        "meeting_monday",
        "coffee_break",
        "reorg_week",
        "synergy_sprint",
    )
    assert set(PRESETS.keys()) == set(PRESET_ORDER)


def test_preset_for_date_uses_utc_hash():
    dt = datetime(2026, 6, 1, 15, 30, tzinfo=timezone.utc)
    key = utc_date_key(dt)
    idx = hash_date_key(key) % len(PRESET_ORDER)
    expected_id = PRESET_ORDER[idx]
    preset = preset_for_date(dt)
    assert preset["id"] == expected_id
    assert preset["label"] == PRESETS[expected_id]["label"]
    assert preset["description"] == PRESETS[expected_id]["description"]


def test_build_welcome_text_includes_controls_and_shift():
    preset = PRESETS["meeting_monday"]
    text = build_welcome_text(preset)
    assert "Tap LEFT or RIGHT" in text
    assert "Energy" in text
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
