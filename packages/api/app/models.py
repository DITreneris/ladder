from typing import Literal

from pydantic import BaseModel, Field

FinalRank = Literal["Intern", "Manager", "CEO"]


class InitDataRequest(BaseModel):
    init_data: str = Field(..., alias="initData")

    model_config = {"populate_by_name": True}


class UserProfile(BaseModel):
    telegram_id: int
    username: str | None
    first_name: str | None
    best_score: float
    best_rank: str
    session_token: str | None = None


class RunSubmitRequest(BaseModel):
    init_data: str = Field(..., alias="initData")
    years_survived: float = Field(..., ge=0, le=100)
    final_rank: FinalRank
    termination_cause: str | None = None
    rungs_climbed: int = Field(..., ge=0)
    sprint_mode: bool = False

    model_config = {"populate_by_name": True}


class LeaderboardEntry(BaseModel):
    rank: int
    username: str
    first_name: str | None
    years_survived: float
    final_rank: str
    is_current_user: bool = False


class LeaderboardResponse(BaseModel):
    period: str
    entries: list[LeaderboardEntry]


class LeaderboardMeRequest(BaseModel):
    session_token: str = Field(..., alias="sessionToken")
    period: Literal["daily", "weekly"] = "daily"

    model_config = {"populate_by_name": True}


class LeaderboardMeResponse(BaseModel):
    period: str
    rank: int | None = None
    years_survived: float | None = None
    final_rank: str | None = None
    on_board: bool = False
