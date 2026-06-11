#!/usr/bin/env python3
"""F&F metrics audit — read-only Supabase counts + prod API smoke (no secrets printed)."""

from __future__ import annotations

import hashlib
import hmac
import json
import statistics
import sys
import time
import urllib.error
import urllib.request
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]

PAGE_SIZE = 1000
PROBE_USERNAMES = frozenset({"ff_audit_probe"})
CORE_USERNAMES = frozenset({"Kristupas", "Promptanatomy.app", "Tomas", "Prompt_Anatom"})
RUNG_SECONDS_MIN = 0.12
RUNG_SECONDS_MID = 0.25
RUNG_SECONDS_MAX = 0.40
SESSION_GAP_SECONDS = 300  # 5 minutes


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


def _fetch_all(
    db,
    table: str,
    select: str,
    *,
    gte: dict[str, str] | None = None,
    order_col: str | None = None,
    order_desc: bool = False,
) -> list[dict[str, Any]]:
    """Paginate PostgREST reads (default limit is 1000 rows)."""
    rows: list[dict[str, Any]] = []
    offset = 0
    while True:
        query = db.table(table).select(select)
        if gte:
            for col, val in gte.items():
                query = query.gte(col, val)
        if order_col:
            query = query.order(order_col, desc=order_desc)
        page = query.range(offset, offset + PAGE_SIZE - 1).execute().data or []
        rows.extend(page)
        if len(page) < PAGE_SIZE:
            break
        offset += PAGE_SIZE
    return rows


def _user_identity(user: dict[str, Any]) -> str:
    return user.get("username") or user.get("first_name") or ""


def _user_segment(user: dict[str, Any]) -> str:
    identity = _user_identity(user)
    if identity in PROBE_USERNAMES:
        return "probe"
    if identity in CORE_USERNAMES:
        return "core"
    return "external"


def _is_probe_user(user: dict[str, Any]) -> bool:
    return _user_segment(user) == "probe"


def _est_run_seconds(rungs: int) -> dict[str, float]:
    return {
        "min": round(rungs * RUNG_SECONDS_MIN, 1),
        "mid": round(rungs * RUNG_SECONDS_MID, 1),
        "max": round(rungs * RUNG_SECONDS_MAX, 1),
    }


def _est_minutes_from_rungs(rungs: int, rate: float = RUNG_SECONDS_MID) -> float:
    return round(rungs * rate / 60, 1)


def _parse_ts(ts: str) -> datetime:
    return datetime.fromisoformat(ts.replace("Z", "+00:00"))


def _median(values: list[float]) -> float | None:
    if not values:
        return None
    return round(float(statistics.median(values)), 2)


def _session_minutes_mid(runs: list[dict[str, Any]]) -> float:
    """Wall-clock session proxy: run mid-estimates + gaps <= 5 min between runs."""
    if not runs:
        return 0.0
    ordered = sorted(runs, key=lambda r: r["created_at"])
    total_seconds = 0.0
    for i, run in enumerate(ordered):
        rungs = int(run.get("rungs_climbed") or 0)
        total_seconds += rungs * RUNG_SECONDS_MID
        if i > 0:
            gap = (_parse_ts(run["created_at"]) - _parse_ts(ordered[i - 1]["created_at"])).total_seconds()
            if 0 < gap <= SESSION_GAP_SECONDS:
                total_seconds += gap
    return round(total_seconds / 60, 1)


def _group_sessions(runs: list[dict[str, Any]]) -> list[list[dict[str, Any]]]:
    if not runs:
        return []
    ordered = sorted(runs, key=lambda r: r["created_at"])
    sessions: list[list[dict[str, Any]]] = [[ordered[0]]]
    for run in ordered[1:]:
        gap = (_parse_ts(run["created_at"]) - _parse_ts(sessions[-1][-1]["created_at"])).total_seconds()
        if gap <= SESSION_GAP_SECONDS:
            sessions[-1].append(run)
        else:
            sessions.append([run])
    return sessions


def _returned_after_first(all_runs_for_user: list[dict[str, Any]]) -> bool:
    if len(all_runs_for_user) < 2:
        return False
    ordered = sorted(all_runs_for_user, key=lambda r: r["created_at"])
    first_at = _parse_ts(ordered[0]["created_at"])
    for run in ordered[1:]:
        if (_parse_ts(run["created_at"]) - first_at).total_seconds() > 3600:
            return True
    return False


def _compute_deep_analytics(
    all_users: list[dict[str, Any]],
    all_runs: list[dict[str, Any]],
    runs_14d: list[dict[str, Any]],
    since: str,
    user_map: dict[str, dict[str, Any]],
) -> dict[str, Any]:
    user_ids_with_runs = {r["user_id"] for r in all_runs}
    non_probe_users = [u for u in all_users if not _is_probe_user(u)]
    users_no_runs = [u for u in non_probe_users if u["id"] not in user_ids_with_runs]

    runs_14d_non_probe = [
        r for r in runs_14d if not _is_probe_user(user_map.get(r["user_id"], {}))
    ]

    players_14d_ids: set[str] = set()
    core_14d_ids: set[str] = set()
    external_14d_ids: set[str] = set()
    external_runs_count: dict[str, int] = defaultdict(int)

    for r in runs_14d_non_probe:
        uid = r["user_id"]
        players_14d_ids.add(uid)
        seg = _user_segment(user_map.get(uid, {}))
        if seg == "core":
            core_14d_ids.add(uid)
        else:
            external_14d_ids.add(uid)
            external_runs_count[uid] += 1

    externals_gte3 = sum(1 for c in external_runs_count.values() if c >= 3)

    total_rungs_14d = sum(int(r.get("rungs_climbed") or 0) for r in runs_14d_non_probe)
    years_14d = [float(r["years_survived"]) for r in runs_14d_non_probe]
    external_years_14d = [
        float(r["years_survived"])
        for r in runs_14d_non_probe
        if _user_segment(user_map.get(r["user_id"], {})) == "external"
    ]
    rung_counts_14d = [int(r.get("rungs_climbed") or 0) for r in runs_14d_non_probe]
    run_seconds_mid = [rc * RUNG_SECONDS_MID for rc in rung_counts_14d]

    manager_runs = sum(1 for y in years_14d if y >= 10)
    ceo_runs = sum(1 for y in years_14d if y >= 35)
    max_years_14d = max(years_14d) if years_14d else 0

    cause_stats: dict[str, dict[str, Any]] = defaultdict(lambda: {"runs": 0, "years_sum": 0.0})
    for r in runs_14d_non_probe:
        cause = r.get("termination_cause") or "unknown"
        cause_stats[cause]["runs"] += 1
        cause_stats[cause]["years_sum"] += float(r["years_survived"])
    termination_cause_breakdown = sorted(
        [
            {
                "cause": cause,
                "runs": stats["runs"],
                "avg_years": round(stats["years_sum"] / stats["runs"], 2),
            }
            for cause, stats in cause_stats.items()
        ],
        key=lambda x: -x["runs"],
    )[:5]

    daily: dict[str, dict[str, set[str] | int]] = defaultdict(lambda: {"runs": 0, "players": set()})
    for r in runs_14d_non_probe:
        day = r["created_at"][:10]
        daily[day]["runs"] += 1
        daily[day]["players"].add(r["user_id"])
    daily_trend = [
        {"date": day, "runs": stats["runs"], "players": len(stats["players"])}
        for day, stats in sorted(daily.items(), reverse=True)
    ]

    all_runs_by_user: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for r in all_runs:
        uid = r["user_id"]
        if _is_probe_user(user_map.get(uid, {})):
            continue
        all_runs_by_user[uid].append(r)

    players_ever = len(all_runs_by_user)
    returned_count = sum(1 for runs in all_runs_by_user.values() if _returned_after_first(runs))
    one_and_done = sum(1 for runs in all_runs_by_user.values() if len(runs) == 1)

    external_session_minutes: list[float] = []
    for uid, runs in all_runs_by_user.items():
        if _user_segment(user_map.get(uid, {})) != "external":
            continue
        user_runs_14d = [r for r in runs if r["created_at"] >= since]
        if not user_runs_14d:
            continue
        for session in _group_sessions(user_runs_14d):
            external_session_minutes.append(_session_minutes_mid(session))

    core_rungs_14d = sum(
        int(r.get("rungs_climbed") or 0)
        for r in runs_14d_non_probe
        if _user_segment(user_map.get(r["user_id"], {})) == "core"
    )
    external_rungs_14d = total_rungs_14d - core_rungs_14d

    median_run_seconds_mid = _median(run_seconds_mid)
    session_length_band = {
        "target_min_seconds": 30,
        "target_max_seconds": 90,
        "median_run_seconds_mid": median_run_seconds_mid,
        "on_track": median_run_seconds_mid is not None and 30 <= median_run_seconds_mid <= 90,
    }

    return {
        "funnel": {
            "users_total": len(all_users),
            "users_registered_no_runs": len(users_no_runs),
            "players_14d": len(players_14d_ids),
            "core_players_14d": len(core_14d_ids),
            "externals_14d": len(external_14d_ids),
            "externals_gte3_runs": externals_gte3,
        },
        "playtime_proxy_14d": {
            "note": "Estimated from rungs_climbed; not measured wall-clock duration",
            "total_rungs": total_rungs_14d,
            "est_total_play_minutes_mid": _est_minutes_from_rungs(total_rungs_14d),
            "est_total_play_minutes_range": {
                "min": _est_minutes_from_rungs(total_rungs_14d, RUNG_SECONDS_MIN),
                "max": _est_minutes_from_rungs(total_rungs_14d, RUNG_SECONDS_MAX),
            },
            "avg_rungs_per_run": round(total_rungs_14d / len(runs_14d_non_probe), 2) if runs_14d_non_probe else 0,
            "median_years_per_run": _median(years_14d),
            "median_years_external_only": _median(external_years_14d),
            "session_length_band": session_length_band,
            "avg_session_minutes_mid_external": _median(external_session_minutes),
            "core_rungs_14d": core_rungs_14d,
            "external_rungs_14d": external_rungs_14d,
            "core_volume_pct": round(100 * core_rungs_14d / total_rungs_14d, 1) if total_rungs_14d else 0,
        },
        "progression_14d": {
            "manager_runs": manager_runs,
            "ceo_runs": ceo_runs,
            "max_years": max_years_14d,
            "termination_cause_breakdown": termination_cause_breakdown,
            "daily_trend": daily_trend,
        },
        "retention_all_time": {
            "players_ever": players_ever,
            "returned_after_first_run": returned_count,
            "returned_pct": round(100 * returned_count / players_ever, 1) if players_ever else 0,
            "one_and_done": one_and_done,
        },
        "users_registered_no_runs": [
            {
                "created_at": u.get("created_at"),
                "telegram_id": u.get("telegram_id"),
                "name": u.get("username") or u.get("first_name"),
                "segment": _user_segment(u),
            }
            for u in users_no_runs
        ],
    }


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
    runs_14d_count = (
        db.table("game_runs").select("id", count="exact").gte("created_at", since).execute().count or 0
    )

    run_fields = "user_id,created_at,years_survived,rungs_climbed,termination_cause,final_rank"
    all_runs = _fetch_all(db, "game_runs", run_fields, order_col="created_at", order_desc=False)
    runs_14d = [r for r in all_runs if r["created_at"] >= since]

    all_users = _fetch_all(
        db,
        "users",
        "id,created_at,telegram_id,username,first_name,best_score,best_rank",
        order_col="created_at",
        order_desc=True,
    )

    recent = (
        db.table("game_runs")
        .select(
            "created_at,years_survived,final_rank,rungs_climbed,termination_cause,"
            "user_id,users(telegram_id,username,first_name)"
        )
        .order("created_at", desc=True)
        .limit(20)
        .execute()
        .data
        or []
    )

    user_map = {u["id"]: u for u in all_users}
    user_ids_with_runs = {r["user_id"] for r in all_runs}
    users_no_runs = [u for u in all_users if u["id"] not in user_ids_with_runs and not _is_probe_user(u)]

    per_user_14d: dict[str, dict[str, Any]] = defaultdict(
        lambda: {
            "runs": 0,
            "first": None,
            "last": None,
            "days": set(),
            "years": [],
            "rungs": 0,
        }
    )
    for r in runs_14d:
        uid = r["user_id"]
        if _is_probe_user(user_map.get(uid, {})):
            continue
        m = per_user_14d[uid]
        m["runs"] += 1
        m["years"].append(float(r["years_survived"]))
        m["rungs"] += int(r.get("rungs_climbed") or 0)
        ts = r["created_at"]
        if m["first"] is None or ts < m["first"]:
            m["first"] = ts
        if m["last"] is None or ts > m["last"]:
            m["last"] = ts
        m["days"].add(ts[:10])

    all_runs_by_user: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for r in all_runs:
        all_runs_by_user[r["user_id"]].append(r)

    metrics_rows = []
    for uid, m in sorted(per_user_14d.items(), key=lambda x: -x[1]["runs"]):
        u = user_map.get(uid, {})
        est = _est_run_seconds(m["rungs"])
        metrics_rows.append(
            {
                "name": u.get("username") or u.get("first_name") or uid[:8],
                "telegram_id": u.get("telegram_id"),
                "segment": _user_segment(u),
                "runs": m["runs"],
                "first_run": m["first"],
                "last_run": m["last"],
                "active_days": len(m["days"]),
                "best_score": u.get("best_score"),
                "best_rank": u.get("best_rank"),
                "avg_years": round(sum(m["years"]) / len(m["years"]), 2) if m["years"] else 0,
                "max_years": max(m["years"]) if m["years"] else 0,
                "est_play_minutes_mid": _est_minutes_from_rungs(m["rungs"]),
                "est_play_minutes_range": {
                    "min": _est_minutes_from_rungs(m["rungs"], RUNG_SECONDS_MIN),
                    "max": _est_minutes_from_rungs(m["rungs"], RUNG_SECONDS_MAX),
                },
                "returned_after_first": _returned_after_first(all_runs_by_user.get(uid, [])),
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
                "rungs_climbed": r.get("rungs_climbed"),
                "termination_cause": r.get("termination_cause"),
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
            "segment": _user_segment(u),
        }
        for u in users_no_runs
    ]

    deep_analytics = _compute_deep_analytics(all_users, all_runs, runs_14d, since, user_map)

    return {
        "supabase_url_host": url.replace("https://", "").split("/")[0],
        "migration_002_ok": probe_migration_002(db),
        "users_total": users_count,
        "runs_total": runs_count,
        "runs_14d": runs_14d_count,
        "recent_runs": recent_rows,
        "users_without_runs": no_run_rows,
        "metrics_14d": metrics_rows,
        "deep_analytics": deep_analytics,
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
