"""Corporate Ladder Telegram bot — opens the Mini App."""

import asyncio
import logging
import os
from pathlib import Path

from aiogram import Bot, Dispatcher
from aiogram.filters import Command, CommandStart
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, Message, WebAppInfo
from dotenv import load_dotenv

from shifts import ShiftPreset, today_preset

_here = Path(__file__).resolve()
load_dotenv(_here.parent / ".env")
if len(_here.parents) >= 3:
    load_dotenv(_here.parents[2] / ".env")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
MINI_APP_URL = os.getenv("MINI_APP_URL", "http://localhost:5173")


def build_welcome_text(preset: ShiftPreset | None = None) -> str:
    shift = preset or today_preset()
    play_url = MINI_APP_URL.rstrip("/")
    return (
        "Welcome to Corporate Ladder.\n\n"
        "Tap LEFT or RIGHT on each rung — pick the safe side. "
        "Dodge meetings, reorgs, and deadlines. Watch your Energy.\n\n"
        f"Today's shift: {shift['label']}\n"
        f"{shift['description']}\n\n"
        "Tap Punch In & Climb below to start.\n\n"
        f"{play_url}"
    )


def build_help_text() -> str:
    return (
        "How to play (about 30–90 seconds):\n\n"
        "• Tap LEFT or RIGHT each rung — stay on the empty side.\n"
        "• Meetings, reorgs, and deadlines block one side.\n"
        "• Coffee restores +25% Energy when you pick it up.\n"
        "• Climb Intern → Manager (10y) → CEO (35y).\n"
        "• Scores land on Daily and Weekly leaderboards.\n\n"
        "Tap Punch In & Climb to open the app.\n\n"
        "In a group with other bots, use /go (or /go@this_bot) instead of /start."
    )


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


async def send_welcome(message: Message) -> None:
    await message.answer(
        build_welcome_text(),
        reply_markup=main_keyboard(),
    )


async def cmd_start(message: Message):
    await send_welcome(message)


async def cmd_play(message: Message):
    await send_welcome(message)


async def cmd_go(message: Message):
    await send_welcome(message)


async def cmd_help(message: Message):
    await message.answer(
        build_help_text(),
        reply_markup=main_keyboard(),
    )


async def main():
    if not BOT_TOKEN:
        logger.error("TELEGRAM_BOT_TOKEN not set")
        return

    bot = Bot(token=BOT_TOKEN)
    dp = Dispatcher()
    dp.message.register(cmd_start, CommandStart())
    dp.message.register(cmd_play, Command("play"))
    dp.message.register(cmd_go, Command("go"))
    dp.message.register(cmd_help, Command("help"))

    logger.info("Bot starting... Mini App URL: %s", MINI_APP_URL)
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
