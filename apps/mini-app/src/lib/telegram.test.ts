/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  applyTelegramTheme,
  canNativeShare,
  isSecondaryButtonSupported,
  isTelegramBottomBarActive,
  sharePreparedMessage,
  syncTelegramBottomBar,
} from "./telegram";

function mockTelegramTheme(
  themeParams: Record<string, string>,
  colorScheme: "light" | "dark" = "light"
): void {
  window.Telegram = {
    WebApp: {
      themeParams,
      colorScheme,
    },
  } as unknown as Window["Telegram"];
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

describe("canNativeShare", () => {
  afterEach(() => {
    delete window.Telegram;
  });

  it("returns false when shareMessage unavailable", () => {
    expect(canNativeShare()).toBe(false);
  });

  it("returns true when shareMessage exists and version is 8.0+", () => {
    window.Telegram = {
      WebApp: {
        shareMessage: vi.fn(),
        isVersionAtLeast: (version: string) => version === "8.0",
      },
    } as unknown as Window["Telegram"];
    expect(canNativeShare()).toBe(true);
  });

  it("returns false when Telegram client is below 8.0", () => {
    window.Telegram = {
      WebApp: {
        shareMessage: vi.fn(),
        isVersionAtLeast: () => false,
      },
    } as unknown as Window["Telegram"];
    expect(canNativeShare()).toBe(false);
  });
});

describe("sharePreparedMessage", () => {
  afterEach(() => {
    delete window.Telegram;
    vi.useRealTimers();
  });

  it("returns false when shareMessage unavailable", async () => {
    await expect(sharePreparedMessage("msg-id")).resolves.toBe(false);
  });

  it("passes prepared message id to WebApp.shareMessage", async () => {
    let sharedId = "";
    window.Telegram = {
      WebApp: {
        shareMessage: (msgId: string, callback?: (sent: boolean) => void) => {
          sharedId = msgId;
          callback?.(true);
        },
        onEvent: vi.fn(),
        offEvent: vi.fn(),
      },
    } as unknown as Window["Telegram"];

    await expect(sharePreparedMessage("prepared-123")).resolves.toBe(true);
    expect(sharedId).toBe("prepared-123");
  });

  it("resolves false when callback reports decline", async () => {
    window.Telegram = {
      WebApp: {
        shareMessage: (_msgId: string, callback?: (sent: boolean) => void) => {
          callback?.(false);
        },
        onEvent: vi.fn(),
        offEvent: vi.fn(),
      },
    } as unknown as Window["Telegram"];

    await expect(sharePreparedMessage("prepared-456")).resolves.toBe(false);
  });

  it("resolves true on shareMessageSent event", async () => {
    const handlers: Record<string, () => void> = {};
    window.Telegram = {
      WebApp: {
        shareMessage: vi.fn(),
        onEvent: (event: string, handler: () => void) => {
          handlers[event] = handler;
        },
        offEvent: vi.fn(),
      },
    } as unknown as Window["Telegram"];

    const promise = sharePreparedMessage("prepared-789");
    handlers.shareMessageSent?.();
    await expect(promise).resolves.toBe(true);
  });

  it("resolves false on shareMessageFailed event", async () => {
    const handlers: Record<string, () => void> = {};
    window.Telegram = {
      WebApp: {
        shareMessage: vi.fn(),
        onEvent: (event: string, handler: () => void) => {
          handlers[event] = handler;
        },
        offEvent: vi.fn(),
      },
    } as unknown as Window["Telegram"];

    const promise = sharePreparedMessage("prepared-fail");
    handlers.shareMessageFailed?.();
    await expect(promise).resolves.toBe(false);
  });
});

function mockTelegramWebApp(overrides: Record<string, unknown> = {}): void {
  const mainButton = {
    show: vi.fn(),
    hide: vi.fn(),
    enable: vi.fn(),
    disable: vi.fn(),
    setText: vi.fn(),
    onClick: vi.fn(),
    offClick: vi.fn(),
    showProgress: vi.fn(),
    hideProgress: vi.fn(),
  };
  const secondaryButton = {
    show: vi.fn(),
    hide: vi.fn(),
    enable: vi.fn(),
    disable: vi.fn(),
    setText: vi.fn(),
    onClick: vi.fn(),
    offClick: vi.fn(),
    showProgress: vi.fn(),
    hideProgress: vi.fn(),
    setParams: vi.fn(),
  };

  window.Telegram = {
    WebApp: {
      initData: "mock-init",
      themeParams: {},
      MainButton: mainButton,
      SecondaryButton: secondaryButton,
      isVersionAtLeast: (version: string) => version === "7.10" || version === "8.0",
      ...overrides,
    },
  } as unknown as Window["Telegram"];
}

describe("syncTelegramBottomBar", () => {
  afterEach(() => {
    delete window.Telegram;
    document.documentElement.classList.remove(
      "cl-in-telegram",
      "cl-tg-secondary-share",
      "cl-tg-bottom-bar-visible"
    );
  });

  it("shows home MainButton text and handler", () => {
    mockTelegramWebApp();
    document.documentElement.classList.add("cl-in-telegram");
    const onPlay = vi.fn();

    syncTelegramBottomBar({ mode: "home", onPlay });

    const mb = window.Telegram!.WebApp.MainButton;
    expect(mb.setText).toHaveBeenCalledWith("PUNCH IN & CLIMB");
    expect(mb.show).toHaveBeenCalled();
    expect(mb.onClick).toHaveBeenCalledWith(onPlay);
    expect(isTelegramBottomBarActive()).toBe(true);
  });

  it("shows game-over MainButton and SecondaryButton when share handler provided", () => {
    mockTelegramWebApp();
    document.documentElement.classList.add("cl-in-telegram");
    const onReapply = vi.fn();
    const onShare = vi.fn();

    syncTelegramBottomBar({ mode: "gameover", onReapply, onShare });

    const mb = window.Telegram!.WebApp.MainButton;
    const sb = window.Telegram!.WebApp.SecondaryButton!;
    expect(mb.setText).toHaveBeenCalledWith("RE-APPLY FOR ROLE");
    expect(mb.show).toHaveBeenCalled();
    expect(sb.setParams).toHaveBeenCalledWith(
      expect.objectContaining({ text: "Share", position: "left", is_visible: true })
    );
    expect(sb.show).toHaveBeenCalled();
    expect(document.documentElement.classList.contains("cl-tg-secondary-share")).toBe(true);
  });

  it("hides bottom bar and clears classes on hidden mode", () => {
    mockTelegramWebApp();
    document.documentElement.classList.add("cl-in-telegram");
    syncTelegramBottomBar({ mode: "home", onPlay: vi.fn() });

    syncTelegramBottomBar({ mode: "hidden" });

    expect(window.Telegram!.WebApp.MainButton.hide).toHaveBeenCalled();
    expect(isTelegramBottomBarActive()).toBe(false);
    expect(document.documentElement.classList.contains("cl-tg-secondary-share")).toBe(false);
  });
});

describe("isSecondaryButtonSupported", () => {
  afterEach(() => {
    delete window.Telegram;
  });

  it("returns false without Telegram initData", () => {
    expect(isSecondaryButtonSupported()).toBe(false);
  });

  it("returns true when SecondaryButton exists and version is 7.10+", () => {
    mockTelegramWebApp();
    expect(isSecondaryButtonSupported()).toBe(true);
  });

  it("returns false when client is below 7.10", () => {
    mockTelegramWebApp({
      isVersionAtLeast: () => false,
    });
    expect(isSecondaryButtonSupported()).toBe(false);
  });
});
