"""Corporate Ladder Telegram bot — opens the Mini App."""

import asyncio
import logging
import os
from datetime import datetime, timezone
from pathlib import Path

from aiogram import Bot, Dispatcher
from aiogram.filters import CommandStart
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, Message, WebAppInfo
from dotenv import load_dotenv

_REPO_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(_REPO_ROOT / ".env")
load_dotenv(Path(__file__).resolve().parent / ".env")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
MINI_APP_URL = os.getenv("MINI_APP_URL", "http://localhost:5173")

PRESET_ORDER = ("standard", "meeting_monday", "coffee_break", "reorg_week")
PRESET_LABELS = {
    "standard": "Open Floor Plan",
    "meeting_monday": "Meeting Monday",
    "coffee_break": "Coffee Break",
    "reorg_week": "Reorg Week",
}


def _utc_date_key(dt: datetime) -> str:
    return dt.strftime("%Y-%m-%d")


def _hash_date_key(key: str) -> int:
    h = 0
    for char in key:
        h = (31 * h + ord(char)) & 0xFFFFFFFF
    return h


def today_shift_label() -> str:
    """Match mini-app UTC daily preset rotation (daily-modifier.ts)."""
    now = datetime.now(timezone.utc)
    idx = _hash_date_key(_utc_date_key(now)) % len(PRESET_ORDER)
    preset_id = PRESET_ORDER[idx]
    return PRESET_LABELS[preset_id]


def main_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="Punch In & Climb",
                    web_app=WebAppInfo(url=MINI_APP_URL),
                )
            ],
            [
                InlineKeyboardButton(
                    text="Visit Prompt Anatomy",
                    url="https://www.promptanatomy.app/",
                )
            ],
        ]
    )


async def cmd_start(message: Message):
    shift = today_shift_label()
    await message.answer(
        "Welcome to Corporate Ladder.\n\n"
        "Climb the ladder. Avoid meetings. Survive reorgs. Don't burn out.\n\n"
        f"Today's shift: {shift}\n\n"
        "Tap below to start your shift:\n\n"
        "Part of the Prompt Anatomy ecosystem. Learn more: https://www.promptanatomy.app/",
        reply_markup=main_keyboard(),
    )


async def main():
    if not BOT_TOKEN:
        logger.error("TELEGRAM_BOT_TOKEN not set")
        return

    bot = Bot(token=BOT_TOKEN)
    dp = Dispatcher()
    dp.message.register(cmd_start, CommandStart())

    logger.info("Bot starting... Mini App URL: %s", MINI_APP_URL)
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
