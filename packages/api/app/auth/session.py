"""Short-lived API session tokens (opaque, stored in Supabase)."""

import secrets
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException

from app.db.supabase import get_supabase

SESSION_TTL_HOURS = 24


def create_session(telegram_id: int) -> str:
    token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=SESSION_TTL_HOURS)
    db = get_supabase()
    db.table("api_sessions").insert(
        {
            "token": token,
            "telegram_id": telegram_id,
            "expires_at": expires_at.isoformat(),
        }
    ).execute()
    return token


def resolve_session_token(token: str) -> int:
    if not token:
        raise HTTPException(status_code=401, detail="Missing session token")
    db = get_supabase()
    result = (
        db.table("api_sessions")
        .select("telegram_id, expires_at")
        .eq("token", token)
        .maybe_single()
        .execute()
    )
    row = result.data if result else None
    if not row:
        raise HTTPException(status_code=401, detail="Invalid session token")
    expires_at = datetime.fromisoformat(row["expires_at"].replace("Z", "+00:00"))
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session token expired")
    return int(row["telegram_id"])
