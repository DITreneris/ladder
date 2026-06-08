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


def utc_date_key(dt: datetime) -> str:
    return dt.strftime("%Y-%m-%d")


def hash_date_key(key: str) -> int:
    h = 0
    for char in key:
        h = (31 * h + ord(char)) & 0xFFFFFFFF
    return h


def preset_id_for_date(dt: datetime) -> DailyPresetId:
    idx = hash_date_key(utc_date_key(dt)) % len(PRESET_ORDER)
    return PRESET_ORDER[idx]


def today_preset_id(utc_now: datetime | None = None) -> DailyPresetId:
    dt = utc_now or datetime.now(timezone.utc)
    return preset_id_for_date(dt)
