import logging
import time

from fastapi import APIRouter, HTTPException, Request

logger = logging.getLogger(__name__)

from app.auth.telegram import TelegramAuthError, validate_init_data
from app.config import settings
from app.db.postgrest_helpers import first_row
from app.db.supabase import get_supabase
from app.middleware.rate_limit import limiter
from app.models import RunSubmitRequest, RunSubmitResponse
from app.routes._cooldowns import check_submit_cooldown, record_submit_cooldown
from app.routes._plausibility import validate_score_plausibility
from app.ranks import validate_rank_years
from app.routes._users import upsert_user

router = APIRouter()


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
        logger.error(
            "submit_cooldown check failed telegram_id=%s: %s",
            telegram_id,
            exc,
            exc_info=exc,
        )
        raise HTTPException(status_code=503, detail="Submit temporarily unavailable") from exc


def _record_rate_limit(telegram_id: int, run_id: str | None = None) -> None:
    try:
        record_submit_cooldown(telegram_id)
    except Exception as exc:
        if run_id:
            try:
                get_supabase().table("game_runs").delete().eq("id", run_id).execute()
            except Exception as delete_exc:
                logger.error(
                    "submit_cooldown rollback failed run_id=%s: %s",
                    run_id,
                    delete_exc,
                    exc_info=delete_exc,
                )
        logger.error(
            "submit_cooldown persist failed telegram_id=%s: %s",
            telegram_id,
            exc,
            exc_info=exc,
        )
        raise HTTPException(status_code=503, detail="Submit temporarily unavailable") from exc


@router.post("")
@limiter.limit("30/minute")
def submit_run(request: Request, body: RunSubmitRequest):
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
        insert_result = db.table("game_runs").insert(
            {
                "user_id": user_id,
                "years_survived": body.years_survived,
                "final_rank": body.final_rank,
                "termination_cause": body.termination_cause,
                "rungs_climbed": body.rungs_climbed,
            }
        ).execute()

        run_row = first_row(insert_result)
        run_id = str(run_row["id"]) if run_row and run_row.get("id") else None

        best_score = float(user.get("best_score", 0))
        best_rank = str(user.get("best_rank", "Intern"))
        if body.years_survived > best_score:
            db.table("users").update(
                {"best_score": body.years_survived, "best_rank": body.final_rank}
            ).eq("id", user_id).lt("best_score", body.years_survived).execute()
            best_score = max(best_score, body.years_survived)
            best_rank = body.final_rank

        refreshed = db.table("users").select("best_score, best_rank").eq("id", user_id).limit(1).execute()
        refreshed_row = first_row(refreshed)
        if refreshed_row:
            best_score = float(refreshed_row.get("best_score", best_score))
            best_rank = str(refreshed_row.get("best_rank", best_rank))

        _record_rate_limit(telegram_id, run_id)

        return RunSubmitResponse(
            ok=True,
            years_survived=body.years_survived,
            best_score=best_score,
            best_rank=best_rank,
        ).model_dump()
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
