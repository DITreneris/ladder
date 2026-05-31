from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException, Query

from app.auth.telegram import TelegramAuthError, validate_init_data
from app.config import settings
from app.db.supabase import get_supabase
from app.models import LeaderboardEntry, LeaderboardResponse

router = APIRouter()


def _period_start(period: str) -> datetime:
    now = datetime.now(timezone.utc)
    if period == "daily":
        return now.replace(hour=0, minute=0, second=0, microsecond=0)
    if period == "weekly":
        return now - timedelta(days=7)
    raise HTTPException(status_code=400, detail="period must be daily or weekly")


@router.get("", response_model=LeaderboardResponse)
def get_leaderboard(
    period: str = Query("daily", pattern="^(daily|weekly)$"),
    limit: int = Query(50, ge=1, le=100),
    init_data: str | None = Query(None, alias="initData"),
):
    since = _period_start(period)

    try:
        db = get_supabase()
    except RuntimeError:
        return LeaderboardResponse(period=period, entries=[])

    runs = (
        db.table("game_runs")
        .select("years_survived, final_rank, created_at, users(username, first_name, telegram_id)")
        .gte("created_at", since.isoformat())
        .order("years_survived", desc=True)
        .limit(500)
        .execute()
    )

    current_telegram_id: int | None = None
    if init_data:
        try:
            user = validate_init_data(init_data, settings.webapp_secret)
            current_telegram_id = user.get("id")
        except TelegramAuthError:
            pass

    # Best run per user in period
    best_by_user: dict[int, dict] = {}
    for row in runs.data or []:
        user_info = row.get("users") or {}
        tg_id = user_info.get("telegram_id")
        if tg_id is None:
            continue
        score = float(row["years_survived"])
        if tg_id not in best_by_user or score > best_by_user[tg_id]["years_survived"]:
            best_by_user[tg_id] = {
                "username": user_info.get("username") or user_info.get("first_name") or "Employee",
                "first_name": user_info.get("first_name"),
                "years_survived": score,
                "final_rank": row["final_rank"],
                "telegram_id": tg_id,
            }

    sorted_entries = sorted(best_by_user.values(), key=lambda x: x["years_survived"], reverse=True)[:limit]

    entries = [
        LeaderboardEntry(
            rank=i + 1,
            username=e["username"],
            first_name=e["first_name"],
            years_survived=e["years_survived"],
            final_rank=e["final_rank"],
            is_current_user=current_telegram_id is not None and e["telegram_id"] == current_telegram_id,
        )
        for i, e in enumerate(sorted_entries)
    ]

    return LeaderboardResponse(period=period, entries=entries)
