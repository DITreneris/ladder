import { describe, expect, it } from "vitest";
import { describeNextRung, describeTapResult } from "./debug";
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
});
