import { describe, expect, it } from "vitest";
import { describeNextRung, describeTapResult, getSafeTapSide, INTERN_HINT_RUNGS, shouldShowImminentHint } from "./debug";
import type { Rung } from "../game/types";

describe("debug helpers", () => {
  it("describes obstacle rung with safe side", () => {
    const rung: Rung = { id: 1, obstacle: "right", type: "meeting", coffee: null };
    expect(describeNextRung(rung)).toBe("Next rung: Meeting on RIGHT → tap LEFT");
  });

  it("describes coffee rung", () => {
    const rung: Rung = { id: 2, obstacle: null, type: null, coffee: "left" };
    expect(describeNextRung(rung)).toContain("Coffee on LEFT");
  });

  it("describes safe climb past meeting", () => {
    const rung: Rung = { id: 3, obstacle: "right", type: "meeting", coffee: null };
    expect(describeTapResult("left", rung, "climb")).toContain("safe climb");
  });

  it("describes death on obstacle side", () => {
    const rung: Rung = { id: 4, obstacle: "left", type: "meeting", coffee: null };
    expect(describeTapResult("left", rung, "death")).toContain("GAME OVER");
  });

  it("getSafeTapSide returns opposite of obstacle", () => {
    const rung: Rung = { id: 5, obstacle: "right", type: "meeting", coffee: null };
    expect(getSafeTapSide(rung)).toBe("left");
  });

  it("getSafeTapSide returns coffee side", () => {
    const rung: Rung = { id: 6, obstacle: null, type: null, coffee: "left" };
    expect(getSafeTapSide(rung)).toBe("left");
  });

  it("getSafeTapSide returns null for clear rung", () => {
    const rung: Rung = { id: 7, obstacle: null, type: null, coffee: null };
    expect(getSafeTapSide(rung)).toBeNull();
  });
});

describe("shouldShowImminentHint", () => {
  it("shows hints through Intern phase (40 rungs)", () => {
    expect(INTERN_HINT_RUNGS).toBe(40);
    expect(shouldShowImminentHint(0)).toBe(true);
    expect(shouldShowImminentHint(20)).toBe(true);
    expect(shouldShowImminentHint(39)).toBe(true);
    expect(shouldShowImminentHint(40)).toBe(false);
    expect(shouldShowImminentHint(50)).toBe(false);
  });
});
