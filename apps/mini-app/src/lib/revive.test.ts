import { describe, expect, it, vi } from "vitest";
import type { GameOverResult } from "../game/types";
import {
  buildReviveCopy,
  hasReviveStakeSignal,
  leaderboardGapToFirst,
  shouldOfferRevive,
} from "./revive";

vi.mock("./adsgram", () => ({
  isReviveFeatureEnabled: () => true,
}));

const baseResult: GameOverResult = {
  yearsSurvived: 10,
  finalRank: "Manager",
  rungsClimbed: 40,
  terminationCause: "Meeting Overload",
  terminationDetail: "detail",
  terminationFlavor: "flavor",
  deathType: "meeting",
  runStartedAt: Date.now() - 60_000,
};

describe("shouldOfferRevive", () => {
  it("offers for meaningful run", () => {
    expect(
      shouldOfferRevive(baseResult, { highScore: 5, reviveUsedThisRun: false, leaderboardGap: null })
    ).toBe(true);
  });

  it("rejects sprint death", () => {
    expect(
      shouldOfferRevive(
        { ...baseResult, deathType: "sprint", yearsSurvived: 12 },
        { highScore: 0, reviveUsedThisRun: false, leaderboardGap: null }
      )
    ).toBe(false);
  });

  it("rejects tutorial-length runs", () => {
    expect(
      shouldOfferRevive(
        { ...baseResult, yearsSurvived: 2 },
        { highScore: 20, reviveUsedThisRun: false, leaderboardGap: null }
      )
    ).toBe(false);
  });

  it("rejects when revive already used", () => {
    expect(
      shouldOfferRevive(baseResult, { highScore: 20, reviveUsedThisRun: true, leaderboardGap: null })
    ).toBe(false);
  });

  it("offers when near personal best", () => {
    expect(
      shouldOfferRevive(
        { ...baseResult, yearsSurvived: 9 },
        { highScore: 10.5, reviveUsedThisRun: false, leaderboardGap: null }
      )
    ).toBe(true);
  });

  it("offers when near leaderboard #1", () => {
    expect(
      shouldOfferRevive(
        { ...baseResult, yearsSurvived: 7 },
        { highScore: 3, reviveUsedThisRun: false, leaderboardGap: 2.5 }
      )
    ).toBe(true);
  });

  it("rejects low-stakes mid run without stake signals", () => {
    expect(
      shouldOfferRevive(
        { ...baseResult, yearsSurvived: 5 },
        { highScore: 20, reviveUsedThisRun: false, leaderboardGap: 10 }
      )
    ).toBe(false);
  });

  it("offers first-run near PB at 5y (v2.2 gate)", () => {
    expect(
      shouldOfferRevive(
        { ...baseResult, yearsSurvived: 5 },
        { highScore: 7.5, reviveUsedThisRun: false, leaderboardGap: null, reapplyCount: 0 }
      )
    ).toBe(true);
  });
});

describe("buildReviveCopy", () => {
  it("prefers leaderboard gap copy", () => {
    const copy = buildReviveCopy(baseResult, {
      highScore: 15,
      reviveUsedThisRun: false,
      leaderboardGap: 1.2,
    });
    expect(copy.subline).toContain("1.2y from #1");
  });

  it("uses career high copy when close to PB", () => {
    const copy = buildReviveCopy(
      { ...baseResult, yearsSurvived: 9.5 },
      { highScore: 10, reviveUsedThisRun: false, leaderboardGap: null }
    );
    expect(copy.subline).toContain("career high");
  });
});

describe("leaderboardGapToFirst", () => {
  it("returns gap behind leader", () => {
    expect(leaderboardGapToFirst(baseResult, 12.5, false)).toBe(2.5);
  });

  it("returns null when user is #1", () => {
    expect(leaderboardGapToFirst(baseResult, 12, true)).toBeNull();
  });
});

describe("hasReviveStakeSignal", () => {
  it("detects meaningful run threshold", () => {
    expect(
      hasReviveStakeSignal({ ...baseResult, yearsSurvived: 8 }, {
        highScore: 0,
        reviveUsedThisRun: false,
        leaderboardGap: null,
      })
    ).toBe(true);
  });
});
