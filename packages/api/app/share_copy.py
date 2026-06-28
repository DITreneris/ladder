"""Share text and InlineQueryResultArticle for native Telegram share."""

from __future__ import annotations

import time
import uuid
from typing import Any

from app.config import settings
from app.models import SharePrepareRequest

PA_CARD_SUFFIX = " Built with Prompt Anatomy"
MAX_MESSAGE_TEXT = 4096
MAX_TITLE = 64
MAX_DESCRIPTION = 256

# Short satirical death tag for the status-first share hook — must match
# apps/mini-app/src/lib/share-copy.ts SHORT_DEATH_TAG.
SHORT_DEATH_TAG: dict[str, str] = {
    "meeting": "before a meeting ran long",
    "reorg": "before a reorg erased me",
    "burnout": "before a deadline buried me",
    "badge_gate": "before the turnstile won",
    "foliage": "before a desk plant won",
    "energy": "before burnout finished me",
    "sprint": "before the sprint buzzer",
}
SHORT_DEATH_TAG_FALLBACK = "before HR caught up"


def _truncate(text: str, max_len: int) -> str:
    if len(text) <= max_len:
        return text
    if max_len <= 1:
        return text[:max_len]
    return text[: max_len - 1] + "…"


def build_challenge_link(years_survived: float) -> str:
    compact = max(0, round(years_survived * 10))
    bot = settings.telegram_bot_username.lstrip("@")
    return f"https://t.me/{bot}?startapp=c_{compact}"


def _short_death_tag(death_type: str) -> str:
    return SHORT_DEATH_TAG.get(death_type, SHORT_DEATH_TAG_FALLBACK)


def _card_description(detail: str, flavor: str) -> str:
    base = detail.strip() or flavor.strip().strip('"')
    max_base = MAX_DESCRIPTION - len(PA_CARD_SUFFIX)
    return _truncate(base, max_base) + PA_CARD_SUFFIX


def build_share_text(_tg_user: dict, body: SharePrepareRequest) -> str:
    """Status-first 3-line viral hook — must match apps/mini-app/src/lib/share-copy.ts."""
    years = f"{body.years_survived:.1f}"
    rank = body.final_rank
    tag = _short_death_tag(body.death_type)

    challenge_url = build_challenge_link(body.years_survived)
    text = (
        f"I survived {years}y as {rank} {tag}.\n"
        "Think you can climb higher? 👇\n"
        f"{challenge_url}"
    )
    return _truncate(text, MAX_MESSAGE_TEXT)


def build_inline_article(
    share_text: str,
    body: SharePrepareRequest,
    tg_user: dict,
) -> dict[str, Any]:
    years = f"{body.years_survived:.1f}"
    title = _truncate(f"{body.final_rank} · {years}y — Corporate Ladder", MAX_TITLE)
    description = _card_description(body.termination_detail, body.termination_flavor)
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
