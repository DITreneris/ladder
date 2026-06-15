"""Minimum score plausibility checks (v2.0 — not full replay anti-cheat)."""

import time

from fastapi import HTTPException

from app.daily_preset import today_preset_id
from app.models import RunSubmitRequest
from app.ranks import MAX_YEARS_NORMAL

MAX_YEARS_SPRINT = 25.0
MIN_TAP_INTERVAL_S = 0.12
# Anti-cheat cap at 2× the client tap throttle (120ms → 8.33 rungs/s) so fast legal
# play has honest headroom; blatant speed hacks still fail the min-duration floor.
GAME_MAX_RUNGS_PER_SECOND = 2.0 / MIN_TAP_INTERVAL_S
SPRINT_SESSION_CAP_SECONDS = 60
MAX_RUN_DURATION_SECONDS = 600
MIN_TAP_TOLERANCE = 0.85
CLOCK_SKEW_TOLERANCE_S = 30
# Client sends true ms duration plus floor/ceil unix-second timestamps; allow the
# quantization gap between them before rejecting a duration/timestamp mismatch.
DURATION_SEC_SLACK_MS = 2000


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
    _validate_run_timestamps(body, auth_date, now)

    # True play time comes from run_duration_ms; unix-second timestamps only gate the
    # session window and clock skew. Guard against duration that overruns its window.
    sec_window_ms = (body.run_ended_at - body.run_started_at) * 1000
    if body.run_duration_ms > sec_window_ms + DURATION_SEC_SLACK_MS:
        raise HTTPException(
            status_code=400,
            detail="Run duration inconsistent with timestamps",
        )

    elapsed_s = body.run_duration_ms / 1000.0
    cap_s = SPRINT_SESSION_CAP_SECONDS if body.sprint_mode else MAX_RUN_DURATION_SECONDS
    elapsed_s = min(elapsed_s, cap_s)

    max_rungs = int(elapsed_s * GAME_MAX_RUNGS_PER_SECOND) + 1
    if body.rungs_climbed > max_rungs:
        raise HTTPException(
            status_code=400,
            detail="Score exceeds run duration plausibility",
        )

    min_elapsed = body.rungs_climbed * MIN_TAP_INTERVAL_S * MIN_TAP_TOLERANCE
    if elapsed_s < min_elapsed:
        raise HTTPException(
            status_code=400,
            detail="Score exceeds minimum run duration",
        )


def _validate_run_timestamps(body: RunSubmitRequest, auth_date: int, now: int) -> None:
    if body.run_started_at >= body.run_ended_at:
        raise HTTPException(status_code=400, detail="Invalid run timestamps")
    if body.run_started_at < auth_date:
        raise HTTPException(status_code=400, detail="Run started before session open")
    if body.run_ended_at > now + CLOCK_SKEW_TOLERANCE_S:
        raise HTTPException(status_code=400, detail="Invalid run end time")
