import { describe, expect, it } from "vitest";
import {
  buildChallengeLink,
  buildShareCardDescription,
  buildShareMessageText,
  pickDeathLine,
} from "./share-copy";

describe("share-copy", () => {
  const base = {
    yearsSurvived: 12.5,
    finalRank: "Manager",
    terminationDetail: "Reply-All collision on rung 14",
    terminationFlavor: "Your synergy did not scale optimally with our paradigms.",
    deathType: "meeting",
  };

  it("buildShareMessageText uses 3-line Variant A hook", () => {
    const text = buildShareMessageText(base);
    const lines = text.split("\n");
    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe("Manager · 12.5y — Your synergy did not scale optimally with our paradigms.");
    expect(lines[1]).toBe("Think you can outlast me?");
    expect(lines[2]).toContain("startapp=c_125");
    expect(text).not.toContain("Employee:");
    expect(text).not.toContain("Prompt Anatomy");
  });

  it("pickDeathLine prefers short flavor", () => {
    expect(pickDeathLine("long detail sentence.", "Short flavor.")).toBe("Short flavor");
  });

  it("pickDeathLine falls back to first sentence of detail", () => {
    const longFlavor = "x".repeat(100);
    expect(pickDeathLine("First sentence. Second sentence.", longFlavor)).toBe("First sentence");
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

  it("sprint death uses sprint line in body", () => {
    const text = buildShareMessageText({ ...base, deathType: "sprint" });
    expect(text).toContain("Sprint archived at the buzzer");
  });
});
