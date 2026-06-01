from fastapi.testclient import TestClient

from app.main import app
from app.routes import runs as runs_module
from tests.conftest import TEST_USER

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
