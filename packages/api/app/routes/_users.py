from app.db.supabase import get_supabase


def upsert_user(tg_user: dict) -> dict:
    db = get_supabase()
    telegram_id = tg_user["id"]
    existing = db.table("users").select("*").eq("telegram_id", telegram_id).maybe_single().execute()

    payload = {
        "telegram_id": telegram_id,
        "username": tg_user.get("username"),
        "first_name": tg_user.get("first_name"),
    }

    if existing and existing.data:
        db.table("users").update(payload).eq("telegram_id", telegram_id).execute()
        return {**existing.data, **payload}

    result = db.table("users").insert({**payload, "best_score": 0, "best_rank": "Intern"}).execute()
    return result.data[0]
