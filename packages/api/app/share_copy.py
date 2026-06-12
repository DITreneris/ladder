"""Share text and InlineQueryResultArticle for native Telegram share."""

from __future__ import annotations

import time
import uuid
from typing import Any

from app.config import settings
from app.models import SharePrepareRequest

SPRINT_SHARE_LINE = "Sprint archived at the buzzer — velocity noted, outcomes pending."
PA_CARD_SUFFIX = " Built with Prompt Anatomy"
MAX_MESSAGE_TEXT = 4096
MAX_TITLE = 64
MAX_DESCRIPTION = 256
MAX_DEATH_LINE = 90


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


def _pick_death_line(detail: str, flavor: str) -> str:
    """One punchline for share body — flavor if short, else first sentence of detail."""
    flavor_clean = flavor.strip().strip('"')
    if flavor_clean and len(flavor_clean) <= MAX_DEATH_LINE:
        return flavor_clean.rstrip(".")

    detail = detail.strip()
    if detail:
        period_idx = detail.find(".")
        first = detail[: period_idx + 1] if period_idx >= 0 else detail
        return _truncate(first.strip().rstrip("."), MAX_DEATH_LINE)

    if flavor_clean:
        return _truncate(flavor_clean.rstrip("."), MAX_DEATH_LINE)

    return "HR filed the paperwork"


def _card_description(detail: str, flavor: str) -> str:
    base = detail.strip() or flavor.strip().strip('"')
    max_base = MAX_DESCRIPTION - len(PA_CARD_SUFFIX)
    return _truncate(base, max_base) + PA_CARD_SUFFIX


def build_share_text(_tg_user: dict, body: SharePrepareRequest) -> str:
    """3-line viral hook — must match apps/mini-app/src/lib/share-copy.ts."""
    years = f"{body.years_survived:.1f}"
    rank = body.final_rank
    if body.death_type == "sprint":
        short_death = SPRINT_SHARE_LINE.rstrip(".")
    else:
        short_death = _pick_death_line(body.termination_detail, body.termination_flavor)

    challenge_url = build_challenge_link(body.years_survived)
    text = (
        f"{rank} · {years}y — {short_death}.\n"
        "Think you can outlast me?\n"
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
