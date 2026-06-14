"""UTC daily shift preset — parity with apps/bot/shifts.py and mini-app daily-modifier.ts."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Literal

DailyPresetId = Literal[
    "standard",
    "meeting_monday",
    "coffee_break",
    "reorg_week",
    "synergy_sprint",
]

PRESET_ORDER: tuple[DailyPresetId, ...] = (
    "standard",
    "meeting_monday",
    "coffee_break",
    "reorg_week",
    "synergy_sprint",
)

# Monday=0 … Sunday=6 (datetime.weekday)
WEEKDAY_PRESET: tuple[DailyPresetId, ...] = (
    "meeting_monday",  # Mon
    "standard",  # Tue
    "coffee_break",  # Wed
    "reorg_week",  # Thu
    "synergy_sprint",  # Fri
    "coffee_break",  # Sat
    "standard",  # Sun
)


def utc_date_key(dt: datetime) -> str:
    return dt.strftime("%Y-%m-%d")


def hash_date_key(key: str) -> int:
    """Legacy hash — dev/tests only; production preset uses WEEKDAY_PRESET."""
    h = 0
    for char in key:
        h = (31 * h + ord(char)) & 0xFFFFFFFF
    return h


def preset_id_for_date(dt: datetime) -> DailyPresetId:
    weekday = dt.weekday()
    if weekday < 0 or weekday > 6:
        return "standard"
    return WEEKDAY_PRESET[weekday]


def today_preset_id(utc_now: datetime | None = None) -> DailyPresetId:
    dt = utc_now or datetime.now(timezone.utc)
    return preset_id_for_date(dt)
