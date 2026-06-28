import { describe, expect, it } from "vitest";
import {
  buildChallengeLink,
  buildShareCardDescription,
  buildShareMessageText,
  shortDeathTag,
} from "./share-copy";

describe("share-copy", () => {
  const base = {
    yearsSurvived: 12.5,
    finalRank: "Manager",
    terminationDetail: "Reply-All collision on rung 14",
    terminationFlavor: "Your synergy did not scale optimally with our paradigms.",
    deathType: "meeting",
  };

  it("buildShareMessageText uses status-first 3-line hook", () => {
    const text = buildShareMessageText(base);
    const lines = text.split("\n");
    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe("I survived 12.5y as Manager before a meeting ran long.");
    expect(lines[1]).toBe("Think you can climb higher? 👇");
    expect(lines[2]).toContain("startapp=c_125");
    expect(text).not.toContain("Employee:");
    expect(text).not.toContain("Prompt Anatomy");
  });

  it("shortDeathTag maps death types and falls back", () => {
    expect(shortDeathTag("reorg")).toBe("before a reorg erased me");
    expect(shortDeathTag("unknown")).toBe("before HR caught up");
  });

  it("buildChallengeLink encodes years", () => {
    expect(buildChallengeLink(20.8, "CorporateLadder_bot")).toBe(
      "https://t.me/CorporateLadder_bot?startapp=c_208",
    );
  });

  it("buildShareCardDescription includes PA suffix only on card", () => {
    const desc = buildShareCardDescription(base.terminationDetail, base.terminationFlavor);
    expect(desc).toContain("Reply-All collision");
    expect(desc).toContain("Built with Prompt Anatomy");
    expect(desc).not.toContain("https://");
  });

  it("sprint death uses sprint tag in body", () => {
    const text = buildShareMessageText({ ...base, deathType: "sprint" });
    expect(text).toContain("before the sprint buzzer");
  });
});
