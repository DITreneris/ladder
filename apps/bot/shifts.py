"""Daily shift presets — labels and copy parity with mini-app daily-modifier.ts."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import TypedDict


class ShiftPreset(TypedDict):
    id: str
    label: str
    description: str


PRESET_ORDER: tuple[str, ...] = (
    "standard",
    "meeting_monday",
    "coffee_break",
    "reorg_week",
    "synergy_sprint",
)

PRESETS: dict[str, ShiftPreset] = {
    "standard": {
        "id": "standard",
        "label": "Open Floor Plan",
        "description": "Synergy optional. Attendance mandatory. Noise +20%. Privacy −80%. Promotion odds unchanged.",
    },
    "meeting_monday": {
        "id": "meeting_monday",
        "label": "Meeting Monday",
        "description": "Your calendar owns you now. Blockers are decorative. Meeting density +35%. Focus −100%.",
    },
    "coffee_break": {
        "id": "coffee_break",
        "label": "Coffee Break",
        "description": "HR approved hydration. Decaf still not a strategy. Coffee spawns +40%. Sleep debt unchanged.",
    },
    "reorg_week": {
        "id": "reorg_week",
        "label": "Reorg Week",
        "description": "Org chart unstable. Reporting lines are suggestions. Reorg probability rising. Titles fluid.",
    },
    "synergy_sprint": {
        "id": "synergy_sprint",
        "label": "Synergy Sprint",
        "description": "60 seconds. Velocity is a feeling. Outcomes are quarterly. Timer − mercy. Score = years at buzzer.",
    },
}


def utc_date_key(dt: datetime) -> str:
    return dt.strftime("%Y-%m-%d")


def hash_date_key(key: str) -> int:
    h = 0
    for char in key:
        h = (31 * h + ord(char)) & 0xFFFFFFFF
    return h


def preset_for_date(dt: datetime) -> ShiftPreset:
    """Match mini-app presetIdForDate (UTC day hash)."""
    idx = hash_date_key(utc_date_key(dt)) % len(PRESET_ORDER)
    preset_id = PRESET_ORDER[idx]
    return PRESETS[preset_id]


def today_preset() -> ShiftPreset:
    return preset_for_date(datetime.now(timezone.utc))


def today_shift_label() -> str:
    return today_preset()["label"]
