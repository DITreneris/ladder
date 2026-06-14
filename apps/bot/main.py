"""Corporate Ladder Telegram bot — opens the Mini App."""

import asyncio
import logging
import os
from pathlib import Path

from aiohttp import web
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
MINI_APP_SHORT_NAME = os.getenv("MINI_APP_SHORT_NAME", "").strip()
BOT_USERNAME = ""
HEALTH_PORT = int(os.getenv("PORT", "8080"))

GROUP_CHAT_TYPES = frozenset({"group", "supergroup"})


def build_welcome_text(preset: ShiftPreset | None = None) -> str:
    shift = preset or today_preset()
    play_url = MINI_APP_URL.rstrip("/")
    return (
        "Can you survive the Corporate Ladder?\n\n"
        "Start as an Intern. Dodge meetings. Survive the org chart.\n"
        "Coffee gives +25% Energy. Most players never reach Manager.\n\n"
        f"Today's shift: {shift['label']}\n"
        f"{shift['description']}\n\n"
        "👇 Punch In & Climb:\n"
        f"{play_url}"
    )


def build_help_text() -> str:
    return (
        "How to play (about 30–90 seconds):\n\n"
        "• TAP LEFT or RIGHT for the next rung's safe side.\n"
        "• Meetings, reorgs, and deadlines block one side.\n"
        "• Coffee restores +25% Energy when you pick it up.\n"
        "• Climb Intern → Manager (10y) → Director (20y) → CEO (35y) → Board Member (50y) → Angel Investor (75y).\n"
        "• Scores land on Daily and Weekly leaderboards.\n\n"
        "Tap Punch In & Climb to open the app.\n\n"
        "In a group with other bots, use /go (or /go@this_bot) instead of /start.\n"
        "In groups, Punch In opens via t.me link (Telegram does not allow WebApp buttons in groups)."
    )


def direct_mini_app_link(bot_username: str) -> str:
    user = bot_username.lstrip("@")
    if MINI_APP_SHORT_NAME:
        return f"https://t.me/{user}/{MINI_APP_SHORT_NAME}"
    return f"https://t.me/{user}?startapp"


def main_keyboard(*, bot_username: str, chat_type: str) -> InlineKeyboardMarkup:
    if chat_type in GROUP_CHAT_TYPES:
        play_button = InlineKeyboardButton(
            text="Punch In & Climb",
            url=direct_mini_app_link(bot_username),
        )
    else:
        play_button = InlineKeyboardButton(
            text="Punch In & Climb",
            web_app=WebAppInfo(url=MINI_APP_URL),
        )
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [play_button],
            [
                InlineKeyboardButton(
                    text="Visit Prompt Anatomy",
                    url="https://www.promptanatomy.app/",
                )
            ],
        ]
    )


def _chat_label(message: Message) -> str:
    chat = message.chat
    return f"{chat.type}:{chat.id}"


async def send_welcome(message: Message) -> None:
    me = await message.bot.get_me()
    username = me.username or BOT_USERNAME or "CorporateLadder_bot"
    text = build_welcome_text()
    keyboard = main_keyboard(bot_username=username, chat_type=message.chat.type)
    try:
        await message.answer(text, reply_markup=keyboard)
    except Exception:
        logger.exception(
            "Failed to send welcome with keyboard (%s)",
            _chat_label(message),
        )
        await message.answer(
            f"{text}\n\n(Open the link above if the Punch In button is missing.)",
            disable_web_page_preview=False,
        )


async def _handle_command(message: Message, command: str) -> None:
    logger.info(
        "Command /%s from %s user=%s text=%r",
        command,
        _chat_label(message),
        message.from_user.id if message.from_user else "?",
        message.text,
    )
    await send_welcome(message)


async def cmd_start(message: Message):
    await _handle_command(message, "start")


async def cmd_play(message: Message):
    await _handle_command(message, "play")


async def cmd_go(message: Message):
    await _handle_command(message, "go")


async def cmd_help(message: Message):
    logger.info(
        "Command /help from %s user=%s text=%r",
        _chat_label(message),
        message.from_user.id if message.from_user else "?",
        message.text,
    )
    try:
        me = await message.bot.get_me()
        username = me.username or BOT_USERNAME or "CorporateLadder_bot"
        await message.answer(
            build_help_text(),
            reply_markup=main_keyboard(bot_username=username, chat_type=message.chat.type),
        )
    except Exception:
        logger.exception("Failed to send /help with keyboard (%s)", _chat_label(message))
        await message.answer(build_help_text())


async def health_handler(_request: web.Request) -> web.Response:
    return web.json_response({"status": "ok"})


async def start_health_server() -> web.AppRunner:
    app = web.Application()
    app.router.add_get("/health", health_handler)
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, "0.0.0.0", HEALTH_PORT)
    await site.start()
    logger.info("Health server listening on port %s", HEALTH_PORT)
    return runner


async def main():
    global BOT_USERNAME
    if not BOT_TOKEN:
        logger.error("TELEGRAM_BOT_TOKEN not set")
        return

    health_runner = await start_health_server()
    bot = Bot(token=BOT_TOKEN)
    me = await bot.get_me()
    BOT_USERNAME = me.username or ""
    dp = Dispatcher()
    dp.message.register(cmd_start, CommandStart())
    dp.message.register(cmd_play, Command("play"))
    dp.message.register(cmd_go, Command("go"))
    dp.message.register(cmd_help, Command("help"))

    logger.info(
        "Bot starting as @%s (id=%s) MINI_APP_URL=%s",
        me.username,
        me.id,
        MINI_APP_URL,
    )
    try:
        await dp.start_polling(bot, drop_pending_updates=True)
    finally:
        await health_runner.cleanup()


if __name__ == "__main__":
    asyncio.run(main())
