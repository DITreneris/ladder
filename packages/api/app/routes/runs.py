import logging
import time
from uuid import UUID

from fastapi import APIRouter, HTTPException, Request

logger = logging.getLogger(__name__)

from app.auth.telegram import TelegramAuthError, validate_init_data
from app.config import settings
from app.db.postgrest_helpers import first_row
from app.db.supabase import get_supabase
from app.middleware.rate_limit import limiter
from app.models import RunSubmitRequest, RunSubmitResponse
from app.routes._plausibility import validate_score_plausibility
from app.routes._submit_atomic import RpcUnavailableError, atomic_submit_run
from app.ranks import validate_rank_years
from app.routes._users import upsert_user

router = APIRouter()

_USE_ATOMIC_SUBMIT = True


def _get_user_from_init(init_data: str) -> dict:
    try:
        return validate_init_data(init_data, settings.webapp_secret)
    except TelegramAuthError as e:
        raise HTTPException(status_code=401, detail=str(e)) from e


def _legacy_persist_submit(
    tg_user: dict,
    telegram_id: int,
    body: RunSubmitRequest,
    client_run_id: UUID,
) -> RunSubmitResponse:
    from app.routes._cooldowns import check_submit_cooldown, record_submit_cooldown

    try:
        check_submit_cooldown(telegram_id, incoming_years=body.years_survived)
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

    user = upsert_user(tg_user)
    user_id = user["id"]

    db = get_supabase()
    try:
        insert_result = db.table("game_runs").insert(
            {
                "user_id": user_id,
                "years_survived": body.years_survived,
                "final_rank": body.final_rank,
                "termination_cause": body.termination_cause,
                "rungs_climbed": body.rungs_climbed,
                "client_run_id": str(client_run_id),
            }
        ).execute()
    except Exception as exc:
        logger.error(
            "game_runs insert failed user_id=%s telegram_id=%s: %s",
            user_id,
            telegram_id,
            exc,
            exc_info=exc,
        )
        raise HTTPException(status_code=503, detail="Submit temporarily unavailable") from exc

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

    return RunSubmitResponse(
        ok=True,
        years_survived=body.years_survived,
        best_score=best_score,
        best_rank=best_rank,
    )


def _persist_submit(tg_user: dict, telegram_id: int, body: RunSubmitRequest) -> RunSubmitResponse:
    client_run_id = body.client_run_id
    if _USE_ATOMIC_SUBMIT:
        try:
            payload = atomic_submit_run(
                telegram_id=telegram_id,
                username=tg_user.get("username"),
                first_name=tg_user.get("first_name"),
                client_run_id=client_run_id,
                years_survived=body.years_survived,
                final_rank=body.final_rank,
                termination_cause=body.termination_cause,
                rungs_climbed=body.rungs_climbed,
            )
        except RpcUnavailableError:
            logger.warning("submit_run_atomic unavailable; falling back to legacy persist")
            return _legacy_persist_submit(tg_user, telegram_id, body, client_run_id)
        except HTTPException:
            raise

        return RunSubmitResponse(
            ok=True,
            years_survived=float(payload["years_survived"]),
            best_score=float(payload["best_score"]),
            best_rank=str(payload["best_rank"]),
        )

    return _legacy_persist_submit(tg_user, telegram_id, body, client_run_id)


@router.post("")
@limiter.limit("30/minute")
def submit_run(request: Request, body: RunSubmitRequest):
    tg_user = _get_user_from_init(body.init_data)
    telegram_id = tg_user["id"]
    auth_date = int(tg_user.get("auth_date", time.time()))

    try:
        expected_rungs = body.years_survived * 4
        if abs(body.rungs_climbed - expected_rungs) > 1:
            raise HTTPException(status_code=400, detail="Score inconsistent with rungs climbed")

        validate_rank_years(body.final_rank, body.years_survived)
        validate_score_plausibility(body, auth_date)

        response = _persist_submit(tg_user, telegram_id, body)
        return response.model_dump()
    except HTTPException as exc:
        logger.warning(
            "submit_run rejected telegram_id=%s status=%s detail=%s years=%s rank=%s "
            "rungs=%s duration_ms=%s window_s=%s started=%s ended=%s client_run_id=%s",
            telegram_id,
            exc.status_code,
            exc.detail,
            body.years_survived,
            body.final_rank,
            body.rungs_climbed,
            body.run_duration_ms,
            body.run_ended_at - body.run_started_at,
            body.run_started_at,
            body.run_ended_at,
            body.client_run_id,
        )
        raise
