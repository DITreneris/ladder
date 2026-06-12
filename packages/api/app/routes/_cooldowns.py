"""Shared submit cooldown backed by Supabase."""

import logging
import time

from fastapi import HTTPException

from app.db.postgrest_helpers import first_row
from app.db.supabase import get_supabase

logger = logging.getLogger(__name__)

SUBMIT_COOLDOWN_SECONDS = 10


def check_submit_cooldown(telegram_id: int) -> None:
    db = get_supabase()
    result = (
        db.table("submit_cooldowns")
        .select("last_submit_at")
        .eq("telegram_id", telegram_id)
        .limit(1)
        .execute()
    )
    row = first_row(result)
    if not row:
        return
    last = row.get("last_submit_at")
    if not last:
        return
    last_ts = _parse_ts(last)
    if time.time() - last_ts < SUBMIT_COOLDOWN_SECONDS:
        raise HTTPException(status_code=429, detail="Too many submissions")


def record_submit_cooldown(telegram_id: int) -> None:
    db = get_supabase()
    now_iso = _now_iso()
    existing = (
        db.table("submit_cooldowns")
        .select("telegram_id")
        .eq("telegram_id", telegram_id)
        .limit(1)
        .execute()
    )
    if first_row(existing):
        db.table("submit_cooldowns").update({"last_submit_at": now_iso}).eq(
            "telegram_id", telegram_id
        ).execute()
    else:
        db.table("submit_cooldowns").insert(
            {"telegram_id": telegram_id, "last_submit_at": now_iso}
        ).execute()
    logger.debug("submit_cooldown recorded telegram_id=%s", telegram_id)


def _now_iso() -> str:
    from datetime import datetime, timezone

    return datetime.now(timezone.utc).isoformat()


def _parse_ts(value: str) -> float:
    from datetime import datetime, timezone

    dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.timestamp()
