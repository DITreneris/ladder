import { describe, expect, it, vi } from "vitest";

import {
  BASE_DRAIN_RATE,
  CEO_YEARS,
  MANAGER_YEARS,
  REORG_INTERVAL_CEO_MS,
  REORG_INTERVAL_MS,
  TUTORIAL_RUNG_SPECS,
  allowedObstacleTypes,
  milestoneLabel,
  pickObstacleType,
  rankEmoji,
  rankFromYears,
  reorgIntervalForRank,
} from "./constants";

describe("rankFromYears", () => {
  it("returns Intern below manager threshold", () => {
    expect(rankFromYears(0)).toBe("Intern");
    expect(rankFromYears(9)).toBe("Intern");
    expect(rankFromYears(MANAGER_YEARS - 1)).toBe("Intern");
  });

  it("returns Manager at 10 years", () => {
    expect(rankFromYears(MANAGER_YEARS)).toBe("Manager");
    expect(rankFromYears(34)).toBe("Manager");
  });

  it("returns CEO at 35 years", () => {
    expect(rankFromYears(CEO_YEARS)).toBe("CEO");
    expect(rankFromYears(100)).toBe("CEO");
  });
});

describe("game tunables", () => {
  it("uses slower base drain than original prototype", () => {
    expect(BASE_DRAIN_RATE).toBeLessThan(1.0);
  });

  it("CEO reorg interval is faster than default", () => {
    expect(REORG_INTERVAL_CEO_MS).toBeLessThan(REORG_INTERVAL_MS);
  });
});

describe("obstacle gating", () => {
  it("intern only allows meetings", () => {
    expect(allowedObstacleTypes("Intern")).toEqual(["meeting"]);
  });

  it("intern allows reorg during reorg week preset", () => {
    expect(allowedObstacleTypes("Intern", true)).toEqual(["meeting", "reorg"]);
  });

  it("manager allows meetings, reorgs, and badge gates", () => {
    expect(allowedObstacleTypes("Manager")).toEqual(["meeting", "reorg", "badge_gate"]);
  });

  it("CEO allows meetings, reorgs, deadlines, and foliage", () => {
    expect(allowedObstacleTypes("CEO")).toEqual(["meeting", "reorg", "burnout", "foliage"]);
  });

  it("pickObstacleType returns only meeting for intern", () => {
    const spy = vi.spyOn(Math, "random").mockReturnValue(0.99);
    expect(pickObstacleType("Intern")).toBe("meeting");
    spy.mockRestore();
  });

  it("pickObstacleType can return reorg for intern when early reorg allowed", () => {
    const spy = vi.spyOn(Math, "random").mockReturnValue(0.55);
    expect(pickObstacleType("Intern", { allowEarlyReorg: true, meetingPickThreshold: 0.38 })).toBe("reorg");
    spy.mockRestore();
  });

  it("pickObstacleType can return badge_gate for manager", () => {
    const spy = vi.spyOn(Math, "random").mockReturnValue(0.9);
    expect(pickObstacleType("Manager")).toBe("badge_gate");
    spy.mockRestore();
  });

  it("pickObstacleType can return foliage for CEO", () => {
    const spy = vi.spyOn(Math, "random").mockReturnValue(0.95);
    expect(pickObstacleType("CEO")).toBe("foliage");
    spy.mockRestore();
  });

  it("tutorial rung specs only use left or right spawn", () => {
    for (const spec of TUTORIAL_RUNG_SPECS) {
      expect(spec.obstacle === null || spec.obstacle === "left" || spec.obstacle === "right").toBe(true);
      expect(spec.coffee === null || spec.coffee === "left" || spec.coffee === "right").toBe(true);
    }
  });

  it("reorgIntervalForRank returns CEO interval for CEO", () => {
    expect(reorgIntervalForRank("CEO")).toBe(REORG_INTERVAL_CEO_MS);
    expect(reorgIntervalForRank("Intern")).toBe(REORG_INTERVAL_MS);
  });
});

describe("milestoneLabel", () => {
  it("shows manager countdown for intern", () => {
    expect(milestoneLabel(0)).toBe("Manager in 10.0y");
    expect(milestoneLabel(5)).toBe("Manager in 5.0y");
  });

  it("shows CEO countdown for manager", () => {
    expect(milestoneLabel(MANAGER_YEARS)).toBe("CEO in 25.0y");
  });

  it("shows corner office for CEO", () => {
    expect(milestoneLabel(CEO_YEARS)).toBe("Corner office secured");
  });
});

describe("rankEmoji", () => {
  it("uses neutral manager emoji", () => {
    expect(rankEmoji("Manager")).toBe("🧑‍💼");
  });
});
