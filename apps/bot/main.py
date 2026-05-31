"""Corporate Ladder Telegram bot — opens the Mini App."""

import asyncio
import logging
import os

from aiogram import Bot, Dispatcher
from aiogram.filters import CommandStart
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, Message, WebAppInfo
from pathlib import Path

from dotenv import load_dotenv

_REPO_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(_REPO_ROOT / ".env")
load_dotenv(Path(__file__).resolve().parent / ".env")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
MINI_APP_URL = os.getenv("MINI_APP_URL", "http://localhost:5173")


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
    await message.answer(
        "Welcome to Corporate Ladder.\n\n"
        "Climb the ladder. Avoid meetings. Survive reorgs. Don't burn out.\n\n"
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
