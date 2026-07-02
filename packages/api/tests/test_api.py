import time
import uuid
import pytest
from unittest.mock import patch

from fastapi.testclient import TestClient

from app.main import app
from app.routes._plausibility import DEFERRED_GRACE_SECONDS
from tests.conftest import TEST_USER, build_init_data, run_timestamps_for_rungs, runs_payload

client = TestClient(app)


def test_health(mock_supabase):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "db": "ok", "score_schema": "run_duration_ms_v1"}


def test_health_db_unavailable_returns_503(monkeypatch):
    def _raise_db():
        raise RuntimeError("db down")

    monkeypatch.setattr("app.main.get_supabase", _raise_db)
    monkeypatch.setattr("app.db.supabase._client", None)
    response = client.get("/health")
    assert response.status_code == 503
    assert response.json()["db"] == "unavailable"


def test_leaderboard_daily(mock_supabase):
    response = client.get("/leaderboard?period=daily")
    assert response.status_code == 200
    data = response.json()
    assert data["period"] == "daily"
    assert data["entries"] == []


def test_leaderboard_weekly(mock_supabase):
    response = client.get("/leaderboard?period=weekly")
    assert response.status_code == 200
    data = response.json()
    assert data["period"] == "weekly"
    assert isinstance(data["entries"], list)


def test_auth_me_valid(mock_supabase, valid_init_data):
    response = client.post("/auth/me", json={"initData": valid_init_data})
    assert response.status_code == 200
    data = response.json()
    assert data["telegram_id"] == TEST_USER["id"]
    assert data["username"] == TEST_USER["username"]
    assert data["best_score"] == 0
    assert data["best_rank"] == "Intern"
    assert data["session_token"]


def test_auth_me_invalid_hash():
    response = client.post("/auth/me", json={"initData": "auth_date=1&user={}&hash=bad"})
    assert response.status_code == 401


def test_runs_valid(mock_supabase, valid_init_data):
    response = client.post(
        "/runs",
        json=runs_payload(
            valid_init_data,
            years_survived=5,
            final_rank="Intern",
            rungs_climbed=20,
            termination_cause="Meeting collision",
        ),
    )
    assert response.status_code == 200
    data = response.json()
    assert data["ok"] is True
    assert data["years_survived"] == 5
    assert data["best_score"] == 5
    assert data["best_rank"] == "Intern"
    assert "submit_run_atomic" in mock_supabase.rpc_calls


def test_runs_idempotent_client_run_id(mock_supabase, valid_init_data):
    mock_supabase.cooldowns_store.clear()
    run_id = "22222222-2222-4222-8222-222222222222"
    payload = runs_payload(
        valid_init_data,
        years_survived=4,
        final_rank="Intern",
        rungs_climbed=16,
        client_run_id=run_id,
    )
    first = client.post("/runs", json=payload)
    second = client.post("/runs", json=payload)
    assert first.status_code == 200
    assert second.status_code == 200
    assert len(mock_supabase.runs_store) == 1
    assert first.json()["best_score"] == second.json()["best_score"]


def test_runs_rung_mismatch(mock_supabase, valid_init_data):
    mock_supabase.cooldowns_store.clear()
    response = client.post(
        "/runs",
        json=runs_payload(
            valid_init_data,
            years_survived=5,
            final_rank="Intern",
            rungs_climbed=99,
        ),
    )
    assert response.status_code == 400
    assert "inconsistent" in response.json()["detail"].lower()


def test_runs_rate_limit(mock_supabase, valid_init_data):
    mock_supabase.cooldowns_store.clear()
    first = client.post(
        "/runs",
        json=runs_payload(
            valid_init_data,
            years_survived=3,
            final_rank="Intern",
            rungs_climbed=12,
        ),
    )
    assert first.status_code == 200
    second = client.post(
        "/runs",
        json=runs_payload(
            valid_init_data,
            years_survived=3,
            final_rank="Intern",
            rungs_climbed=12,
            client_run_id=str(uuid.uuid4()),
        ),
    )
    assert second.status_code == 429


def test_runs_invalid_init_data():
    started, ended = run_timestamps_for_rungs(4)
    response = client.post(
        "/runs",
        json={
            "initData": "auth_date=1&user={}&hash=bad",
            "years_survived": 1,
            "final_rank": "Intern",
            "rungs_climbed": 4,
            "run_started_at": started,
            "run_ended_at": ended,
            "run_duration_ms": (ended - started) * 1000,
            "client_run_id": str(uuid.uuid4()),
        },
    )
    assert response.status_code == 401


def test_runs_invalid_final_rank(mock_supabase, valid_init_data):
    mock_supabase.cooldowns_store.clear()
    response = client.post(
        "/runs",
        json=runs_payload(
            valid_init_data,
            years_survived=25,
            final_rank="VP",
            rungs_climbed=100,
        ),
    )
    assert response.status_code == 200


def test_runs_rate_limit_allows_higher_score(mock_supabase, valid_init_data):
    mock_supabase.cooldowns_store.clear()
    auth_date = int(time.time()) - 120
    init_data = build_init_data(TEST_USER, auth_date=auth_date)
    low = client.post(
        "/runs",
        json=runs_payload(
            init_data,
            years_survived=3,
            final_rank="Intern",
            rungs_climbed=12,
            auth_date=auth_date,
        ),
    )
    high = client.post(
        "/runs",
        json=runs_payload(
            init_data,
            years_survived=25,
            final_rank="Manager",
            rungs_climbed=100,
            auth_date=auth_date,
        ),
    )
    assert low.status_code == 200
    assert high.status_code == 200


def test_runs_validation_error_does_not_rate_limit(mock_supabase, valid_init_data):
    mock_supabase.cooldowns_store.clear()
    bad = client.post(
        "/runs",
        json=runs_payload(
            valid_init_data,
            years_survived=5,
            final_rank="Intern",
            rungs_climbed=99,
        ),
    )
    assert bad.status_code == 400
    good = client.post(
        "/runs",
        json=runs_payload(
            valid_init_data,
            years_survived=5,
            final_rank="Intern",
            rungs_climbed=20,
            termination_cause="Meeting collision",
        ),
    )
    assert good.status_code == 200


def test_runs_rejects_implausible_score(mock_supabase, valid_init_data, monkeypatch):
    """A sprint run with too many rungs for its duration must still be rejected (anti-cheat)."""
    mock_supabase.cooldowns_store.clear()
    monkeypatch.setattr("app.routes._plausibility.today_preset_id", lambda: "synergy_sprint")
    auth_date = int(time.time()) - 120
    init_data = build_init_data(TEST_USER, auth_date=auth_date)
    now = int(time.time())
    response = client.post(
        "/runs",
        json=runs_payload(
            init_data,
            years_survived=50,
            final_rank="Board Member",
            rungs_climbed=200,
            auth_date=auth_date,
            run_started_at=now - 3,
            run_ended_at=now,
            run_duration_ms=3_000,
            sprint_mode=True,
        ),
    )
    assert response.status_code == 400
    detail = response.json()["detail"].lower()
    assert "minimum run duration" in detail or "run duration plausibility" in detail


def test_runs_accepts_high_sprint_score(mock_supabase, valid_init_data, monkeypatch):
    """Kristupas's 61.8y Board Member sprint run must now be accepted (no 25y cap)."""
    mock_supabase.cooldowns_store.clear()
    monkeypatch.setattr("app.routes._plausibility.today_preset_id", lambda: "synergy_sprint")
    auth_date = int(time.time()) - 120
    init_data = build_init_data(TEST_USER, auth_date=auth_date)
    now = int(time.time())
    response = client.post(
        "/runs",
        json=runs_payload(
            init_data,
            years_survived=61.8,
            final_rank="Board Member",
            rungs_climbed=247,
            auth_date=auth_date,
            termination_cause="Reorganization",
            run_started_at=now - 52,
            run_ended_at=now,
            run_duration_ms=50_000,
            sprint_mode=True,
        ),
    )
    assert response.status_code == 200


def test_runs_accepts_board_member_run(mock_supabase, valid_init_data):
    mock_supabase.cooldowns_store.clear()
    auth_date = int(time.time()) - 3600
    init_data = build_init_data(TEST_USER, auth_date=auth_date)
    response = client.post(
        "/runs",
        json=runs_payload(
            init_data,
            years_survived=58.5,
            final_rank="Board Member",
            rungs_climbed=234,
            auth_date=auth_date,
            termination_cause="Reorganization",
        ),
    )
    assert response.status_code == 200


def test_runs_rejects_idle_auth_date_forge(mock_supabase, valid_init_data):
    mock_supabase.cooldowns_store.clear()
    auth_date = int(time.time()) - 3600
    init_data = build_init_data(TEST_USER, auth_date=auth_date)
    now = int(time.time())
    response = client.post(
        "/runs",
        json=runs_payload(
            init_data,
            years_survived=99.9,
            final_rank="Angel Investor",
            rungs_climbed=400,
            auth_date=auth_date,
            termination_cause="Reorganization",
            run_started_at=now - 10,
            run_ended_at=now,
            run_duration_ms=10_000,
        ),
    )
    assert response.status_code == 400
    detail = response.json()["detail"].lower()
    assert "minimum run duration" in detail or "run duration plausibility" in detail


def test_runs_rejects_run_started_before_auth_date(mock_supabase, valid_init_data):
    mock_supabase.cooldowns_store.clear()
    auth_date = int(time.time()) - 60
    init_data = build_init_data(TEST_USER, auth_date=auth_date)
    response = client.post(
        "/runs",
        json=runs_payload(
            init_data,
            years_survived=5,
            final_rank="Intern",
            rungs_climbed=20,
            auth_date=auth_date,
            run_started_at=auth_date - DEFERRED_GRACE_SECONDS - 120,
            run_ended_at=int(time.time()),
            run_duration_ms=60_000,
        ),
    )
    assert response.status_code == 400
    assert "session open" in response.json()["detail"].lower()


def test_runs_accepts_deferred_resubmit_within_grace(mock_supabase, valid_init_data):
    """A run from a prior session (app reopened -> new auth_date) is auto-resubmitted
    after /auth/me; the deferred-submit grace window must accept it."""
    mock_supabase.cooldowns_store.clear()
    auth_date = int(time.time())  # fresh session after reopen
    init_data = build_init_data(TEST_USER, auth_date=auth_date)
    run_started_at = auth_date - 3600  # ran ~1h before reopening, within 26h grace
    run_ended_at = run_started_at + 60
    response = client.post(
        "/runs",
        json={
            "initData": init_data,
            "years_survived": 22.0,
            "final_rank": "Director",
            "termination_cause": "Reorganization",
            "rungs_climbed": 88,
            "run_started_at": run_started_at,
            "run_ended_at": run_ended_at,
            "run_duration_ms": 60_000,
            "client_run_id": str(uuid.uuid4()),
        },
    )
    assert response.status_code == 200
    assert response.json()["years_survived"] == 22.0


def test_runs_rejects_impossible_tap_rate(mock_supabase, valid_init_data):
    mock_supabase.cooldowns_store.clear()
    auth_date = int(time.time()) - 120
    init_data = build_init_data(TEST_USER, auth_date=auth_date)
    now = int(time.time())
    response = client.post(
        "/runs",
        json=runs_payload(
            init_data,
            years_survived=50,
            final_rank="Board Member",
            rungs_climbed=200,
            auth_date=auth_date,
            run_started_at=now - 5,
            run_ended_at=now,
            run_duration_ms=5_000,
        ),
    )
    assert response.status_code == 400
    detail = response.json()["detail"].lower()
    assert "minimum run duration" in detail or "run duration plausibility" in detail


def test_runs_rejects_duration_inconsistent_with_timestamps(mock_supabase, valid_init_data):
    """Forged long ms duration inside a short unix-second window must be rejected."""
    mock_supabase.cooldowns_store.clear()
    auth_date = int(time.time()) - 120
    init_data = build_init_data(TEST_USER, auth_date=auth_date)
    now = int(time.time())
    response = client.post(
        "/runs",
        json=runs_payload(
            init_data,
            years_survived=12.0,
            final_rank="Manager",
            rungs_climbed=48,
            auth_date=auth_date,
            run_started_at=now - 5,
            run_ended_at=now,
            run_duration_ms=60_000,
        ),
    )
    assert response.status_code == 400
    assert "inconsistent" in response.json()["detail"].lower()


def test_runs_requires_run_duration_ms(mock_supabase, valid_init_data):
    """run_duration_ms is required — missing field is a 422 schema error."""
    mock_supabase.cooldowns_store.clear()
    auth_date = int(time.time()) - 120
    init_data = build_init_data(TEST_USER, auth_date=auth_date)
    now = int(time.time())
    response = client.post(
        "/runs",
        json={
            "initData": init_data,
            "years_survived": 18.0,
            "final_rank": "Manager",
            "rungs_climbed": 72,
            "run_started_at": now - 9,
            "run_ended_at": now,
            "client_run_id": str(uuid.uuid4()),
        },
    )
    assert response.status_code == 422


def test_runs_accepts_fast_legal_manager_run(mock_supabase, valid_init_data):
    """120ms tap floor allows ~8.3 rungs/s — must not reject a paced Manager run."""
    mock_supabase.cooldowns_store.clear()
    auth_date = int(time.time()) - 120
    init_data = build_init_data(TEST_USER, auth_date=auth_date)
    rungs = 72  # 18.0y Manager
    now = int(time.time())
    response = client.post(
        "/runs",
        json={
            "initData": init_data,
            "years_survived": 18.0,
            "final_rank": "Manager",
            "termination_cause": "Reorganization",
            "rungs_climbed": rungs,
            "run_started_at": now - 9,
            "run_ended_at": now,
            "run_duration_ms": rungs * 120,  # honest ~8.6s play time
            "client_run_id": str(uuid.uuid4()),
        },
    )
    assert response.status_code == 200


def test_runs_accepts_fast_run_with_tight_second_window(mock_supabase, valid_init_data):
    """True ms duration (8.6s) passes even when the unix-second window quantizes to 7s.

    Reproduces the production false-reject: 72 rungs whose floor/ceil second window
    understates real play time; the ms-based check must accept it.
    """
    mock_supabase.cooldowns_store.clear()
    auth_date = int(time.time()) - 120
    init_data = build_init_data(TEST_USER, auth_date=auth_date)
    rungs = 72
    now = int(time.time())
    response = client.post(
        "/runs",
        json={
            "initData": init_data,
            "years_survived": 18.0,
            "final_rank": "Manager",
            "termination_cause": "Reorganization",
            "rungs_climbed": rungs,
            "run_started_at": now - 7,
            "run_ended_at": now,
            "run_duration_ms": rungs * 120,  # 8640ms real time inside a 7s window
            "client_run_id": str(uuid.uuid4()),
        },
    )
    assert response.status_code == 200


def test_runs_accepts_fast_director_run(mock_supabase, valid_init_data):
    """103 rungs / 25.8y Director run with honest ms duration must pass (prod 25.8y case)."""
    mock_supabase.cooldowns_store.clear()
    auth_date = int(time.time()) - 120
    init_data = build_init_data(TEST_USER, auth_date=auth_date)
    rungs = 103
    now = int(time.time())
    response = client.post(
        "/runs",
        json={
            "initData": init_data,
            "years_survived": 25.8,
            "final_rank": "Director",
            "termination_cause": "Reorganization",
            "rungs_climbed": rungs,
            "run_started_at": now - 12,
            "run_ended_at": now,
            "run_duration_ms": rungs * 120,  # ~12.4s
            "client_run_id": str(uuid.uuid4()),
        },
    )
    assert response.status_code == 200


def test_runs_accepts_angel_investor_run(mock_supabase, valid_init_data):
    mock_supabase.cooldowns_store.clear()
    auth_date = int(time.time()) - 3600
    init_data = build_init_data(TEST_USER, auth_date=auth_date)
    response = client.post(
        "/runs",
        json=runs_payload(
            init_data,
            years_survived=99.9,
            final_rank="Angel Investor",
            rungs_climbed=400,
            auth_date=auth_date,
            termination_cause="Reorganization",
        ),
    )
    assert response.status_code == 200


def test_rank_band_boundaries(mock_supabase, valid_init_data):
    mock_supabase.cooldowns_store.clear()
    auth_date = int(time.time()) - 3600
    init_data = build_init_data(TEST_USER, auth_date=auth_date)
    cases = [
        (49.9, "CEO", 200),
        (50.0, "Board Member", 200),
        (74.9, "Board Member", 300),
        (75.0, "Angel Investor", 300),
    ]
    for years, rank, rungs in cases:
        mock_supabase.cooldowns_store.clear()
        response = client.post(
            "/runs",
            json=runs_payload(
                init_data,
                years_survived=years,
                final_rank=rank,
                rungs_climbed=rungs,
                auth_date=auth_date,
                termination_cause="Reorganization",
            ),
        )
        assert response.status_code == 200, (years, rank, response.json())


def test_runs_normalizes_board_member_from_years(mock_supabase, valid_init_data):
    mock_supabase.cooldowns_store.clear()
    auth_date = int(time.time()) - 3600
    init_data = build_init_data(TEST_USER, auth_date=auth_date)
    response = client.post(
        "/runs",
        json=runs_payload(
            init_data,
            years_survived=58.5,
            final_rank="CEO",
            rungs_climbed=234,
            auth_date=auth_date,
            termination_cause="Reorganization",
        ),
    )
    assert response.status_code == 200


def test_runs_accepts_legitimate_manager_run(mock_supabase, valid_init_data):
    mock_supabase.cooldowns_store.clear()
    auth_date = int(time.time()) - 120
    init_data = build_init_data(TEST_USER, auth_date=auth_date)
    response = client.post(
        "/runs",
        json=runs_payload(
            init_data,
            years_survived=15,
            final_rank="Manager",
            rungs_climbed=60,
            auth_date=auth_date,
            termination_cause="Meeting collision",
        ),
    )
    assert response.status_code == 200


def test_runs_normalizes_stale_manager_rank(mock_supabase, valid_init_data):
    mock_supabase.cooldowns_store.clear()
    auth_date = int(time.time()) - 120
    init_data = build_init_data(TEST_USER, auth_date=auth_date)
    response = client.post(
        "/runs",
        json=runs_payload(
            init_data,
            years_survived=25,
            final_rank="Manager",
            rungs_climbed=100,
            auth_date=auth_date,
            termination_cause="Reorganization",
        ),
    )
    assert response.status_code == 200


def test_runs_accepts_legitimate_director_run(mock_supabase, valid_init_data):
    mock_supabase.cooldowns_store.clear()
    auth_date = int(time.time()) - 120
    init_data = build_init_data(TEST_USER, auth_date=auth_date)
    response = client.post(
        "/runs",
        json=runs_payload(
            init_data,
            years_survived=25,
            final_rank="Director",
            rungs_climbed=100,
            auth_date=auth_date,
            termination_cause="Deadline Crash",
        ),
    )
    assert response.status_code == 200


def test_runs_normalizes_stale_director_rank(mock_supabase, valid_init_data):
    mock_supabase.cooldowns_store.clear()
    auth_date = int(time.time()) - 120
    init_data = build_init_data(TEST_USER, auth_date=auth_date)
    response = client.post(
        "/runs",
        json=runs_payload(
            init_data,
            years_survived=15,
            final_rank="Director",
            rungs_climbed=60,
            auth_date=auth_date,
            termination_cause="Reorganization",
        ),
    )
    assert response.status_code == 200


def test_runs_normalizes_ceo_band_from_years(mock_supabase, valid_init_data):
    mock_supabase.cooldowns_store.clear()
    auth_date = int(time.time()) - 240
    init_data = build_init_data(TEST_USER, auth_date=auth_date)
    response = client.post(
        "/runs",
        json=runs_payload(
            init_data,
            years_survived=36,
            final_rank="Director",
            rungs_climbed=144,
            auth_date=auth_date,
            termination_cause="Reorganization",
        ),
    )
    assert response.status_code == 200


def test_leaderboard_me_highlights_user(mock_supabase, valid_init_data):
    mock_supabase.cooldowns_store.clear()
    auth = client.post("/auth/me", json={"initData": valid_init_data})
    token = auth.json()["session_token"]
    client.post(
        "/runs",
        json=runs_payload(
            valid_init_data,
            years_survived=5,
            final_rank="Intern",
            rungs_climbed=20,
            termination_cause="Meeting collision",
        ),
    )
    lb = client.get("/leaderboard?period=daily")
    assert all(not e["is_current_user"] for e in lb.json()["entries"])
    me = client.post("/leaderboard/me", json={"sessionToken": token, "period": "daily"})
    assert me.status_code == 200
    data = me.json()
    assert data["on_board"] is True
    assert data["rank"] == 1
    assert data["years_survived"] == 5


def test_leaderboard_me_invalid_token(mock_supabase):
    response = client.post(
        "/leaderboard/me",
        json={"sessionToken": "bad-token", "period": "daily"},
    )
    assert response.status_code == 401


def test_runs_sprint_mode_required_on_sprint_day(mock_supabase, valid_init_data, monkeypatch):
    mock_supabase.cooldowns_store.clear()
    monkeypatch.setattr("app.routes._plausibility.today_preset_id", lambda: "synergy_sprint")
    response = client.post(
        "/runs",
        json=runs_payload(
            valid_init_data,
            years_survived=5,
            final_rank="Intern",
            rungs_climbed=20,
            sprint_mode=False,
        ),
    )
    assert response.status_code == 400
    assert "sprint_mode required" in response.json()["detail"].lower()


def test_runs_sprint_mode_rejected_on_non_sprint_day(mock_supabase, valid_init_data, monkeypatch):
    mock_supabase.cooldowns_store.clear()
    monkeypatch.setattr("app.routes._plausibility.today_preset_id", lambda: "standard")
    response = client.post(
        "/runs",
        json=runs_payload(
            valid_init_data,
            years_survived=5,
            final_rank="Intern",
            rungs_climbed=20,
            sprint_mode=True,
        ),
    )
    assert response.status_code == 400
    assert "sprint_mode invalid" in response.json()["detail"].lower()


def test_runs_accepts_sprint_mode_on_sprint_day(mock_supabase, valid_init_data, monkeypatch):
    mock_supabase.cooldowns_store.clear()
    monkeypatch.setattr("app.routes._plausibility.today_preset_id", lambda: "synergy_sprint")
    auth_date = int(time.time()) - 120
    init_data = build_init_data(TEST_USER, auth_date=auth_date)
    response = client.post(
        "/runs",
        json=runs_payload(
            init_data,
            years_survived=5,
            final_rank="Intern",
            rungs_climbed=20,
            auth_date=auth_date,
            termination_cause="Sprint standdown",
            sprint_mode=True,
        ),
    )
    assert response.status_code == 200


def test_runs_cooldown_db_unavailable_returns_503(mock_supabase, valid_init_data):
    mock_supabase.cooldowns_store.clear()
    from fastapi import HTTPException

    with patch(
        "app.routes.runs.atomic_submit_run",
        side_effect=HTTPException(status_code=503, detail="Submit temporarily unavailable"),
    ):
        response = client.post(
            "/runs",
            json=runs_payload(
                valid_init_data,
                years_survived=2,
                final_rank="Intern",
                rungs_climbed=8,
            ),
        )
    assert response.status_code == 503


def test_create_session_prunes_old_tokens(mock_supabase):
    from app.auth.session import create_session

    tg_id = TEST_USER["id"]
    for _ in range(5):
        create_session(tg_id)
    assert len(mock_supabase.sessions_store) <= 3


def test_first_row_helper():
    from unittest.mock import MagicMock

    from app.db.postgrest_helpers import first_row

    assert first_row(MagicMock(data=[])) is None
    assert first_row(MagicMock(data=None)) is None
    assert first_row(MagicMock(data=[{"telegram_id": 1}])) == {"telegram_id": 1}
    assert first_row(MagicMock(data={"telegram_id": 2})) == {"telegram_id": 2}


def test_runs_persists_submit_cooldown_row(mock_supabase, valid_init_data):
    mock_supabase.cooldowns_store.clear()
    payload = runs_payload(
        valid_init_data,
        years_survived=2,
        final_rank="Intern",
        rungs_climbed=8,
    )
    response = client.post("/runs", json=payload)
    assert response.status_code == 200
    assert TEST_USER["id"] in mock_supabase.cooldowns_store


def test_runs_cooldown_persist_failure_returns_503(mock_supabase, valid_init_data, monkeypatch):
    mock_supabase.cooldowns_store.clear()
    payload = runs_payload(
        valid_init_data,
        years_survived=3,
        final_rank="Intern",
        rungs_climbed=12,
    )

    from app.routes._submit_atomic import RpcUnavailableError

    def fail_record(_telegram_id: int) -> None:
        raise RuntimeError("cooldown write failed")

    with patch("app.routes.runs.atomic_submit_run", side_effect=RpcUnavailableError()):
        monkeypatch.setattr("app.routes._cooldowns.record_submit_cooldown", fail_record)
        response = client.post("/runs", json=payload)
    assert response.status_code == 503
    assert len(mock_supabase.runs_store) == 0


def test_runs_weaker_score_does_not_lower_best_score(mock_supabase, valid_init_data):
    mock_supabase.cooldowns_store.clear()
    high = runs_payload(
        valid_init_data,
        years_survived=20,
        final_rank="Director",
        rungs_climbed=80,
    )
    assert client.post("/runs", json=high).status_code == 200
    mock_supabase.cooldowns_store.clear()

    low = runs_payload(
        valid_init_data,
        years_survived=10,
        final_rank="Manager",
        rungs_climbed=40,
    )
    response = client.post("/runs", json=low)
    assert response.status_code == 200
    assert response.json()["best_score"] == 20


def test_leaderboard_uses_rpc_path(mock_supabase, valid_init_data):
    mock_supabase.cooldowns_store.clear()
    mock_supabase.rpc_calls.clear()
    payload = runs_payload(
        valid_init_data,
        years_survived=12,
        final_rank="Manager",
        rungs_climbed=48,
    )
    assert client.post("/runs", json=payload).status_code == 200

    response = client.get("/leaderboard?period=daily")
    assert response.status_code == 200
    assert "leaderboard_best_runs" in mock_supabase.rpc_calls
    entries = response.json()["entries"]
    assert len(entries) == 1
    assert entries[0]["years_survived"] == 12


def test_runs_missing_fields_returns_422(mock_supabase):
    response = client.post("/runs", json={"initData": "not-valid"})
    assert response.status_code == 422

def test_atomic_submit_run_missing_rpc_raises_rpc_unavailable(monkeypatch):
    from uuid import uuid4

    from app.routes import _submit_atomic
    from app.routes._submit_atomic import RpcUnavailableError

    class MissingRpc:
        def execute(self):
            raise RuntimeError("function submit_run_atomic not found")

    class MissingDb:
        def rpc(self, *_args, **_kwargs):
            return MissingRpc()

    monkeypatch.setattr(_submit_atomic, "get_supabase", lambda: MissingDb())

    with pytest.raises(RpcUnavailableError):
        _submit_atomic.atomic_submit_run(
            telegram_id=123,
            username="tester",
            first_name="Test",
            client_run_id=uuid4(),
            years_survived=3.0,
            final_rank="Intern",
            termination_cause=None,
            rungs_climbed=12,
        )


def test_atomic_submit_run_generic_rpc_failure_returns_503(monkeypatch):
    from uuid import uuid4

    from fastapi import HTTPException

    from app.routes import _submit_atomic
    from app.routes._submit_atomic import RpcUnavailableError

    class FailingRpc:
        def execute(self):
            raise RuntimeError("connection timeout")

    class FailingDb:
        def rpc(self, *_args, **_kwargs):
            return FailingRpc()

    monkeypatch.setattr(_submit_atomic, "get_supabase", lambda: FailingDb())

    with pytest.raises(HTTPException) as exc_info:
        _submit_atomic.atomic_submit_run(
            telegram_id=123,
            username="tester",
            first_name="Test",
            client_run_id=uuid4(),
            years_survived=3.0,
            final_rank="Intern",
            termination_cause=None,
            rungs_climbed=12,
        )

    assert not isinstance(exc_info.value, RpcUnavailableError)
    assert exc_info.value.status_code == 503
    assert exc_info.value.detail == "Submit temporarily unavailable"

