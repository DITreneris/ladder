import { describe, expect, it } from "vitest";
import { nextHighScoreAfterSubmit } from "./score-trust";

describe("nextHighScoreAfterSubmit", () => {
  it("does not update high score when submit fails", () => {
    expect(nextHighScoreAfterSubmit(5, 12, false)).toBe(5);
  });

  it("updates high score after successful submit when run beats career high", () => {
    expect(nextHighScoreAfterSubmit(5, 12, true)).toBe(12);
  });

  it("prefers server profile best after successful submit", () => {
    expect(nextHighScoreAfterSubmit(5, 12, true, 10)).toBe(10);
  });

  it("keeps current high when successful submit but run is lower", () => {
    expect(nextHighScoreAfterSubmit(15, 12, true)).toBe(15);
  });
});
