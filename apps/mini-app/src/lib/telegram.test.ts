/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from "vitest";
import { applyTelegramTheme } from "./telegram";

function mockTelegramTheme(themeParams: Record<string, string>): void {
  window.Telegram = {
    WebApp: {
      themeParams,
    },
  } as Window["Telegram"];
}

describe("applyTelegramTheme", () => {
  afterEach(() => {
    delete window.Telegram;
    document.documentElement.removeAttribute("style");
  });

  it("falls back --cl-header-text to text_color when header_text_color is missing", () => {
    mockTelegramTheme({
      header_bg_color: "#ffffff",
      text_color: "#000000",
    });

    applyTelegramTheme();

    expect(document.documentElement.style.getPropertyValue("--cl-header-text")).toBe("#000000");
  });

  it("prefers header_text_color when Telegram provides it", () => {
    mockTelegramTheme({
      header_text_color: "#ff0000",
      text_color: "#000000",
    });

    applyTelegramTheme();

    expect(document.documentElement.style.getPropertyValue("--cl-header-text")).toBe("#ff0000");
  });
});
