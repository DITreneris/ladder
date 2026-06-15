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


def run_timestamps_for_rungs(rungs: int, auth_date: int | None = None) -> tuple[int, int]:
    """Build plausible run_started_at/run_ended_at (unix seconds) for test payloads."""
    now = int(time.time())
    min_elapsed = max(1, int(rungs * 0.12 * 0.85))
    max_rungs_per_second = 1.0 / 0.12
    run_elapsed = max(min_elapsed, int(rungs / max_rungs_per_second) + 1)
    run_ended_at = now
    run_started_at = run_ended_at - run_elapsed
    if auth_date is not None and run_started_at < auth_date:
        run_started_at = auth_date
        run_ended_at = max(run_started_at + min_elapsed, run_ended_at)
    return run_started_at, run_ended_at


def runs_payload(
    init_data: str,
    *,
    years_survived: float,
    final_rank: str,
    rungs_climbed: int,
    auth_date: int | None = None,
    **extra,
) -> dict:
    """Standard /runs JSON body with plausible run timestamps."""
    if auth_date is None:
        auth_date = int(time.time()) - 120
    started, ended = run_timestamps_for_rungs(rungs_climbed, auth_date=auth_date)
    payload = {
        "initData": init_data,
        "years_survived": years_survived,
        "final_rank": final_rank,
        "rungs_climbed": rungs_climbed,
        "run_started_at": started,
        "run_ended_at": ended,
        "run_duration_ms": (ended - started) * 1000,
        **extra,
    }
    return payload


from app.main import app


@pytest.fixture(autouse=True)
def reset_rate_limit_storage():
    """Clear in-memory SlowAPI counters so TestClient IP doesn't exhaust /runs cap."""
    storage = getattr(app.state.limiter, "_storage", None)
    if storage is not None and hasattr(storage, "storage") and hasattr(storage.storage, "clear"):
        storage.storage.clear()
    yield
    if storage is not None and hasattr(storage, "storage") and hasattr(storage.storage, "clear"):
        storage.storage.clear()


@pytest.fixture(autouse=True)
def configure_test_settings(monkeypatch):
    monkeypatch.setattr(settings, "telegram_bot_token", BOT_TOKEN)
    monkeypatch.setattr(settings, "telegram_webapp_secret", BOT_TOKEN)
    monkeypatch.setattr(settings, "supabase_url", "https://test.supabase.co")
    monkeypatch.setattr(settings, "supabase_service_role_key", "test-service-key")


@pytest.fixture(autouse=True)
def standard_daily_preset(monkeypatch):
    """Most run submits assume a non-sprint shift unless a test overrides the preset."""
    monkeypatch.setattr("app.routes._plausibility.today_preset_id", lambda: "standard")


@pytest.fixture
def valid_init_data() -> str:
    return build_init_data(TEST_USER, auth_date=int(time.time()) - 120)


@pytest.fixture(autouse=True)
def clear_leaderboard_cache():
    from app.routes import leaderboard as lb_module

    lb_module._lb_cache.clear()
    yield
    lb_module._lb_cache.clear()


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

                    def limit(_n):
                        lim = MagicMock()

                        def execute():
                            if field == "telegram_id":
                                user = users_store.get(value)
                                return MagicMock(data=[user] if user else [])
                            if field == "id":
                                user = next(
                                    (u for u in users_store.values() if u.get("id") == value),
                                    None,
                                )
                                return MagicMock(data=[user] if user else [])
                            return MagicMock(data=[])

                        lim.execute = execute
                        return lim

                    eq_chain.maybe_single = maybe_single
                    eq_chain.limit = limit
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

                    def lt(field2, value2):
                        lt_chain = MagicMock()

                        def execute():
                            for tg_id, row in users_store.items():
                                if field == "id" and row.get("id") == value:
                                    if field2 == "best_score" and float(row.get("best_score", 0)) >= value2:
                                        continue
                                    row.update(payload)
                                if field == "telegram_id" and tg_id == value:
                                    if field2 == "best_score" and float(row.get("best_score", 0)) >= value2:
                                        continue
                                    row.update(payload)
                            return MagicMock(data=[])

                        lt_chain.execute = execute
                        return lt_chain

                    def execute():
                        for tg_id, row in users_store.items():
                            if field == "id" and row.get("id") == value:
                                row.update(payload)
                            if field == "telegram_id" and tg_id == value:
                                row.update(payload)
                        return MagicMock(data=[])

                    eq_chain.lt = lt
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
                    row = {**payload, "id": f"run-{len(runs_store)}"}
                    runs_store.append(row)
                    return MagicMock(data=[row])

                ins.execute = execute
                return ins

            def delete():
                del_chain = MagicMock()

                def eq(field, value):
                    eq_chain = MagicMock()

                    def execute():
                        if field == "id":
                            runs_store[:] = [r for r in runs_store if r.get("id") != value]
                        return MagicMock(data=[])

                    eq_chain.execute = execute
                    return eq_chain

                del_chain.eq = eq
                return del_chain

            def select(*_args, **_kwargs):
                sel = MagicMock()

                def eq(_field, _value):
                    eq_chain = MagicMock()

                    def gte(_field2, _value2):
                        gte_chain = MagicMock()

                        def order(_field3, desc=False):
                            order_chain = MagicMock()

                            def limit(_n):
                                lim = MagicMock()

                                def execute():
                                    rows = [
                                        {
                                            "years_survived": r["years_survived"],
                                            "final_rank": r.get("final_rank", "Intern"),
                                            "created_at": "2026-05-31T12:00:00+00:00",
                                        }
                                        for r in runs_store
                                        if _field == "user_id" and r.get("user_id") == _value
                                    ]
                                    if desc and rows:
                                        rows = [rows[-1]]
                                    return MagicMock(data=rows)

                                lim.execute = execute
                                return lim

                            order_chain.limit = limit
                            return order_chain

                        gte_chain.order = order
                        return gte_chain

                    eq_chain.gte = gte
                    return eq_chain

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

                sel.eq = eq
                sel.gte = gte
                return sel

            chain.insert = insert
            chain.select = select
            chain.delete = delete

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

                    def limit(_n):
                        lim = MagicMock()

                        def execute():
                            if field == "telegram_id" and value in cooldowns:
                                return MagicMock(
                                    data=[
                                        {
                                            "telegram_id": value,
                                            "last_submit_at": cooldowns[value],
                                        }
                                    ]
                                )
                            return MagicMock(data=[])

                        lim.execute = execute
                        return lim

                    eq_chain.maybe_single = maybe_single
                    eq_chain.limit = limit
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

                    def limit(_n):
                        lim = MagicMock()

                        def execute():
                            if field == "token" and value in sessions:
                                return MagicMock(data=[sessions[value]])
                            return MagicMock(data=[])

                        lim.execute = execute
                        return lim

                    def execute():
                        if field == "telegram_id":
                            rows = [v for v in sessions.values() if v.get("telegram_id") == value]
                            return MagicMock(data=rows)
                        if field == "token" and value in sessions:
                            return MagicMock(data=[sessions[value]])
                        return MagicMock(data=[])

                    eq_chain.maybe_single = maybe_single
                    eq_chain.limit = limit
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
    db.cooldowns_store = cooldowns
    db.runs_store = runs_store
    db.users_store = users_store
    db.rpc_calls: list[str] = []

    def rpc(name: str, params: dict | None = None):
        db.rpc_calls.append(name)
        rpc_chain = MagicMock()

        def execute():
            if name == "leaderboard_best_runs":
                rows: list[dict] = []
                by_user: dict[int, dict] = {}
                for run in runs_store:
                    user_id = run.get("user_id")
                    user_row = next(
                        (u for u in users_store.values() if u.get("id") == user_id),
                        None,
                    )
                    if not user_row:
                        continue
                    tg_id = user_row["telegram_id"]
                    score = float(run["years_survived"])
                    if tg_id not in by_user or score > by_user[tg_id]["years_survived"]:
                        by_user[tg_id] = {
                            "telegram_id": tg_id,
                            "username": user_row.get("username") or user_row.get("first_name") or "Employee",
                            "first_name": user_row.get("first_name"),
                            "years_survived": score,
                            "final_rank": run.get("final_rank", "Intern"),
                        }
                rows = list(by_user.values())
                return MagicMock(data=rows)
            return MagicMock(data=[])

        rpc_chain.execute = execute
        return rpc_chain

    db.rpc = rpc

    def get_supabase():
        return db

    monkeypatch.setattr("app.routes._users.get_supabase", get_supabase)
    monkeypatch.setattr("app.routes.runs.get_supabase", get_supabase)
    monkeypatch.setattr("app.routes.leaderboard.get_supabase", get_supabase)
    monkeypatch.setattr("app.auth.session.get_supabase", get_supabase)
    monkeypatch.setattr("app.routes._cooldowns.get_supabase", get_supabase)
    monkeypatch.setattr("app.main.get_supabase", get_supabase)
    monkeypatch.setattr("app.db.supabase._client", None)

    return db
