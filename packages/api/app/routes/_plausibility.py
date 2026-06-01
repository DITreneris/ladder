"""Minimum score plausibility checks (v2.0 — not full replay anti-cheat)."""

import time

from fastapi import HTTPException

from app.models import RunSubmitRequest

MAX_YEARS_NORMAL = 50.0
MAX_YEARS_SPRINT = 25.0
MAX_RUNGS_PER_SECOND = 2.5


def validate_score_plausibility(body: RunSubmitRequest, auth_date: int) -> None:
    max_years = MAX_YEARS_SPRINT if body.sprint_mode else MAX_YEARS_NORMAL
    if body.years_survived > max_years:
        raise HTTPException(
            status_code=400,
            detail=f"Score exceeds plausible maximum ({max_years} years)",
        )

    now = int(time.time())
    session_seconds = max(1, now - auth_date)
    if body.rungs_climbed > session_seconds * MAX_RUNGS_PER_SECOND + 2:
        raise HTTPException(
            status_code=400,
            detail="Score exceeds session duration plausibility",
        )
