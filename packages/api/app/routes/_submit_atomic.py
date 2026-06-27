"""Atomic run submit via Supabase RPC (migration 006)."""

import logging
from uuid import UUID

from fastapi import HTTPException

from app.db.supabase import get_supabase

logger = logging.getLogger(__name__)


class RpcUnavailableError(Exception):
    """Raised when submit_run_atomic is not deployed yet."""


def _parse_rpc_payload(data: object) -> dict:
    if isinstance(data, dict):
        return data
    if isinstance(data, list) and data and isinstance(data[0], dict):
        return data[0]
    raise HTTPException(status_code=503, detail="Submit temporarily unavailable")


def atomic_submit_run(
    *,
    telegram_id: int,
    username: str | None,
    first_name: str | None,
    client_run_id: UUID,
    years_survived: float,
    final_rank: str,
    termination_cause: str | None,
    rungs_climbed: int,
) -> dict:
    db = get_supabase()
    try:
        result = db.rpc(
            "submit_run_atomic",
            {
                "p_telegram_id": telegram_id,
                "p_username": username,
                "p_first_name": first_name,
                "p_client_run_id": str(client_run_id),
                "p_years_survived": years_survived,
                "p_final_rank": final_rank,
                "p_termination_cause": termination_cause,
                "p_rungs_climbed": rungs_climbed,
            },
        ).execute()
    except Exception as exc:
        message = str(exc).lower()
        if "submit_run_atomic" in message and (
            "function" in message or "404" in message or "not found" in message
        ):
            raise RpcUnavailableError from exc
        logger.error(
            "submit_run_atomic rpc failed telegram_id=%s: %s",
            telegram_id,
            exc,
            exc_info=exc,
        )
        raise HTTPException(status_code=503, detail="Submit temporarily unavailable") from exc

    payload = _parse_rpc_payload(getattr(result, "data", None))
    if not payload.get("ok"):
        if payload.get("error") == "cooldown":
            raise HTTPException(status_code=429, detail="Too many submissions")
        raise HTTPException(status_code=503, detail="Submit temporarily unavailable")

    return payload
