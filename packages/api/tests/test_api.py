from fastapi.testclient import TestClient

from app.main import app
from app.routes import runs as runs_module
from tests.conftest import TEST_USER, build_init_data

client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


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
        json={
            "initData": valid_init_data,
            "years_survived": 5,
            "final_rank": "Intern",
            "termination_cause": "Meeting collision",
            "rungs_climbed": 20,
        },
    )
    assert response.status_code == 200
    assert response.json() == {"ok": True, "years_survived": 5}


def test_runs_rung_mismatch(mock_supabase, valid_init_data):
    runs_module._submit_timestamps.clear()
    response = client.post(
        "/runs",
        json={
            "initData": valid_init_data,
            "years_survived": 5,
            "final_rank": "Intern",
            "rungs_climbed": 99,
        },
    )
    assert response.status_code == 400
    assert "inconsistent" in response.json()["detail"].lower()


def test_runs_rate_limit(mock_supabase, valid_init_data):
    payload = {
        "initData": valid_init_data,
        "years_survived": 3,
        "final_rank": "Intern",
        "rungs_climbed": 12,
    }
    runs_module._submit_timestamps.clear()
    first = client.post("/runs", json=payload)
    assert first.status_code == 200
    second = client.post("/runs", json=payload)
    assert second.status_code == 429


def test_runs_invalid_init_data():
    runs_module._submit_timestamps.clear()
    response = client.post(
        "/runs",
        json={
            "initData": "auth_date=1&user={}&hash=bad",
            "years_survived": 1,
            "final_rank": "Intern",
            "rungs_climbed": 4,
        },
    )
    assert response.status_code == 401


def test_runs_invalid_final_rank(mock_supabase, valid_init_data):
    """Unknown client rank is normalized from years (no 422)."""
    runs_module._submit_timestamps.clear()
    response = client.post(
        "/runs",
        json={
            "initData": valid_init_data,
            "years_survived": 25,
            "final_rank": "VP",
            "rungs_climbed": 100,
        },
    )
    assert response.status_code == 200


def test_runs_rate_limit_allows_higher_score(mock_supabase, valid_init_data):
    runs_module._submit_timestamps.clear()
    init_data = build_init_data(TEST_USER, auth_date=int(__import__("time").time()) - 120)
    low = client.post(
        "/runs",
        json={
            "initData": init_data,
            "years_survived": 3,
            "final_rank": "Intern",
            "rungs_climbed": 12,
        },
    )
    high = client.post(
        "/runs",
        json={
            "initData": init_data,
            "years_survived": 25,
            "final_rank": "Manager",
            "rungs_climbed": 100,
        },
    )
    assert low.status_code == 200
    assert high.status_code == 200


def test_runs_validation_error_does_not_rate_limit(mock_supabase, valid_init_data):
    runs_module._submit_timestamps.clear()
    bad = client.post(
        "/runs",
        json={
            "initData": valid_init_data,
            "years_survived": 5,
            "final_rank": "Intern",
            "rungs_climbed": 99,
        },
    )
    assert bad.status_code == 400
    good = client.post(
        "/runs",
        json={
            "initData": valid_init_data,
            "years_survived": 5,
            "final_rank": "Intern",
            "termination_cause": "Meeting collision",
            "rungs_climbed": 20,
        },
    )
    assert good.status_code == 200


def test_runs_rejects_implausible_score(mock_supabase, valid_init_data, monkeypatch):
    runs_module._submit_timestamps.clear()
    monkeypatch.setattr("app.routes._plausibility.today_preset_id", lambda: "synergy_sprint")
    init_data = build_init_data(TEST_USER, auth_date=int(__import__("time").time()) - 120)
    response = client.post(
        "/runs",
        json={
            "initData": init_data,
            "years_survived": 26,
            "final_rank": "Manager",
            "rungs_climbed": 104,
            "sprint_mode": True,
        },
    )
    assert response.status_code == 400
    assert "plausible" in response.json()["detail"].lower()


def test_runs_accepts_board_member_run(mock_supabase, valid_init_data):
    runs_module._submit_timestamps.clear()
    init_data = build_init_data(TEST_USER, auth_date=int(__import__("time").time()) - 3600)
    response = client.post(
        "/runs",
        json={
            "initData": init_data,
            "years_survived": 58.5,
            "final_rank": "Board Member",
            "termination_cause": "Reorganization",
            "rungs_climbed": 234,
        },
    )
    assert response.status_code == 200


def test_runs_accepts_angel_investor_run(mock_supabase, valid_init_data):
    runs_module._submit_timestamps.clear()
    init_data = build_init_data(TEST_USER, auth_date=int(__import__("time").time()) - 3600)
    response = client.post(
        "/runs",
        json={
            "initData": init_data,
            "years_survived": 99.9,
            "final_rank": "Angel Investor",
            "termination_cause": "Reorganization",
            "rungs_climbed": 400,
        },
    )
    assert response.status_code == 200


def test_rank_band_boundaries(mock_supabase, valid_init_data):
    runs_module._submit_timestamps.clear()
    init_data = build_init_data(TEST_USER, auth_date=int(__import__("time").time()) - 3600)
    cases = [
        (49.9, "CEO", 200),
        (50.0, "Board Member", 200),
        (74.9, "Board Member", 300),
        (75.0, "Angel Investor", 300),
    ]
    for years, rank, rungs in cases:
        runs_module._submit_timestamps.clear()
        response = client.post(
            "/runs",
            json={
                "initData": init_data,
                "years_survived": years,
                "final_rank": rank,
                "termination_cause": "Reorganization",
                "rungs_climbed": rungs,
            },
        )
        assert response.status_code == 200, (years, rank, response.json())


def test_runs_normalizes_board_member_from_years(mock_supabase, valid_init_data):
    """50y+ runs normalize to Board Member even when client sends CEO."""
    runs_module._submit_timestamps.clear()
    init_data = build_init_data(TEST_USER, auth_date=int(__import__("time").time()) - 3600)
    response = client.post(
        "/runs",
        json={
            "initData": init_data,
            "years_survived": 58.5,
            "final_rank": "CEO",
            "termination_cause": "Reorganization",
            "rungs_climbed": 234,
        },
    )
    assert response.status_code == 200


def test_runs_accepts_legitimate_manager_run(mock_supabase, valid_init_data):
    runs_module._submit_timestamps.clear()
    init_data = build_init_data(TEST_USER, auth_date=int(__import__("time").time()) - 120)
    response = client.post(
        "/runs",
        json={
            "initData": init_data,
            "years_survived": 15,
            "final_rank": "Manager",
            "termination_cause": "Meeting collision",
            "rungs_climbed": 60,
        },
    )
    assert response.status_code == 200


def test_runs_normalizes_stale_manager_rank(mock_supabase, valid_init_data):
    """Stale client rank is rewritten from years before validation."""
    runs_module._submit_timestamps.clear()
    init_data = build_init_data(TEST_USER, auth_date=int(__import__("time").time()) - 120)
    response = client.post(
        "/runs",
        json={
            "initData": init_data,
            "years_survived": 25,
            "final_rank": "Manager",
            "termination_cause": "Reorganization",
            "rungs_climbed": 100,
        },
    )
    assert response.status_code == 200


def test_runs_accepts_legitimate_director_run(mock_supabase, valid_init_data):
    runs_module._submit_timestamps.clear()
    init_data = build_init_data(TEST_USER, auth_date=int(__import__("time").time()) - 120)
    response = client.post(
        "/runs",
        json={
            "initData": init_data,
            "years_survived": 25,
            "final_rank": "Director",
            "termination_cause": "Deadline Crash",
            "rungs_climbed": 100,
        },
    )
    assert response.status_code == 200


def test_runs_normalizes_stale_director_rank(mock_supabase, valid_init_data):
    runs_module._submit_timestamps.clear()
    init_data = build_init_data(TEST_USER, auth_date=int(__import__("time").time()) - 120)
    response = client.post(
        "/runs",
        json={
            "initData": init_data,
            "years_survived": 15,
            "final_rank": "Director",
            "termination_cause": "Reorganization",
            "rungs_climbed": 60,
        },
    )
    assert response.status_code == 200


def test_runs_normalizes_ceo_band_from_years(mock_supabase, valid_init_data):
    """35y+ runs are stored as CEO even when client sends Director."""
    runs_module._submit_timestamps.clear()
    init_data = build_init_data(TEST_USER, auth_date=int(__import__("time").time()) - 240)
    response = client.post(
        "/runs",
        json={
            "initData": init_data,
            "years_survived": 36,
            "final_rank": "Director",
            "termination_cause": "Reorganization",
            "rungs_climbed": 144,
        },
    )
    assert response.status_code == 200


def test_leaderboard_me_highlights_user(mock_supabase, valid_init_data):
    runs_module._submit_timestamps.clear()
    auth = client.post("/auth/me", json={"initData": valid_init_data})
    token = auth.json()["session_token"]
    client.post(
        "/runs",
        json={
            "initData": valid_init_data,
            "years_survived": 5,
            "final_rank": "Intern",
            "termination_cause": "Meeting collision",
            "rungs_climbed": 20,
        },
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
    runs_module._submit_timestamps.clear()
    monkeypatch.setattr("app.routes._plausibility.today_preset_id", lambda: "synergy_sprint")
    response = client.post(
        "/runs",
        json={
            "initData": valid_init_data,
            "years_survived": 5,
            "final_rank": "Intern",
            "rungs_climbed": 20,
            "sprint_mode": False,
        },
    )
    assert response.status_code == 400
    assert "sprint_mode required" in response.json()["detail"].lower()


def test_runs_sprint_mode_rejected_on_non_sprint_day(mock_supabase, valid_init_data, monkeypatch):
    runs_module._submit_timestamps.clear()
    monkeypatch.setattr("app.routes._plausibility.today_preset_id", lambda: "standard")
    response = client.post(
        "/runs",
        json={
            "initData": valid_init_data,
            "years_survived": 5,
            "final_rank": "Intern",
            "rungs_climbed": 20,
            "sprint_mode": True,
        },
    )
    assert response.status_code == 400
    assert "sprint_mode invalid" in response.json()["detail"].lower()


def test_runs_accepts_sprint_mode_on_sprint_day(mock_supabase, valid_init_data, monkeypatch):
    runs_module._submit_timestamps.clear()
    monkeypatch.setattr("app.routes._plausibility.today_preset_id", lambda: "synergy_sprint")
    init_data = build_init_data(TEST_USER, auth_date=int(__import__("time").time()) - 120)
    response = client.post(
        "/runs",
        json={
            "initData": init_data,
            "years_survived": 5,
            "final_rank": "Intern",
            "termination_cause": "Sprint standdown",
            "rungs_climbed": 20,
            "sprint_mode": True,
        },
    )
    assert response.status_code == 200


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
    runs_module._submit_timestamps.clear()
    mock_supabase.cooldowns_store.clear()
    payload = {
        "initData": valid_init_data,
        "years_survived": 2,
        "final_rank": "Intern",
        "rungs_climbed": 8,
    }
    response = client.post("/runs", json=payload)
    assert response.status_code == 200
    assert TEST_USER["id"] in mock_supabase.cooldowns_store


def test_runs_missing_fields_returns_422(mock_supabase):
    response = client.post("/runs", json={"initData": "not-valid"})
    assert response.status_code == 422
