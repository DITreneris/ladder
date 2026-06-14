import logging
import time
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException, Query, Request

from app.auth.session import resolve_session_token
from app.db.supabase import get_supabase
from app.middleware.rate_limit import limiter
from app.models import (
    LeaderboardEntry,
    LeaderboardMeRequest,
    LeaderboardMeResponse,
    LeaderboardResponse,
)

router = APIRouter()
logger = logging.getLogger(__name__)

CACHE_TTL_SECONDS = 45
_lb_cache: dict[str, tuple[float, dict[int, dict]]] = {}


def _period_start(period: str) -> datetime:
    now = datetime.now(timezone.utc)
    if period == "daily":
        return now.replace(hour=0, minute=0, second=0, microsecond=0)
    if period == "weekly":
        return now - timedelta(days=7)
    raise HTTPException(status_code=400, detail="period must be daily or weekly")


def _rows_to_best_by_user(rows: list[dict]) -> dict[int, dict]:
    best_by_user: dict[int, dict] = {}
    for row in rows:
        tg_id = row.get("telegram_id")
        if tg_id is None:
            continue
        score = float(row["years_survived"])
        if tg_id not in best_by_user or score > best_by_user[tg_id]["years_survived"]:
            best_by_user[tg_id] = {
                "username": row.get("username") or row.get("first_name") or "Employee",
                "first_name": row.get("first_name"),
                "years_survived": score,
                "final_rank": row["final_rank"],
                "telegram_id": tg_id,
            }
    return best_by_user


def _fetch_best_by_user_rpc(since: datetime) -> dict[int, dict] | None:
    db = get_supabase()
    if not callable(getattr(db, "rpc", None)):
        return None
    try:
        result = db.rpc(
            "leaderboard_best_runs",
            {"since_ts": since.isoformat()},
        ).execute()
    except Exception as exc:
        logger.warning("leaderboard_rpc_failed: %s", exc)
        return None
    data = getattr(result, "data", None)
    rows = data if isinstance(data, list) else []
    if not rows:
        return {}
    return _rows_to_best_by_user(rows)


def _fetch_best_by_user_legacy(since: datetime) -> dict[int, dict]:
    db = get_supabase()
    runs = (
        db.table("game_runs")
        .select("years_survived, final_rank, created_at, users(username, first_name, telegram_id)")
        .gte("created_at", since.isoformat())
        .order("years_survived", desc=True)
        .limit(2000)
        .execute()
    )

    rows: list[dict] = []
    for row in runs.data or []:
        user_info = row.get("users") or {}
        tg_id = user_info.get("telegram_id")
        if tg_id is None:
            continue
        rows.append(
            {
                "telegram_id": tg_id,
                "username": user_info.get("username"),
                "first_name": user_info.get("first_name"),
                "years_survived": row["years_survived"],
                "final_rank": row["final_rank"],
            }
        )
    return _rows_to_best_by_user(rows)


def _fetch_best_by_user(since: datetime, period: str) -> dict[int, dict]:
    cache_key = f"{period}:{since.isoformat()}"
    now = time.time()
    cached = _lb_cache.get(cache_key)
    if cached and now - cached[0] < CACHE_TTL_SECONDS:
        return cached[1]

    best = _fetch_best_by_user_rpc(since)
    if best is None:
        best = _fetch_best_by_user_legacy(since)

    _lb_cache[cache_key] = (now, best)
    return best


@router.get("", response_model=LeaderboardResponse)
@limiter.limit("60/minute")
def get_leaderboard(
    request: Request,
    period: str = Query("daily", pattern="^(daily|weekly)$"),
    limit: int = Query(50, ge=1, le=100),
):
    since = _period_start(period)

    try:
        get_supabase()
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail="Database unavailable") from e

    best_by_user = _fetch_best_by_user(since, period)
    sorted_entries = sorted(best_by_user.values(), key=lambda x: x["years_survived"], reverse=True)[:limit]

    entries = [
        LeaderboardEntry(
            rank=i + 1,
            username=e["username"],
            first_name=e["first_name"],
            years_survived=e["years_survived"],
            final_rank=e["final_rank"],
            is_current_user=False,
        )
        for i, e in enumerate(sorted_entries)
    ]

    return LeaderboardResponse(period=period, entries=entries)


@router.post("/me", response_model=LeaderboardMeResponse)
def get_leaderboard_me(body: LeaderboardMeRequest):
    since = _period_start(body.period)
    telegram_id = resolve_session_token(body.session_token)

    try:
        get_supabase()
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail="Database unavailable") from e

    best_by_user = _fetch_best_by_user(since, body.period)
    sorted_entries = sorted(best_by_user.values(), key=lambda x: x["years_survived"], reverse=True)

    for i, entry in enumerate(sorted_entries):
        if entry["telegram_id"] == telegram_id:
            return LeaderboardMeResponse(
                period=body.period,
                rank=i + 1,
                years_survived=entry["years_survived"],
                final_rank=entry["final_rank"],
                on_board=True,
            )

    return LeaderboardMeResponse(period=body.period, on_board=False)
