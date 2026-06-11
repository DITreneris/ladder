"""Share text and InlineQueryResultArticle for native Telegram share."""

from __future__ import annotations

import time
import uuid
from typing import Any

from app.config import settings
from app.models import SharePrepareRequest

SPRINT_SHARE_LINE = "Sprint archived at the buzzer — velocity noted, outcomes pending."
MAX_MESSAGE_TEXT = 4096
MAX_TITLE = 64
MAX_DESCRIPTION = 256


def _truncate(text: str, max_len: int) -> str:
    if len(text) <= max_len:
        return text
    if max_len <= 1:
        return text[:max_len]
    return text[: max_len - 1] + "…"


def _display_name(tg_user: dict) -> str:
    return tg_user.get("username") or tg_user.get("first_name") or "CorporateSlave"


def build_challenge_link(years_survived: float) -> str:
    compact = max(0, round(years_survived * 10))
    bot = settings.telegram_bot_username.lstrip("@")
    return f"https://t.me/{bot}?startapp=c_{compact}"


def build_share_text(tg_user: dict, body: SharePrepareRequest) -> str:
    """Mirror mini-app buildShareText() for native share payload."""
    years = f"{body.years_survived:.1f}"
    rank = body.final_rank
    bot_user = settings.telegram_bot_username.lstrip("@")
    detail = body.termination_detail
    flavor = body.termination_flavor
    shift_label = body.shift_label

    sprint_line = f"\n{SPRINT_SHARE_LINE}\n" if body.death_type == "sprint" else ""
    challenge_line = f"Think you can outlast me? {build_challenge_link(body.years_survived)}\n"

    text = (
        "CORPORATE PERFORMANCE REVIEW\n"
        f"Employee: {_display_name(tg_user)}\n"
        f"{years} Years | Final Rank: {rank}\n"
        f"Shift: {shift_label}\n"
        f"{sprint_line}"
        f"Cause: {detail}\n"
        f'"{flavor}"\n'
        f"{challenge_line}"
        f"Play Corporate Ladder on Telegram @{bot_user}\n"
        f"Built with Prompt Anatomy — {settings.prompt_anatomy_url}"
    )
    return _truncate(text, MAX_MESSAGE_TEXT)


def build_inline_article(
    share_text: str,
    body: SharePrepareRequest,
    tg_user: dict,
) -> dict[str, Any]:
    years = f"{body.years_survived:.1f}"
    title = _truncate(f"Corporate Performance Review — {years}y {body.final_rank}", MAX_TITLE)
    description = _truncate(body.termination_detail, MAX_DESCRIPTION)
    result_id = f"share-{tg_user['id']}-{int(time.time())}-{uuid.uuid4().hex[:8]}"

    challenge_url = build_challenge_link(body.years_survived)
    return {
        "type": "article",
        "id": result_id,
        "title": title,
        "description": description,
        "input_message_content": {"message_text": share_text},
        "reply_markup": {
            "inline_keyboard": [
                [{"text": "Punch In & Climb", "url": challenge_url}],
            ],
        },
    }
