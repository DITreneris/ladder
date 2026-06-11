import { describe, expect, it, vi } from "vitest";

describe("trackEvent", () => {
  it("no-ops when analytics token unset", async () => {
    vi.stubEnv("VITE_TELEGRAM_ANALYTICS_TOKEN", "");
    const { trackEvent } = await import("./analytics");
    expect(() => trackEvent("share_tap")).not.toThrow();
    vi.unstubAllEnvs();
  });
});
