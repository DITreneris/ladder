from typing import Literal

from pydantic import BaseModel, Field, model_validator

from app.ranks import FinalRank, rank_from_years


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
    final_rank: FinalRank = "Intern"
    termination_cause: str | None = None
    rungs_climbed: int = Field(..., ge=0)
    sprint_mode: bool = False

    model_config = {"populate_by_name": True}

    @model_validator(mode="before")
    @classmethod
    def normalize_submit_payload(cls, data: object) -> object:
        if not isinstance(data, dict):
            return data
        normalized = dict(data)
        years_raw = normalized.get("years_survived")
        try:
            years = float(years_raw)
        except (TypeError, ValueError):
            years = None
        if years is not None:
            normalized["final_rank"] = rank_from_years(years)
        rungs = normalized.get("rungs_climbed")
        if rungs is not None:
            try:
                normalized["rungs_climbed"] = int(round(float(rungs)))
            except (TypeError, ValueError):
                pass
        return normalized


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


class SharePrepareRequest(BaseModel):
    init_data: str = Field(..., alias="initData")
    years_survived: float = Field(..., ge=0, le=100)
    final_rank: FinalRank
    shift_label: str = Field(..., min_length=1, max_length=80)
    termination_detail: str = Field(..., min_length=1, max_length=200)
    termination_flavor: str = Field(..., min_length=1, max_length=300)
    death_type: str | None = Field(default=None, max_length=32)

    model_config = {"populate_by_name": True}


class SharePrepareResponse(BaseModel):
    prepared_message_id: str = Field(..., alias="preparedMessageId")

    model_config = {"populate_by_name": True}
