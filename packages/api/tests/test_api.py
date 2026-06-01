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
    runs_module._submit_timestamps.clear()
    response = client.post(
        "/runs",
        json={
            "initData": valid_init_data,
            "years_survived": 1,
            "final_rank": "VP",
            "rungs_climbed": 4,
        },
    )
    assert response.status_code == 422


def test_runs_rank_years_mismatch(mock_supabase, valid_init_data):
    runs_module._submit_timestamps.clear()
    response = client.post(
        "/runs",
        json={
            "initData": valid_init_data,
            "years_survived": 1,
            "final_rank": "CEO",
            "rungs_climbed": 4,
        },
    )
    assert response.status_code == 400
    assert "inconsistent" in response.json()["detail"].lower()


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


def test_runs_rejects_implausible_score(mock_supabase, valid_init_data):
    runs_module._submit_timestamps.clear()
    response = client.post(
        "/runs",
        json={
            "initData": valid_init_data,
            "years_survived": 99.9,
            "final_rank": "CEO",
            "rungs_climbed": 400,
        },
    )
    assert response.status_code == 400
    assert "plausible" in response.json()["detail"].lower()


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
