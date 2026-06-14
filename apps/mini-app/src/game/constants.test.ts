import { describe, expect, it, vi } from "vitest";

import {
  ANGEL_FAKE_PROMO,
  ANGEL_YEARS,
  BASE_DRAIN_RATE,
  BOARD_FAKE_PROMO,
  BOARD_YEARS,
  CEO_YEARS,
  DIRECTOR_YEARS,
  MANAGER_YEARS,
  REORG_INTERVAL_CEO_MS,
  REORG_INTERVAL_MS,
  TUTORIAL_RUNG_SPECS,
  allowedObstacleTypes,
  isExecutiveRank,
  milestoneLabel,
  obstacleBadgeDisplay,
  pickObstacleType,
  formatTickerMarqueeText,
  pickTickerHeadlineSet,
  TICKER_MARQUEE_SEPARATOR,
  tickerMarqueeDurationSec,
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

  it("returns Manager at 10 years up to director threshold", () => {
    expect(rankFromYears(MANAGER_YEARS)).toBe("Manager");
    expect(rankFromYears(DIRECTOR_YEARS - 1)).toBe("Manager");
  });

  it("returns Director at 20 years up to CEO threshold", () => {
    expect(rankFromYears(DIRECTOR_YEARS)).toBe("Director");
    expect(rankFromYears(34)).toBe("Director");
    expect(rankFromYears(CEO_YEARS - 1)).toBe("Director");
  });

  it("returns CEO at 35 years up to board threshold", () => {
    expect(rankFromYears(CEO_YEARS)).toBe("CEO");
    expect(rankFromYears(BOARD_YEARS - 1)).toBe("CEO");
  });

  it("returns Board Member at 50 years up to angel threshold", () => {
    expect(rankFromYears(BOARD_YEARS)).toBe("Board Member");
    expect(rankFromYears(ANGEL_YEARS - 1)).toBe("Board Member");
  });

  it("returns Angel Investor at 75 years", () => {
    expect(rankFromYears(ANGEL_YEARS)).toBe("Angel Investor");
    expect(rankFromYears(100)).toBe("Angel Investor");
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

  it("director allows meetings, reorgs, badge gates, and deadlines", () => {
    expect(allowedObstacleTypes("Director")).toEqual(["meeting", "reorg", "badge_gate", "burnout"]);
  });

  it("CEO allows meetings, reorgs, deadlines, and foliage", () => {
    expect(allowedObstacleTypes("CEO")).toEqual(["meeting", "reorg", "burnout", "foliage"]);
  });

  it("board and angel inherit executive obstacle pool", () => {
    expect(allowedObstacleTypes("Board Member")).toEqual(["meeting", "reorg", "burnout", "foliage"]);
    expect(allowedObstacleTypes("Angel Investor")).toEqual(["meeting", "reorg", "burnout", "foliage"]);
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

  it("pickObstacleType weights favor meetings for Board Member at low roll", () => {
    const spy = vi.spyOn(Math, "random").mockReturnValue(0.1);
    expect(pickObstacleType("Board Member")).toBe("meeting");
    spy.mockRestore();
  });

  it("pickObstacleType weights favor foliage for Angel Investor at high roll", () => {
    const spy = vi.spyOn(Math, "random").mockReturnValue(0.96);
    expect(pickObstacleType("Angel Investor")).toBe("foliage");
    spy.mockRestore();
  });

  it("board and angel fake promo arrays are populated", () => {
    expect(BOARD_FAKE_PROMO.length).toBeGreaterThan(0);
    expect(ANGEL_FAKE_PROMO.length).toBeGreaterThan(0);
  });

  it("pickObstacleType can return burnout for Director", () => {
    const spy = vi.spyOn(Math, "random").mockReturnValue(0.95);
    expect(pickObstacleType("Director")).toBe("burnout");
    spy.mockRestore();
  });

  it("pickObstacleType never returns foliage for Director", () => {
    expect(allowedObstacleTypes("Director")).not.toContain("foliage");
  });

  it("tutorial rung specs only use left or right spawn", () => {
    for (const spec of TUTORIAL_RUNG_SPECS) {
      expect(spec.obstacle === null || spec.obstacle === "left" || spec.obstacle === "right").toBe(true);
      expect(spec.coffee === null || spec.coffee === "left" || spec.coffee === "right").toBe(true);
    }
  });

  it("reorgIntervalForRank returns CEO interval for executive ranks", () => {
    expect(reorgIntervalForRank("CEO")).toBe(REORG_INTERVAL_CEO_MS);
    expect(reorgIntervalForRank("Board Member")).toBe(REORG_INTERVAL_CEO_MS);
    expect(reorgIntervalForRank("Angel Investor")).toBe(REORG_INTERVAL_CEO_MS);
    expect(reorgIntervalForRank("Director")).toBe(REORG_INTERVAL_MS);
    expect(reorgIntervalForRank("Intern")).toBe(REORG_INTERVAL_MS);
  });

  it("isExecutiveRank covers CEO and post-CEO ranks", () => {
    expect(isExecutiveRank("CEO")).toBe(true);
    expect(isExecutiveRank("Board Member")).toBe(true);
    expect(isExecutiveRank("Angel Investor")).toBe(true);
    expect(isExecutiveRank("Director")).toBe(false);
  });
});

describe("milestoneLabel", () => {
  it("shows manager countdown for intern", () => {
    expect(milestoneLabel(0)).toBe("Manager in 10.0y");
    expect(milestoneLabel(5)).toBe("Manager in 5.0y");
  });

  it("shows director countdown for manager", () => {
    expect(milestoneLabel(MANAGER_YEARS)).toBe("Director in 10.0y");
  });

  it("shows CEO countdown for director", () => {
    expect(milestoneLabel(DIRECTOR_YEARS)).toBe("CEO myth in 15.0y");
  });

  it("shows board seat countdown for CEO band", () => {
    expect(milestoneLabel(CEO_YEARS)).toBe("Board seat in 15.0y");
  });

  it("shows angel countdown for board band", () => {
    expect(milestoneLabel(BOARD_YEARS)).toBe("Angel round in 25.0y");
  });

  it("shows capstone for angel investor", () => {
    expect(milestoneLabel(ANGEL_YEARS)).toBe("Term sheet signed");
  });
});

describe("rankEmoji", () => {
  it("uses neutral manager emoji", () => {
    expect(rankEmoji("Manager")).toBe("🧑‍💼");
  });
});

describe("pickTickerHeadlineSet", () => {
  const internOpts = { presetId: "standard" as const, careerBestYears: 0, utcDate: new Date("2026-06-14T12:00:00Z") };
  const directorOpts = { presetId: "standard" as const, careerBestYears: 25, utcDate: new Date("2026-06-14T12:00:00Z") };

  it("returns a deterministic set for the same UTC day and career band", () => {
    const a = pickTickerHeadlineSet(internOpts);
    const b = pickTickerHeadlineSet(internOpts);
    expect(a.map((h) => h.text)).toEqual(b.map((h) => h.text));
  });

  it("returns up to TICKER_DAILY_COUNT unique headlines", () => {
    const set = pickTickerHeadlineSet(internOpts);
    expect(set.length).toBeGreaterThan(0);
    expect(set.length).toBeLessThanOrEqual(4);
    expect(new Set(set.map((h) => h.text)).size).toBe(set.length);
  });

  it("may differ across UTC dates", () => {
    const a = pickTickerHeadlineSet(internOpts);
    const b = pickTickerHeadlineSet({
      ...internOpts,
      utcDate: new Date("2026-06-15T12:00:00Z"),
    });
    expect(a.map((h) => h.text).join("|")).not.toBe(b.map((h) => h.text).join("|"));
  });

  it("pins meeting_monday shift lead on Meeting Monday preset", () => {
    const set = pickTickerHeadlineSet({
      presetId: "meeting_monday",
      careerBestYears: 0,
      utcDate: new Date("2026-06-09T12:00:00Z"),
    });
    expect(set[0]?.text).toContain("Meeting Monday");
    expect(set[0]?.deathType).toBe("meeting");
  });

  it("excludes director-only deaths for intern career best", () => {
    const set = pickTickerHeadlineSet(internOpts);
    for (const headline of set) {
      expect(headline.deathType).not.toBe("burnout");
      expect(headline.deathType).not.toBe("foliage");
      expect(headline.deathType).not.toBe("badge_gate");
    }
  });

  it("allows burnout headlines for director career best", () => {
    const set = pickTickerHeadlineSet(directorOpts);
    expect(set.some((h) => h.deathType === "burnout")).toBe(true);
  });

  it("pins synergy sprint lead on sprint preset", () => {
    const set = pickTickerHeadlineSet({
      presetId: "synergy_sprint",
      careerBestYears: 12,
      utcDate: new Date("2026-06-13T12:00:00Z"),
    });
    expect(set[0]?.deathType).toBe("sprint");
  });
});

describe("formatTickerMarqueeText", () => {
  it("joins headlines with marquee separator", () => {
    const text = formatTickerMarqueeText([
      { text: "Alpha", deathType: "meeting" },
      { text: "Beta", deathType: "energy" },
    ]);
    expect(text).toBe(`* Alpha *${TICKER_MARQUEE_SEPARATOR}* Beta *`);
  });
});

describe("tickerMarqueeDurationSec", () => {
  it("clamps short strips to 30s minimum", () => {
    expect(tickerMarqueeDurationSec("short")).toBe(30);
  });

  it("clamps very long strips to 60s maximum", () => {
    expect(tickerMarqueeDurationSec("x".repeat(1000))).toBe(60);
  });

  it("scales mid-length strips between clamps", () => {
    expect(tickerMarqueeDurationSec("x".repeat(400))).toBe(48);
  });
});

describe("obstacleBadgeDisplay", () => {
  it("returns board governance labels", () => {
    expect(obstacleBadgeDisplay("meeting", "Board Member").label).toBe("Quorum");
    expect(obstacleBadgeDisplay("burnout", "Board Member").label).toBe("Filing");
  });

  it("returns angel investor labels", () => {
    expect(obstacleBadgeDisplay("meeting", "Angel Investor").label).toBe("Pitch");
    expect(obstacleBadgeDisplay("foliage", "Angel Investor").label).toBe("Wellness");
  });

  it("keeps meeting monday reskin ahead of rank labels", () => {
    expect(
      obstacleBadgeDisplay("meeting", "Board Member", { dailyModifierId: "meeting_monday", rungId: 0 }).label
    ).toBe("Reply-All");
  });

  it("shows frozen label for imminent reorg", () => {
    expect(obstacleBadgeDisplay("reorg", "CEO", { isImminent: true }).label).toBe("Frozen");
  });
});
