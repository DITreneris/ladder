"""Rank bands — parity with mini-app constants.ts."""

from typing import Literal

from fastapi import HTTPException

FinalRank = Literal["Intern", "Manager", "Director", "CEO", "Board Member", "Angel Investor"]

MANAGER_YEARS = 10
DIRECTOR_YEARS = 20
CEO_YEARS = 35
BOARD_YEARS = 50
ANGEL_YEARS = 75
MAX_YEARS_NORMAL = 100.0

# Contiguous rank bands: Intern [0,10) / Manager [10,20) / Director [20,35) /
# CEO [35,50) / Board Member [50,75) / Angel Investor [75,...)
_RANK_BANDS: dict[str, tuple[float, float]] = {
    "Intern": (0, MANAGER_YEARS),
    "Manager": (MANAGER_YEARS, DIRECTOR_YEARS),
    "Director": (DIRECTOR_YEARS, CEO_YEARS),
    "CEO": (CEO_YEARS, BOARD_YEARS),
    "Board Member": (BOARD_YEARS, ANGEL_YEARS),
    "Angel Investor": (ANGEL_YEARS, float("inf")),
}


def rank_from_years(years: float) -> FinalRank:
    if years >= ANGEL_YEARS:
        return "Angel Investor"
    if years >= BOARD_YEARS:
        return "Board Member"
    if years >= CEO_YEARS:
        return "CEO"
    if years >= DIRECTOR_YEARS:
        return "Director"
    if years >= MANAGER_YEARS:
        return "Manager"
    return "Intern"


def validate_rank_years(final_rank: str, years_survived: float) -> None:
    band = _RANK_BANDS.get(final_rank)
    if band is None:
        raise HTTPException(status_code=400, detail="Rank inconsistent with years survived")
    low, high = band
    if years_survived < low or years_survived >= high:
        raise HTTPException(status_code=400, detail="Rank inconsistent with years survived")
