import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getTelegramAnalyticsAppName,
  TELEGRAM_ANALYTICS_APP_NAME,
} from "./telegram-analytics";

describe("telegram-analytics", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("defaults app name to corporate_ladder (TON Builders identifier)", () => {
    expect(TELEGRAM_ANALYTICS_APP_NAME).toBe("corporate_ladder");
    expect(getTelegramAnalyticsAppName()).toBe("corporate_ladder");
  });

  it("getTelegramAnalyticsAppName respects VITE_TELEGRAM_ANALYTICS_APP_NAME override", () => {
    vi.stubEnv("VITE_TELEGRAM_ANALYTICS_APP_NAME", "custom_id");
    vi.resetModules();
    return import("./telegram-analytics").then(({ getTelegramAnalyticsAppName: appName }) => {
      expect(appName()).toBe("custom_id");
    });
  });
});
