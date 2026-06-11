import time
from collections import defaultdict

from fastapi import APIRouter, HTTPException

from app.auth.telegram import TelegramAuthError, validate_init_data
from app.config import settings
from app.db.supabase import get_supabase
from app.models import RunSubmitRequest
from app.routes._cooldowns import check_submit_cooldown, record_submit_cooldown
from app.routes._plausibility import validate_score_plausibility
from app.routes._users import upsert_user

router = APIRouter()

# Legacy in-memory fallback when submit_cooldowns table unavailable (tests/dev)
_submit_timestamps: dict[int, float] = defaultdict(float)
SUBMIT_COOLDOWN_SECONDS = 10
MANAGER_YEARS = 10
DIRECTOR_YEARS = 20
CEO_YEARS = 35

# Contiguous rank bands: Intern [0,10) / Manager [10,20) / Director [20,35) / CEO [35,...)
_RANK_BANDS: dict[str, tuple[float, float]] = {
    "Intern": (0, MANAGER_YEARS),
    "Manager": (MANAGER_YEARS, DIRECTOR_YEARS),
    "Director": (DIRECTOR_YEARS, CEO_YEARS),
    "CEO": (CEO_YEARS, float("inf")),
}


def _validate_rank_years(final_rank: str, years_survived: float) -> None:
    band = _RANK_BANDS.get(final_rank)
    if band is None:
        raise HTTPException(status_code=400, detail="Rank inconsistent with years survived")
    low, high = band
    if years_survived < low or years_survived >= high:
        raise HTTPException(status_code=400, detail="Rank inconsistent with years survived")


def _get_user_from_init(init_data: str) -> dict:
    try:
        return validate_init_data(init_data, settings.webapp_secret)
    except TelegramAuthError as e:
        raise HTTPException(status_code=401, detail=str(e)) from e


def _check_rate_limit(telegram_id: int) -> None:
    try:
        check_submit_cooldown(telegram_id)
    except HTTPException:
        raise
    except Exception:
        now = time.time()
        if now - _submit_timestamps[telegram_id] < SUBMIT_COOLDOWN_SECONDS:
            raise HTTPException(status_code=429, detail="Too many submissions") from None


def _record_rate_limit(telegram_id: int) -> None:
    try:
        record_submit_cooldown(telegram_id)
    except Exception:
        _submit_timestamps[telegram_id] = time.time()


@router.post("")
def submit_run(body: RunSubmitRequest):
    tg_user = _get_user_from_init(body.init_data)
    telegram_id = tg_user["id"]
    auth_date = int(tg_user.get("auth_date", time.time()))

    _check_rate_limit(telegram_id)

    expected_rungs = body.years_survived * 4
    if abs(body.rungs_climbed - expected_rungs) > 1:
        raise HTTPException(status_code=400, detail="Score inconsistent with rungs climbed")

    _validate_rank_years(body.final_rank, body.years_survived)
    validate_score_plausibility(body, auth_date)

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

    _record_rate_limit(telegram_id)

    return {"ok": True, "years_survived": body.years_survived}
