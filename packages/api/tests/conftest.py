"""Shared pytest fixtures for API integration tests."""

import hashlib
import hmac
import json
import time
from datetime import datetime, timedelta, timezone
from unittest.mock import MagicMock

import pytest

from app.config import settings

BOT_TOKEN = "123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
TEST_USER = {"id": 12345, "username": "testuser", "first_name": "Test"}


def build_init_data(user: dict, bot_token: str = BOT_TOKEN, auth_date: int | None = None) -> str:
    ts = str(auth_date if auth_date is not None else int(time.time()))
    user_json = json.dumps(user, separators=(",", ":"))
    pairs = {"auth_date": ts, "user": user_json}
    data_check_string = "\n".join(f"{k}={v}" for k, v in sorted(pairs.items()))
    secret_key = hmac.new(b"WebAppData", bot_token.encode(), hashlib.sha256).digest()
    hash_val = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()
    return f"auth_date={ts}&user={user_json}&hash={hash_val}"


@pytest.fixture(autouse=True)
def configure_test_settings(monkeypatch):
    monkeypatch.setattr(settings, "telegram_bot_token", BOT_TOKEN)
    monkeypatch.setattr(settings, "telegram_webapp_secret", BOT_TOKEN)
    monkeypatch.setattr(settings, "supabase_url", "https://test.supabase.co")
    monkeypatch.setattr(settings, "supabase_service_role_key", "test-service-key")


@pytest.fixture
def valid_init_data() -> str:
    return build_init_data(TEST_USER, auth_date=int(time.time()) - 120)


@pytest.fixture
def mock_supabase(monkeypatch):
    """Mock Supabase client with fluent table API."""
    db = MagicMock()
    users_store: dict[int, dict] = {}
    runs_store: list[dict] = []
    cooldowns: dict[int, str] = {}
    sessions: dict[str, dict] = {}

    def table(name: str):
        chain = MagicMock()

        if name == "users":

            def select(*_args, **_kwargs):
                sel = MagicMock()

                def eq(field, value):
                    eq_chain = MagicMock()

                    def maybe_single():
                        ms = MagicMock()

                        def execute():
                            if field == "telegram_id":
                                user = users_store.get(value)
                                if user is None:
                                    return None
                                return MagicMock(data=user)
                            return None

                        ms.execute = execute
                        return ms

                    eq_chain.maybe_single = maybe_single
                    return eq_chain

                sel.eq = eq
                return sel

            def insert(payload):
                ins = MagicMock()

                def execute():
                    row = {**payload, "id": f"user-{payload['telegram_id']}"}
                    users_store[payload["telegram_id"]] = row
                    return MagicMock(data=[row])

                ins.execute = execute
                return ins

            def update(payload):
                upd = MagicMock()

                def eq(field, value):
                    eq_chain = MagicMock()

                    def execute():
                        for tg_id, row in users_store.items():
                            if field == "id" and row.get("id") == value:
                                row.update(payload)
                            if field == "telegram_id" and tg_id == value:
                                row.update(payload)
                        return MagicMock(data=[])

                    eq_chain.execute = execute
                    return eq_chain

                upd.eq = eq
                return upd

            chain.select = select
            chain.insert = insert
            chain.update = update

        elif name == "game_runs":

            def insert(payload):
                ins = MagicMock()

                def execute():
                    runs_store.append(payload)
                    return MagicMock(data=[payload])

                ins.execute = execute
                return ins

            def select(*_args, **_kwargs):
                sel = MagicMock()

                def gte(_field, _value):
                    gte_chain = MagicMock()

                    def order(_field, desc=False):
                        order_chain = MagicMock()

                        def limit(_n):
                            lim = MagicMock()

                            def execute():
                                rows = [
                                    {
                                        "years_survived": r["years_survived"],
                                        "final_rank": r["final_rank"],
                                        "created_at": "2026-05-31T12:00:00+00:00",
                                        "users": {
                                            "username": "testuser",
                                            "first_name": "Test",
                                            "telegram_id": TEST_USER["id"],
                                        },
                                    }
                                    for r in runs_store
                                ]
                                return MagicMock(data=rows)

                            lim.execute = execute
                            return lim

                        order_chain.limit = limit
                        return order_chain

                    gte_chain.order = order
                    return gte_chain

                sel.gte = gte
                return sel

            chain.insert = insert
            chain.select = select

        elif name == "submit_cooldowns":

            def select(*_args, **_kwargs):
                sel = MagicMock()

                def eq(field, value):
                    eq_chain = MagicMock()

                    def maybe_single():
                        ms = MagicMock()

                        def execute():
                            if field == "telegram_id" and value in cooldowns:
                                return MagicMock(
                                    data={"telegram_id": value, "last_submit_at": cooldowns[value]}
                                )
                            return None

                        ms.execute = execute
                        return ms

                    eq_chain.maybe_single = maybe_single
                    return eq_chain

                sel.eq = eq
                return sel

            def insert(payload):
                ins = MagicMock()

                def execute():
                    cooldowns[payload["telegram_id"]] = payload["last_submit_at"]
                    return MagicMock(data=[payload])

                ins.execute = execute
                return ins

            def update(payload):
                upd = MagicMock()

                def eq(field, value):
                    eq_chain = MagicMock()

                    def execute():
                        if field == "telegram_id":
                            cooldowns[value] = payload["last_submit_at"]
                        return MagicMock(data=[])

                    eq_chain.execute = execute
                    return eq_chain

                upd.eq = eq
                return upd

            chain.select = select
            chain.insert = insert
            chain.update = update

        elif name == "api_sessions":

            def insert(payload):
                ins = MagicMock()

                def execute():
                    row = {
                        **payload,
                        "expires_at": payload.get("expires_at")
                        or (datetime.now(timezone.utc) + timedelta(hours=24)).isoformat(),
                    }
                    sessions[payload["token"]] = row
                    return MagicMock(data=[row])

                ins.execute = execute
                return ins

            def select(*_args, **_kwargs):
                sel = MagicMock()

                def eq(field, value):
                    eq_chain = MagicMock()

                    def maybe_single():
                        ms = MagicMock()

                        def execute():
                            if field == "token" and value in sessions:
                                return MagicMock(data=sessions[value])
                            return None

                        ms.execute = execute
                        return ms

                    def execute():
                        if field == "telegram_id":
                            rows = [v for v in sessions.values() if v.get("telegram_id") == value]
                            return MagicMock(data=rows)
                        if field == "token" and value in sessions:
                            return MagicMock(data=[sessions[value]])
                        return MagicMock(data=[])

                    eq_chain.maybe_single = maybe_single
                    eq_chain.execute = execute
                    return eq_chain

                sel.eq = eq
                return sel

            def delete():
                del_chain = MagicMock()

                def lt(field, value):
                    lt_chain = MagicMock()

                    def execute():
                        if field == "expires_at":
                            to_drop = [
                                tok
                                for tok, row in sessions.items()
                                if row.get("expires_at", "") < value
                            ]
                            for tok in to_drop:
                                sessions.pop(tok, None)
                        return MagicMock(data=[])

                    lt_chain.execute = execute
                    return lt_chain

                def eq(field, value):
                    eq_chain = MagicMock()

                    def execute():
                        if field == "token" and value in sessions:
                            sessions.pop(value, None)
                        return MagicMock(data=[])

                    eq_chain.execute = execute
                    return eq_chain

                del_chain.lt = lt
                del_chain.eq = eq
                return del_chain

            chain.insert = insert
            chain.select = select
            chain.delete = delete

        return chain

    db.table = table
    db.sessions_store = sessions

    def get_supabase():
        return db

    monkeypatch.setattr("app.routes._users.get_supabase", get_supabase)
    monkeypatch.setattr("app.routes.runs.get_supabase", get_supabase)
    monkeypatch.setattr("app.routes.leaderboard.get_supabase", get_supabase)
    monkeypatch.setattr("app.auth.session.get_supabase", get_supabase)
    monkeypatch.setattr("app.routes._cooldowns.get_supabase", get_supabase)
    monkeypatch.setattr("app.db.supabase._client", None)

    return db
