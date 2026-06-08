"""Minimum score plausibility checks (v2.0 — not full replay anti-cheat)."""

import time

from fastapi import HTTPException

from app.daily_preset import today_preset_id
from app.models import RunSubmitRequest

MAX_YEARS_NORMAL = 50.0
MAX_YEARS_SPRINT = 25.0
MAX_RUNGS_PER_SECOND = 2.5
SPRINT_SESSION_CAP_SECONDS = 90


def validate_score_plausibility(body: RunSubmitRequest, auth_date: int) -> None:
    preset = today_preset_id()
    is_sprint_day = preset == "synergy_sprint"

    if body.sprint_mode and not is_sprint_day:
        raise HTTPException(status_code=400, detail="sprint_mode invalid for today's shift")
    if is_sprint_day and not body.sprint_mode:
        raise HTTPException(status_code=400, detail="sprint_mode required for Synergy Sprint shift")

    max_years = MAX_YEARS_SPRINT if body.sprint_mode else MAX_YEARS_NORMAL
    if body.years_survived > max_years:
        raise HTTPException(
            status_code=400,
            detail=f"Score exceeds plausible maximum ({max_years} years)",
        )

    now = int(time.time())
    session_seconds = max(1, now - auth_date)
    if body.sprint_mode:
        session_seconds = min(session_seconds, SPRINT_SESSION_CAP_SECONDS)
        max_rungs = int(session_seconds * MAX_RUNGS_PER_SECOND) + 2
        if body.rungs_climbed > max_rungs:
            raise HTTPException(
                status_code=400,
                detail="Score exceeds sprint duration plausibility",
            )

    if body.rungs_climbed > session_seconds * MAX_RUNGS_PER_SECOND + 2:
        raise HTTPException(
            status_code=400,
            detail="Score exceeds session duration plausibility",
        )
