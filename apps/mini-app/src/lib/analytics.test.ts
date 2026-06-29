import { describe, expect, it, vi } from "vitest";

describe("trackEvent", () => {
  it("no-ops when analytics token unset", async () => {
    vi.stubEnv("VITE_TELEGRAM_ANALYTICS_TOKEN", "");
    const { trackEvent } = await import("./analytics");
    expect(() => trackEvent("share_tap")).not.toThrow();
    vi.unstubAllEnvs();
  });

  it("accepts the monetization funnel events without throwing", async () => {
    vi.stubEnv("VITE_TELEGRAM_ANALYTICS_TOKEN", "");
    const { trackEvent } = await import("./analytics");
    const events = [
      "game_start",
      "game_finish",
      "score_submitted",
      "leaderboard_viewed",
      "return_session",
      "ad_shown",
      "ad_completed",
    ] as const;
    for (const name of events) {
      expect(() => trackEvent(name, { sample: 1 })).not.toThrow();
    }
    vi.unstubAllEnvs();
  });
});
