import { FAILURE_REASONS, OBSTACLE_DEATH_COPY } from "./constants";
import { getDailyModifierById } from "./daily-modifier";
import { buildOgCaptureRungs } from "./og-capture";
import type { DeathType, PlayerSide, Rank, Rung } from "./types";

export type MarketingCaptureMode = "home" | "game" | "gameover";

export const MARKETING_HOME_USERNAME = "CorporateSlave";
export const MARKETING_HOME_HIGH_SCORE = 3.5;

export const MARKETING_GAME_SCORE = 8;
export const MARKETING_GAME_YEARS = MARKETING_GAME_SCORE / 4;
export const MARKETING_GAME_ENERGY = 68;
export const MARKETING_GAME_PLAYER_SIDE: PlayerSide = "left";
export const MARKETING_GAME_RANK: Rank = "Intern";
export const MARKETING_GAME_MODIFIER = getDailyModifierById("reorg_week");

export const MARKETING_HOME_MODIFIER = getDailyModifierById("standard");

export function getMarketingCaptureMode(): MarketingCaptureMode | null {
  if (typeof window === "undefined") return null;
  const value = new URLSearchParams(window.location.search).get("capture");
  if (value === "home" || value === "game" || value === "gameover") return value;
  return null;
}

export function buildMarketingGameRungs(): Rung[] {
  return buildOgCaptureRungs();
}

export const MARKETING_GAMEOVER = {
  yearsSurvived: 6.2,
  finalRank: "Intern" as Rank,
  deathType: "meeting" as DeathType,
  terminationCause: OBSTACLE_DEATH_COPY.meeting.cause,
  terminationDetail: OBSTACLE_DEATH_COPY.meeting.detail,
  terminationFlavor: FAILURE_REASONS[0] ?? "Your synergy did not scale optimally with our paradigms.",
  rungsClimbed: 25,
};
