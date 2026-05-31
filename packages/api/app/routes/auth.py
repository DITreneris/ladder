from fastapi import APIRouter, HTTPException

from app.auth.telegram import TelegramAuthError, validate_init_data
from app.config import settings
from app.db.supabase import get_supabase
from app.models import InitDataRequest, UserProfile
from app.routes._users import upsert_user

router = APIRouter()


def _get_user_from_init(init_data: str) -> dict:
    try:
        return validate_init_data(init_data, settings.webapp_secret)
    except TelegramAuthError as e:
        raise HTTPException(status_code=401, detail=str(e)) from e


@router.post("/me", response_model=UserProfile)
def auth_me(body: InitDataRequest):
    tg_user = _get_user_from_init(body.init_data)
    user = upsert_user(tg_user)
    return UserProfile(
        telegram_id=user["telegram_id"],
        username=user.get("username"),
        first_name=user.get("first_name"),
        best_score=float(user.get("best_score", 0)),
        best_rank=user.get("best_rank", "Intern"),
    )
