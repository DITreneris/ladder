import time
from collections import defaultdict

from fastapi import APIRouter, HTTPException

from app.auth.telegram import TelegramAuthError, validate_init_data
from app.config import settings
from app.db.supabase import get_supabase
from app.models import RunSubmitRequest
from app.routes._users import upsert_user

router = APIRouter()

_submit_timestamps: dict[int, float] = defaultdict(float)
SUBMIT_COOLDOWN_SECONDS = 10
MANAGER_YEARS = 10
CEO_YEARS = 35


def _validate_rank_years(final_rank: str, years_survived: float) -> None:
    if final_rank == "Intern" and years_survived >= MANAGER_YEARS:
        raise HTTPException(status_code=400, detail="Rank inconsistent with years survived")
    if final_rank == "Manager" and (
        years_survived < MANAGER_YEARS or years_survived >= CEO_YEARS
    ):
        raise HTTPException(status_code=400, detail="Rank inconsistent with years survived")
    if final_rank == "CEO" and years_survived < CEO_YEARS:
        raise HTTPException(status_code=400, detail="Rank inconsistent with years survived")


def _get_user_from_init(init_data: str) -> dict:
    try:
        return validate_init_data(init_data, settings.webapp_secret)
    except TelegramAuthError as e:
        raise HTTPException(status_code=401, detail=str(e)) from e


@router.post("")
def submit_run(body: RunSubmitRequest):
    tg_user = _get_user_from_init(body.init_data)
    telegram_id = tg_user["id"]

    now = time.time()
    if now - _submit_timestamps[telegram_id] < SUBMIT_COOLDOWN_SECONDS:
        raise HTTPException(status_code=429, detail="Too many submissions")

    expected_rungs = body.years_survived * 4
    if abs(body.rungs_climbed - expected_rungs) > 1:
        raise HTTPException(status_code=400, detail="Score inconsistent with rungs climbed")

    _validate_rank_years(body.final_rank, body.years_survived)

    user = upsert_user(tg_user)
    user_id = user["id"]

    db = get_supabase()
    db.table("game_runs").insert(
        {
            "user_id": user_id,
            "years_survived": body.years_survived,
            "final_rank": body.final_rank,
            "termination_cause": body.termination_cause,
            "rungs_climbed": body.rungs_climbed,
        }
    ).execute()

    if body.years_survived > float(user.get("best_score", 0)):
        db.table("users").update(
            {"best_score": body.years_survived, "best_rank": body.final_rank}
        ).eq("id", user_id).execute()

    _submit_timestamps[telegram_id] = now

    return {"ok": True, "years_survived": body.years_survived}
