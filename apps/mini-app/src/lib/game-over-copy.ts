import {
  REAPPLY_FLAVOR,
  RETRY_TIPS,
  RETRY_TIPS_BY_RANK,
} from "../game/constants";
import type { DeathType, Rank } from "../game/types";

export const RANK_HINTS_SEEN_STORAGE_KEY = "corp_ladder_rank_hints_seen";

export const PROGRESSION_HINTS_LEAN: Partial<Record<Rank, string>> = {
  Intern: "Director @ 20y is the real ceiling. CEO @ 35y is HR folklore.",
  Manager: "CEO @ 35y is mostly folklore — until it isn't.",
  Director: "Board Member @ 50y is where governance replaces climbing.",
  CEO: "Angel Investor @ 75y is the exit fantasy.",
  "Board Member": "Angel @ 75y is the capstone. HR audits every year above 50.",
};

export const TERMINATION_DETAIL_DISPLAY: Partial<Record<DeathType, string>> = {
  meeting: "All-hands on slide layout. Agenda tolerance exceeded.",
  reorg: "Restructuring shuffled you out of direct reports.",
  burnout: "Quarterly deadline with zero coffee left.",
  badge_gate: "Turnstile rejected your lanyard on the wrong aisle.",
  foliage: "Mandatory desk plant blocked the corridor.",
  energy: "Energy reserves exhausted before promotion.",
  sprint: "HR archived your climb at the buzzer.",
};

export type GameOverContextVariant = "default" | "leaderboard";

export type GameOverContextLine = {
  text: string;
  variant: GameOverContextVariant;
  /** When set, caller should persist this rank as hint-seen. */
  markRankHint?: Rank;
};

export type StatBestDeltaResult = {
  text: string;
  className: string;
};

export function loadRankHintsSeen(
  storage: Pick<Storage, "getItem"> | null =
    typeof localStorage !== "undefined" ? localStorage : null
): Set<Rank> {
  if (!storage) return new Set();
  try {
    const raw = storage.getItem(RANK_HINTS_SEEN_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((r): r is Rank => typeof r === "string"));
  } catch {
    return new Set();
  }
}

export function markRankHintSeen(
  rank: Rank,
  storage: Pick<Storage, "getItem" | "setItem"> | null =
    typeof localStorage !== "undefined" ? localStorage : null
): void {
  if (!storage) return;
  const seen = loadRankHintsSeen(storage);
  if (seen.has(rank)) return;
  seen.add(rank);
  try {
    storage.setItem(RANK_HINTS_SEEN_STORAGE_KEY, JSON.stringify([...seen]));
  } catch {
    /* ignore */
  }
}

export function pickChallengeContextLine(
  challengeTargetYears: number,
  yearsSurvived: number
): GameOverContextLine {
  const text =
    yearsSurvived > challengeTargetYears
      ? `Challenge cleared: you outlasted your colleague's ${challengeTargetYears.toFixed(1)}y. HR is re-checking the math.`
      : `Challenge open: ${(challengeTargetYears - yearsSurvived).toFixed(1)}y short of your colleague's ${challengeTargetYears.toFixed(1)}y. The org chart remembers.`;
  return { text, variant: "default" };
}

export function pickRankProgressionContextLine(
  finalRank: Rank,
  rankHintsSeen: ReadonlySet<Rank>
): GameOverContextLine | null {
  if (finalRank === "Angel Investor") return null;
  if (rankHintsSeen.has(finalRank)) return null;
  const text = PROGRESSION_HINTS_LEAN[finalRank];
  if (!text) return null;
  return { text, variant: "default", markRankHint: finalRank };
}

export function pickSyncGameOverContextLine(input: {
  yearsSurvived: number;
  finalRank: Rank;
  challengeTargetYears: number | null;
  rankHintsSeen: ReadonlySet<Rank>;
}): GameOverContextLine | null {
  if (input.challengeTargetYears !== null) {
    return pickChallengeContextLine(input.challengeTargetYears, input.yearsSurvived);
  }
  return pickRankProgressionContextLine(input.finalRank, input.rankHintsSeen);
}

export function pickLeaderboardGapContextLine(input: {
  yearsSurvived: number;
  topYears: number | null;
  isCurrentUserTop: boolean;
  boardLabel: string;
}): GameOverContextLine | null {
  if (input.topYears !== null && input.topYears > input.yearsSurvived) {
    const gap = input.topYears - input.yearsSurvived;
    return {
      text: `#1 on ${input.boardLabel} is ${gap.toFixed(1)}y ahead`,
      variant: "leaderboard",
    };
  }
  if (input.isCurrentUserTop) {
    return {
      text: `You're #1 on ${input.boardLabel}.`,
      variant: "leaderboard",
    };
  }
  return null;
}

export function pickGameOverPunchline(input: {
  reapplyCount: number;
  finalRank: Rank;
  deathType: DeathType;
  terminationFlavor: string;
}): string {
  if (input.reapplyCount >= 10) {
    return REAPPLY_FLAVOR.find((tier) => tier.minRuns === 10)!.line;
  }
  if (input.reapplyCount >= 5) {
    return REAPPLY_FLAVOR.find((tier) => tier.minRuns === 5)!.line;
  }
  const retry =
    RETRY_TIPS_BY_RANK[input.finalRank]?.[input.deathType] ?? RETRY_TIPS[input.deathType];
  if (retry) return retry;
  return input.terminationFlavor;
}

export function formatStatBestDelta(
  yearsSurvived: number,
  previousBest: number,
  previousBestRank: Rank | null,
  pendingStamp: boolean
): StatBestDeltaResult {
  const baseClass = "text-nano font-bold mt-0.5";
  if (yearsSurvived > previousBest) {
    const delta = previousBest > 0 ? yearsSurvived - previousBest : yearsSurvived;
    const suffix = pendingStamp ? " (filing with HR…)" : "";
    return {
      text:
        previousBest > 0
          ? `+${delta.toFixed(1)} Years (new record!)${suffix}`
          : `New personal best!${suffix}`,
      className: `${baseClass} text-emerald-600`,
    };
  }
  if (previousBest > 0 && previousBestRank) {
    const delta = previousBest - yearsSurvived;
    return {
      text: `${delta.toFixed(1)}y short of best (${previousBestRank} @ ${previousBest.toFixed(1)}y)`,
      className: `${baseClass} text-slate-500`,
    };
  }
  return { text: "", className: `${baseClass} text-slate-500` };
}

export function formatTerminationDisplayDetail(deathType: DeathType, detail: string): string {
  return TERMINATION_DETAIL_DISPLAY[deathType] ?? detail;
}
