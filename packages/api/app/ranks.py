"""Rank bands — parity with mini-app constants.ts and runs.py."""

from typing import Literal

FinalRank = Literal["Intern", "Manager", "Director", "CEO"]

MANAGER_YEARS = 10
DIRECTOR_YEARS = 20
CEO_YEARS = 35


def rank_from_years(years: float) -> FinalRank:
    if years >= CEO_YEARS:
        return "CEO"
    if years >= DIRECTOR_YEARS:
        return "Director"
    if years >= MANAGER_YEARS:
        return "Manager"
    return "Intern"
