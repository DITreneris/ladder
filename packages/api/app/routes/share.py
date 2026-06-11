from fastapi import APIRouter, HTTPException

from app.auth.telegram import TelegramAuthError, validate_init_data
from app.config import settings
from app.models import SharePrepareRequest, SharePrepareResponse
from app.share_copy import build_inline_article, build_share_text
from app.telegram.bot_api import BotApiError, save_prepared_inline_message

router = APIRouter()


def _get_user_from_init(init_data: str) -> dict:
    try:
        return validate_init_data(init_data, settings.webapp_secret)
    except TelegramAuthError as e:
        raise HTTPException(status_code=401, detail=str(e)) from e


@router.post("/prepare", response_model=SharePrepareResponse)
def prepare_share(body: SharePrepareRequest):
    tg_user = _get_user_from_init(body.init_data)
    share_text = build_share_text(tg_user, body)
    inline_result = build_inline_article(share_text, body, tg_user)
    try:
        prepared = save_prepared_inline_message(
            tg_user["id"],
            inline_result,
            allow_user_chats=True,
            allow_bot_chats=True,
            allow_group_chats=True,
            allow_channel_chats=True,
        )
    except BotApiError as exc:
        status = exc.status_code if exc.status_code else 502
        raise HTTPException(status_code=status, detail=str(exc)) from exc

    return SharePrepareResponse(prepared_message_id=prepared["id"])
