"""PostgREST helpers — avoid maybe_single() on empty results (PGRST116 in prod)."""

from typing import Any


def first_row(result: Any) -> dict | None:
    """Return the first row from a PostgREST response, or None."""
    if not result or not result.data:
        return None
    data = result.data
    if isinstance(data, list):
        return data[0] if data else None
    if isinstance(data, dict):
        return data
    return None
