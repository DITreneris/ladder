from app.db.postgrest_helpers import first_row
from app.db.supabase import get_supabase


def upsert_user(tg_user: dict) -> dict:
    db = get_supabase()
    telegram_id = tg_user["id"]
    existing = (
        db.table("users")
        .select("*")
        .eq("telegram_id", telegram_id)
        .limit(1)
        .execute()
    )
    row = first_row(existing)

    payload = {
        "telegram_id": telegram_id,
        "username": tg_user.get("username"),
        "first_name": tg_user.get("first_name"),
    }

    if row:
        db.table("users").update(payload).eq("telegram_id", telegram_id).execute()
        return {**row, **payload}

    result = db.table("users").insert({**payload, "best_score": 0, "best_rank": "Intern"}).execute()
    return result.data[0]
