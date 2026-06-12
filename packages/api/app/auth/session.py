"""Short-lived API session tokens (opaque, stored in Supabase)."""

import logging
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException

from app.db.postgrest_helpers import first_row
from app.db.supabase import get_supabase

logger = logging.getLogger(__name__)

SESSION_TTL_HOURS = 24
MAX_ACTIVE_SESSIONS_PER_USER = 3


def _cleanup_sessions(db, telegram_id: int) -> None:
    now_iso = datetime.now(timezone.utc).isoformat()
    db.table("api_sessions").delete().lt("expires_at", now_iso).execute()

    existing = (
        db.table("api_sessions")
        .select("token, expires_at")
        .eq("telegram_id", telegram_id)
        .execute()
    )
    rows = existing.data if existing else []
    if not rows:
        return

    def sort_key(row: dict) -> str:
        return row.get("expires_at") or ""

    rows.sort(key=sort_key, reverse=True)
    if len(rows) >= MAX_ACTIVE_SESSIONS_PER_USER:
        for row in rows[MAX_ACTIVE_SESSIONS_PER_USER - 1 :]:
            db.table("api_sessions").delete().eq("token", row["token"]).execute()


def create_session(telegram_id: int) -> str:
    token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=SESSION_TTL_HOURS)
    db = get_supabase()
    _cleanup_sessions(db, telegram_id)
    db.table("api_sessions").insert(
        {
            "token": token,
            "telegram_id": telegram_id,
            "expires_at": expires_at.isoformat(),
        }
    ).execute()
    logger.debug("api_session created telegram_id=%s", telegram_id)
    return token


def resolve_session_token(token: str) -> int:
    if not token:
        raise HTTPException(status_code=401, detail="Missing session token")
    db = get_supabase()
    result = (
        db.table("api_sessions")
        .select("telegram_id, expires_at")
        .eq("token", token)
        .limit(1)
        .execute()
    )
    row = first_row(result)
    if not row:
        raise HTTPException(status_code=401, detail="Invalid session token")
    expires_at = datetime.fromisoformat(row["expires_at"].replace("Z", "+00:00"))
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session token expired")
    return int(row["telegram_id"])
