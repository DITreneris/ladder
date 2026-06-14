import logging
import time
from collections import defaultdict

from fastapi import APIRouter, HTTPException

logger = logging.getLogger(__name__)

from app.auth.telegram import TelegramAuthError, validate_init_data
from app.config import settings
from app.db.supabase import get_supabase
from app.models import RunSubmitRequest
from app.routes._cooldowns import check_submit_cooldown, record_submit_cooldown
from app.routes._plausibility import validate_score_plausibility
from app.ranks import validate_rank_years
from app.routes._users import upsert_user

router = APIRouter()

# Legacy in-memory fallback when submit_cooldowns table unavailable (tests/dev)
_submit_timestamps: dict[int, float] = defaultdict(float)
_submit_last_years: dict[int, float] = defaultdict(float)
SUBMIT_COOLDOWN_SECONDS = 10


def _get_user_from_init(init_data: str) -> dict:
    try:
        return validate_init_data(init_data, settings.webapp_secret)
    except TelegramAuthError as e:
        raise HTTPException(status_code=401, detail=str(e)) from e


def _check_rate_limit(telegram_id: int, incoming_years: float | None = None) -> None:
    try:
        check_submit_cooldown(telegram_id, incoming_years=incoming_years)
    except HTTPException:
        raise
    except Exception as exc:
        logger.warning(
            "submit_cooldown check failed telegram_id=%s: %s — using in-memory fallback",
            telegram_id,
            exc,
        )
        now = time.time()
        if now - _submit_timestamps[telegram_id] < SUBMIT_COOLDOWN_SECONDS:
            if incoming_years is not None and incoming_years > _submit_last_years[telegram_id]:
                return
            raise HTTPException(status_code=429, detail="Too many submissions") from None


def _record_rate_limit(telegram_id: int, years_survived: float | None = None) -> None:
    try:
        record_submit_cooldown(telegram_id)
    except Exception as exc:
        logger.warning(
            "submit_cooldown persist failed telegram_id=%s: %s — using in-memory fallback",
            telegram_id,
            exc,
        )
        _submit_timestamps[telegram_id] = time.time()
        if years_survived is not None:
            _submit_last_years[telegram_id] = years_survived


@router.post("")
def submit_run(body: RunSubmitRequest):
    tg_user = _get_user_from_init(body.init_data)
    telegram_id = tg_user["id"]
    auth_date = int(tg_user.get("auth_date", time.time()))

    try:
        _check_rate_limit(telegram_id, body.years_survived)

        expected_rungs = body.years_survived * 4
        if abs(body.rungs_climbed - expected_rungs) > 1:
            raise HTTPException(status_code=400, detail="Score inconsistent with rungs climbed")

        validate_rank_years(body.final_rank, body.years_survived)
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

        _record_rate_limit(telegram_id, body.years_survived)

        return {"ok": True, "years_survived": body.years_survived}
    except HTTPException as exc:
        logger.warning(
            "submit_run rejected telegram_id=%s status=%s detail=%s years=%s rank=%s",
            telegram_id,
            exc.status_code,
            exc.detail,
            body.years_survived,
            body.final_rank,
        )
        raise
