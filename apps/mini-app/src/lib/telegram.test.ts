/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from "vitest";
import { applyTelegramTheme, shareText } from "./telegram";

function mockTelegramTheme(
  themeParams: Record<string, string>,
  colorScheme: "light" | "dark" = "light"
): void {
  window.Telegram = {
    WebApp: {
      themeParams,
      colorScheme,
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

  it("forces a light viewport when Telegram colorScheme is dark", () => {
    mockTelegramTheme(
      {
        bg_color: "#000000",
        secondary_bg_color: "#1c1c1d",
        text_color: "#ffffff",
      },
      "dark"
    );

    applyTelegramTheme();

    expect(document.documentElement.classList.contains("cl-tg-dark")).toBe(true);
    expect(document.documentElement.style.getPropertyValue("--cl-secondary-bg")).toBe("#f8fafc");
  });
});

describe("shareText", () => {
  afterEach(() => {
    delete window.Telegram;
  });

  it("returns false when shareMessage unavailable", () => {
    expect(shareText("hello")).toBe(false);
  });

  it("calls WebApp.shareMessage when available", () => {
    let shared = "";
    window.Telegram = {
      WebApp: {
        shareMessage: ({ text }: { text: string }) => {
          shared = text;
        },
      },
    } as Window["Telegram"];
    expect(shareText("review")).toBe(true);
    expect(shared).toBe("review");
  });
});
