#!/usr/bin/env python3
"""F&F metrics audit — read-only Supabase counts + prod API smoke (no secrets printed)."""

from __future__ import annotations

import hashlib
import hmac
import json
import sys
import time
import urllib.error
import urllib.request
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def load_env() -> dict[str, str]:
    env_path = ROOT / ".env"
    if not env_path.exists():
        print("ERROR: root .env missing", file=sys.stderr)
        sys.exit(1)
    values: dict[str, str] = {}
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, val = line.partition("=")
        values[key.strip()] = val.strip()
    return values


def build_init_data(user: dict, bot_token: str) -> str:
    ts = str(int(time.time()))
    user_json = json.dumps(user, separators=(",", ":"))
    pairs = {"auth_date": ts, "user": user_json}
    data_check_string = "\n".join(f"{k}={v}" for k, v in sorted(pairs.items()))
    secret_key = hmac.new(b"WebAppData", bot_token.encode(), hashlib.sha256).digest()
    hash_val = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()
    return f"auth_date={ts}&user={user_json}&hash={hash_val}"


def http_json(method: str, url: str, body: dict | None = None, timeout: int = 15) -> tuple[int, dict | str]:
    data = None
    headers = {"Content-Type": "application/json"}
    if body is not None:
        data = json.dumps(body).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            raw = resp.read().decode("utf-8")
            try:
                return resp.status, json.loads(raw)
            except json.JSONDecodeError:
                return resp.status, raw
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8", errors="replace")
        try:
            return e.code, json.loads(raw)
        except json.JSONDecodeError:
            return e.code, raw


def probe_migration_002(db) -> bool:
    """Return True when submit_cooldowns and api_sessions exist."""
    ok = True
    for table in ("submit_cooldowns", "api_sessions"):
        try:
            db.table(table).select("telegram_id").limit(1).execute()
        except Exception:
            ok = False
    return ok


def query_supabase(env: dict[str, str]) -> dict:
    from supabase import create_client

    url = env.get("SUPABASE_URL", "")
    key = env.get("SUPABASE_SERVICE_ROLE_KEY", "")
    if not url or not key:
        return {"error": "missing_supabase_credentials"}

    db = create_client(url, key)
    since = (datetime.now(timezone.utc) - timedelta(days=14)).isoformat()

    users_count = db.table("users").select("id", count="exact").execute().count or 0
    runs_count = db.table("game_runs").select("id", count="exact").execute().count or 0
    runs_14d = (
        db.table("game_runs").select("id", count="exact").gte("created_at", since).execute().count or 0
    )

    recent = (
        db.table("game_runs")
        .select("created_at,years_survived,final_rank,rungs_climbed,user_id,users(telegram_id,username,first_name)")
        .order("created_at", desc=True)
        .limit(20)
        .execute()
        .data
        or []
    )

    all_users = (
        db.table("users")
        .select("id,created_at,telegram_id,username,first_name,best_score")
        .order("created_at", desc=True)
        .execute()
        .data
        or []
    )
    all_runs = db.table("game_runs").select("user_id,created_at").execute().data or []
    user_ids_with_runs = {r["user_id"] for r in all_runs}
    users_no_runs = [u for u in all_users if u["id"] not in user_ids_with_runs]

    metrics: dict[str, dict] = defaultdict(lambda: {"runs": 0, "first": None, "last": None, "days": set()})
    for r in all_runs:
        if r["created_at"] < since:
            continue
        uid = r["user_id"]
        metrics[uid]["runs"] += 1
        ts = r["created_at"]
        if metrics[uid]["first"] is None or ts < metrics[uid]["first"]:
            metrics[uid]["first"] = ts
        if metrics[uid]["last"] is None or ts > metrics[uid]["last"]:
            metrics[uid]["last"] = ts
        metrics[uid]["days"].add(ts[:10])

    user_map = {u["id"]: u for u in all_users}
    metrics_rows = []
    for uid, m in sorted(metrics.items(), key=lambda x: -x[1]["runs"]):
        u = user_map.get(uid, {})
        metrics_rows.append(
            {
                "name": u.get("username") or u.get("first_name") or uid[:8],
                "telegram_id": u.get("telegram_id"),
                "runs": m["runs"],
                "first_run": m["first"],
                "last_run": m["last"],
                "active_days": len(m["days"]),
            }
        )

    recent_rows = []
    for r in recent:
        u = r.get("users") or {}
        recent_rows.append(
            {
                "created_at": r.get("created_at"),
                "years": r.get("years_survived"),
                "rank": r.get("final_rank"),
                "telegram_id": u.get("telegram_id"),
                "name": u.get("username") or u.get("first_name"),
            }
        )

    no_run_rows = [
        {
            "created_at": u.get("created_at"),
            "telegram_id": u.get("telegram_id"),
            "name": u.get("username") or u.get("first_name"),
            "best_score": u.get("best_score"),
        }
        for u in users_no_runs
    ]

    return {
        "supabase_url_host": url.replace("https://", "").split("/")[0],
        "migration_002_ok": probe_migration_002(db),
        "users_total": users_count,
        "runs_total": runs_count,
        "runs_14d": runs_14d,
        "recent_runs": recent_rows,
        "users_without_runs": no_run_rows,
        "metrics_14d": metrics_rows,
    }


def probe_prod_api(env: dict[str, str]) -> dict:
    api_url = env.get("VITE_API_URL", "").rstrip("/")
    bot_token = env.get("TELEGRAM_WEBAPP_SECRET") or env.get("TELEGRAM_BOT_TOKEN") or ""
    if not api_url:
        return {"error": "missing_vite_api_url"}

    health_status, health_body = http_json("GET", f"{api_url}/health")
    daily_status, daily_body = http_json("GET", f"{api_url}/leaderboard?period=daily&limit=50")
    weekly_status, weekly_body = http_json("GET", f"{api_url}/leaderboard?period=weekly&limit=50")

    audit_user = {"id": 900000001, "username": "ff_audit_probe", "first_name": "FFAudit"}
    init_data = build_init_data(audit_user, bot_token) if bot_token else ""

    auth_status = None
    auth_detail = None
    run_status = None
    run_detail = None
    if init_data:
        auth_status, auth_body = http_json("POST", f"{api_url}/auth/me", {"initData": init_data})
        auth_detail = auth_body if isinstance(auth_body, dict) else str(auth_body)[:200]
        run_status, run_body = http_json(
            "POST",
            f"{api_url}/runs",
            {
                "initData": init_data,
                "years_survived": 0.5,
                "final_rank": "Intern",
                "termination_cause": "FF audit probe",
                "rungs_climbed": 2,
            },
        )
        run_detail = run_body if isinstance(run_body, dict) else str(run_body)[:200]

    return {
        "api_url": api_url,
        "health": {"status": health_status, "body": health_body},
        "leaderboard_daily": {
            "status": daily_status,
            "entry_count": len(daily_body.get("entries", [])) if isinstance(daily_body, dict) else 0,
        },
        "leaderboard_weekly": {
            "status": weekly_status,
            "entry_count": len(weekly_body.get("entries", [])) if isinstance(weekly_body, dict) else 0,
        },
        "auth_me_probe": {"status": auth_status, "detail": auth_detail},
        "runs_probe": {"status": run_status, "detail": run_detail},
        "webapp_secret_matches_prod": auth_status == 200,
        "submit_pipeline_ok": run_status == 200,
    }


def main() -> None:
    env = load_env()
    report = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "supabase": query_supabase(env),
        "prod_api": probe_prod_api(env),
    }
    if report["prod_api"].get("submit_pipeline_ok"):
        report["supabase_after_probe"] = query_supabase(env)

    print(json.dumps(report, indent=2, default=str))


if __name__ == "__main__":
    main()
