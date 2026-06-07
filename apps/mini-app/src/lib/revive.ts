import { isReviveFeatureEnabled } from "./adsgram";
import type { GameOverResult } from "../game/types";

export const REVIVE_BUTTON_TITLE = "Mandatory HR Training";
export const REVIVE_SUBLINE_DEFAULT = "One executive exception this shift";
export const REVIVE_TOAST_COMPLETE = "Training complete. Back to the ladder.";

export interface ReviveContext {
  highScore: number;
  reviveUsedThisRun: boolean;
  /** Years behind #1 on active leaderboard; null when unknown or user is #1. */
  leaderboardGap: number | null;
}

export function hasReviveStakeSignal(result: GameOverResult, ctx: ReviveContext): boolean {
  const meaningfulRun = result.yearsSurvived >= 8;
  const nearPB = ctx.highScore > 0 && ctx.highScore - result.yearsSurvived <= 2;
  const nearLB = ctx.leaderboardGap !== null && ctx.leaderboardGap > 0 && ctx.leaderboardGap <= 3;
  return meaningfulRun || nearPB || nearLB;
}

export function shouldOfferRevive(result: GameOverResult, ctx: ReviveContext): boolean {
  if (!isReviveFeatureEnabled()) return false;
  if (ctx.reviveUsedThisRun) return false;
  if (result.deathType === "sprint") return false;
  if (result.yearsSurvived < 3) return false;
  return hasReviveStakeSignal(result, ctx);
}

export function buildReviveCopy(
  result: GameOverResult,
  ctx: ReviveContext
): { title: string; subline: string } {
  const gapToBest =
    ctx.highScore > 0 && result.yearsSurvived < ctx.highScore
      ? parseFloat((ctx.highScore - result.yearsSurvived).toFixed(1))
      : null;

  if (ctx.leaderboardGap !== null && ctx.leaderboardGap > 0 && ctx.leaderboardGap <= 3) {
    return {
      title: REVIVE_BUTTON_TITLE,
      subline: `Close the gap — ${ctx.leaderboardGap.toFixed(1)}y from #1`,
    };
  }

  if (gapToBest !== null && gapToBest <= 2) {
    return {
      title: REVIVE_BUTTON_TITLE,
      subline: `Resume ${gapToBest.toFixed(1)}y short of your career high`,
    };
  }

  return {
    title: REVIVE_BUTTON_TITLE,
    subline: REVIVE_SUBLINE_DEFAULT,
  };
}

export function leaderboardGapToFirst(
  result: GameOverResult,
  topYears: number | undefined,
  isCurrentUserTop: boolean
): number | null {
  if (topYears === undefined) return null;
  if (isCurrentUserTop) return null;
  if (topYears <= result.yearsSurvived) return null;
  return parseFloat((topYears - result.yearsSurvived).toFixed(1));
}
