import { describe, expect, it } from "vitest";
import {
  formatStatBestDelta,
  formatTerminationDisplayDetail,
  loadRankHintsSeen,
  markRankHintSeen,
  pickChallengeContextLine,
  pickGameOverPunchline,
  pickLeaderboardGapContextLine,
  pickRankProgressionContextLine,
  pickSyncGameOverContextLine,
} from "./game-over-copy";

describe("game-over-copy", () => {
  const memoryStorage = (): Storage => {
    const map = new Map<string, string>();
    return {
      get length() {
        return map.size;
      },
      clear: () => map.clear(),
      getItem: (key) => map.get(key) ?? null,
      key: (index) => [...map.keys()][index] ?? null,
      removeItem: (key) => map.delete(key),
      setItem: (key, value) => map.set(key, value),
    };
  };

  it("pickSyncGameOverContextLine prefers challenge over rank hint", () => {
    const line = pickSyncGameOverContextLine({
      yearsSurvived: 2,
      finalRank: "Intern",
      challengeTargetYears: 5,
      rankHintsSeen: new Set(),
    });
    expect(line?.text).toContain("Challenge open");
  });

  it("pickRankProgressionContextLine shows once per rank", () => {
    const first = pickRankProgressionContextLine("Intern", new Set());
    expect(first?.text).toContain("Director @ 20y");
    expect(first?.markRankHint).toBe("Intern");

    const second = pickRankProgressionContextLine("Intern", new Set(["Intern"]));
    expect(second).toBeNull();
  });

  it("pickRankProgressionContextLine skips Angel Investor", () => {
    expect(pickRankProgressionContextLine("Angel Investor", new Set())).toBeNull();
  });

  it("pickLeaderboardGapContextLine formats gap and #1 self", () => {
    expect(
      pickLeaderboardGapContextLine({
        yearsSurvived: 2.5,
        topYears: 28.3,
        isCurrentUserTop: false,
        boardLabel: "today's board",
      })?.text
    ).toBe("#1 on today's board is 25.8y ahead");

    expect(
      pickLeaderboardGapContextLine({
        yearsSurvived: 12,
        topYears: 12,
        isCurrentUserTop: true,
        boardLabel: "today's board",
      })?.variant
    ).toBe("leaderboard");
  });

  it("pickGameOverPunchline prioritizes reapply tiers then retry tip", () => {
    expect(
      pickGameOverPunchline({
        reapplyCount: 10,
        finalRank: "Intern",
        deathType: "meeting",
        terminationFlavor: "flavor",
      })
    ).toContain("frequent-reapply");

    expect(
      pickGameOverPunchline({
        reapplyCount: 5,
        finalRank: "Intern",
        deathType: "meeting",
        terminationFlavor: "flavor",
      })
    ).toContain("auto-generated");

    expect(
      pickGameOverPunchline({
        reapplyCount: 1,
        finalRank: "Intern",
        deathType: "meeting",
        terminationFlavor: "flavor",
      })
    ).toContain("calendar");
  });

  it("formatStatBestDelta covers PB, short-of-best, and empty", () => {
    expect(formatStatBestDelta(5, 3, "Intern", false).text).toContain("new record");
    expect(formatStatBestDelta(5, 3, "Intern", true).text).toContain("(filing with HR…)");
    expect(formatStatBestDelta(2, 5, "Manager", false).text).toBe(
      "3.0y short of best (Manager @ 5.0y)"
    );
    expect(formatStatBestDelta(2, 0, null, false).text).toBe("New personal best!");
    expect(formatStatBestDelta(0, 0, null, false).text).toBe("");
  });

  it("formatTerminationDisplayDetail shortens by death type", () => {
    expect(formatTerminationDisplayDetail("meeting", "long original")).toContain("All-hands");
    expect(formatTerminationDisplayDetail("unknown" as "meeting", "fallback detail")).toBe(
      "fallback detail"
    );
  });

  it("markRankHintSeen persists ranks", () => {
    const storage = memoryStorage();
    markRankHintSeen("Director", storage);
    markRankHintSeen("Director", storage);
    expect(loadRankHintsSeen(storage)).toEqual(new Set(["Director"]));
  });

  it("pickChallengeContextLine handles cleared challenge", () => {
    const line = pickChallengeContextLine(3, 4.2);
    expect(line.text).toContain("Challenge cleared");
  });
});
