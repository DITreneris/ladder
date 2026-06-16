export interface TelegramUser {
  id: number;
  username?: string;
  first_name?: string;
}

type HapticImpact = "light" | "medium" | "heavy" | "rigid" | "soft";
type HapticNotification = "error" | "success" | "warning";

interface SafeAreaInset {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

interface TelegramBackButton {
  show: () => void;
  hide: () => void;
  onClick: (callback: () => void) => void;
  offClick: (callback: () => void) => void;
}

interface TelegramBottomButtonParams {
  text?: string;
  color?: string;
  text_color?: string;
  is_visible?: boolean;
  is_active?: boolean;
  is_progress_visible?: boolean;
  position?: "left" | "right" | "top" | "bottom";
}

interface TelegramBottomButton {
  show: () => void;
  hide: () => void;
  enable: () => void;
  disable: () => void;
  setText: (text: string) => void;
  onClick: (callback: () => void) => void;
  offClick: (callback: () => void) => void;
  showProgress?: (leaveActive?: boolean) => void;
  hideProgress?: () => void;
  setParams?: (params: TelegramBottomButtonParams) => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        initData: string;
        initDataUnsafe: { user?: TelegramUser; start_param?: string };
        isVersionAtLeast?: (version: string) => boolean;
        shareMessage?: (msgId: string, callback?: (sent: boolean) => void) => void;
        openLink?: (url: string, options?: { try_instant_view?: boolean }) => void;
        openTelegramLink?: (url: string) => void;
        MainButton: TelegramBottomButton;
        SecondaryButton?: TelegramBottomButton;
        BackButton?: TelegramBackButton;
        themeParams: Record<string, string>;
        colorScheme?: "light" | "dark";
        safeAreaInset?: SafeAreaInset;
        contentSafeAreaInset?: SafeAreaInset;
        setHeaderColor?: (color: string) => void;
        setBackgroundColor?: (color: string) => void;
        disableVerticalSwipes?: () => void;
        enableVerticalSwipes?: () => void;
        onEvent?: (eventType: string, callback: () => void) => void;
        offEvent?: (eventType: string, callback: () => void) => void;
        HapticFeedback?: {
          impactOccurred: (style: HapticImpact) => void;
          notificationOccurred: (type: HapticNotification) => void;
        };
      };
    };
  }
}

export type BottomBarConfig =
  | { mode: "hidden" }
  | { mode: "home"; onPlay: () => void }
  | { mode: "gameover"; onReapply: () => void; onShare?: () => void };

let backButtonHandler: (() => void) | null = null;
let mainButtonHandler: (() => void) | null = null;
let secondaryButtonHandler: (() => void) | null = null;
let bottomBarProgressOnSecondary = false;

function setThemeVar(root: HTMLElement, cssVar: string, value: string | undefined, fallback: string): void {
  root.style.setProperty(cssVar, value && value.length > 0 ? value : fallback);
}

function insetPx(value: number | undefined): string {
  if (value === undefined || Number.isNaN(value)) return "0px";
  return `${Math.max(0, value)}px`;
}

function getMainButton(): TelegramBottomButton | undefined {
  return window.Telegram?.WebApp?.MainButton;
}

function getSecondaryButton(): TelegramBottomButton | undefined {
  return window.Telegram?.WebApp?.SecondaryButton;
}

function clearMainButtonHandler(): void {
  const mb = getMainButton();
  if (mb && mainButtonHandler) {
    mb.offClick(mainButtonHandler);
    mainButtonHandler = null;
  }
}

function clearSecondaryButtonHandler(): void {
  const sb = getSecondaryButton();
  if (sb && secondaryButtonHandler) {
    sb.offClick(secondaryButtonHandler);
    secondaryButtonHandler = null;
  }
}

function hideAllBottomButtons(): void {
  clearMainButtonHandler();
  clearSecondaryButtonHandler();
  getMainButton()?.hideProgress?.();
  getSecondaryButton()?.hideProgress?.();
  getMainButton()?.hide();
  getSecondaryButton()?.hide();
  document.documentElement.classList.remove("cl-tg-secondary-share", "cl-tg-bottom-bar-visible");
  bottomBarProgressOnSecondary = false;
}

export function applySafeAreaInsets(): void {
  const tg = window.Telegram?.WebApp;
  const root = document.documentElement;
  if (!tg) return;

  const safe = tg.safeAreaInset ?? {};
  const content = tg.contentSafeAreaInset ?? {};

  root.style.setProperty("--tg-safe-area-inset-top", insetPx(safe.top));
  root.style.setProperty("--tg-safe-area-inset-bottom", insetPx(safe.bottom));
  root.style.setProperty("--tg-safe-area-inset-left", insetPx(safe.left));
  root.style.setProperty("--tg-safe-area-inset-right", insetPx(safe.right));
  root.style.setProperty("--tg-content-safe-area-inset-top", insetPx(content.top));
  root.style.setProperty("--tg-content-safe-area-inset-bottom", insetPx(content.bottom));
  root.style.setProperty("--tg-content-safe-area-inset-left", insetPx(content.left));
  root.style.setProperty("--tg-content-safe-area-inset-right", insetPx(content.right));
}

/** Shell copy uses fixed slate utilities; keep the playfield light when Telegram is dark. */
const TELEGRAM_DARK_VIEWPORT_BG = "#f8fafc";

export function applyTelegramTheme(): void {
  const tg = window.Telegram?.WebApp;
  const root = document.documentElement;
  const params = tg?.themeParams ?? {};
  const isDarkScheme = tg?.colorScheme === "dark";

  root.classList.toggle("cl-tg-dark", isDarkScheme);

  setThemeVar(root, "--cl-bg", params.bg_color, "#020617");
  if (isDarkScheme) {
    root.style.setProperty("--cl-secondary-bg", TELEGRAM_DARK_VIEWPORT_BG);
  } else {
    setThemeVar(root, "--cl-secondary-bg", params.secondary_bg_color, TELEGRAM_DARK_VIEWPORT_BG);
  }
  setThemeVar(root, "--cl-text", params.text_color, "#0f172a");
  setThemeVar(root, "--cl-hint", params.hint_color, "#64748b");
  setThemeVar(root, "--cl-link", params.link_color, "#2563eb");
  setThemeVar(root, "--cl-button", params.button_color, "#2563eb");
  setThemeVar(root, "--cl-button-text", params.button_text_color, "#ffffff");
  setThemeVar(root, "--cl-header-bg", params.header_bg_color, "#0f172a");
  setThemeVar(
    root,
    "--cl-header-text",
    params.header_text_color ?? params.text_color,
    "#ffffff"
  );
  setThemeVar(root, "--cl-border", params.section_separator_color, "#1e293b");
  setThemeVar(root, "--cl-accent", params.accent_text_color, "#2563eb");

  if (params.header_bg_color && tg?.setHeaderColor) {
    tg.setHeaderColor(params.header_bg_color);
  } else if (tg?.setHeaderColor) {
    tg.setHeaderColor("#0f172a");
  }

  if (tg?.setBackgroundColor) {
    if (isDarkScheme) {
      tg.setBackgroundColor(TELEGRAM_DARK_VIEWPORT_BG);
    } else if (params.bg_color) {
      tg.setBackgroundColor(params.bg_color);
    } else {
      tg.setBackgroundColor("#020617");
    }
  }

  applySafeAreaInsets();
}

function onThemeChanged(callback: () => void): void {
  const tg = window.Telegram?.WebApp;
  if (tg?.onEvent) {
    tg.onEvent("themeChanged", callback);
  }
}

function onSafeAreaChanged(callback: () => void): void {
  const tg = window.Telegram?.WebApp;
  if (!tg?.onEvent) return;
  tg.onEvent("safeAreaChanged", callback);
  tg.onEvent("contentSafeAreaChanged", callback);
}

export function showTelegramBack(onClick: () => void): void {
  const bb = window.Telegram?.WebApp?.BackButton;
  if (!bb) return;
  if (backButtonHandler) {
    bb.offClick(backButtonHandler);
  }
  backButtonHandler = onClick;
  bb.onClick(onClick);
  bb.show();
}

export function hideTelegramBack(): void {
  const bb = window.Telegram?.WebApp?.BackButton;
  if (!bb) return;
  if (backButtonHandler) {
    bb.offClick(backButtonHandler);
    backButtonHandler = null;
  }
  bb.hide();
}

export function isSecondaryButtonSupported(): boolean {
  if (!isTelegram()) return false;
  const tg = window.Telegram?.WebApp;
  if (!tg?.SecondaryButton) return false;
  if (typeof tg.isVersionAtLeast === "function") {
    return tg.isVersionAtLeast("7.10");
  }
  return true;
}

export function isTelegramBottomBarActive(): boolean {
  return document.documentElement.classList.contains("cl-tg-bottom-bar-visible");
}

export function syncTelegramBottomBar(config: BottomBarConfig): void {
  if (!isTelegram()) {
    hideAllBottomButtons();
    return;
  }

  hideAllBottomButtons();

  if (config.mode === "hidden") return;

  const mb = getMainButton();
  if (!mb) return;

  document.documentElement.classList.add("cl-tg-bottom-bar-visible");

  if (config.mode === "home") {
    mainButtonHandler = config.onPlay;
    mb.setText("PUNCH IN & CLIMB");
    mb.enable();
    mb.onClick(config.onPlay);
    mb.show();
    return;
  }

  mainButtonHandler = config.onReapply;
  mb.setText("RE-APPLY FOR ROLE");
  mb.enable();
  mb.onClick(config.onReapply);
  mb.show();

  if (config.onShare && isSecondaryButtonSupported()) {
    const sb = getSecondaryButton();
    if (sb) {
      secondaryButtonHandler = config.onShare;
      if (sb.setParams) {
        sb.setParams({
          text: "Share",
          position: "left",
          is_visible: true,
          is_active: true,
          is_progress_visible: false,
        });
      } else {
        sb.setText("Share");
      }
      sb.enable();
      sb.onClick(config.onShare);
      sb.show();
      document.documentElement.classList.add("cl-tg-secondary-share");
      bottomBarProgressOnSecondary = true;
    }
  }
}

export function setBottomBarProgress(visible: boolean): void {
  if (!isTelegram()) return;

  if (bottomBarProgressOnSecondary) {
    const sb = getSecondaryButton();
    if (!sb) return;
    if (visible) {
      sb.showProgress?.();
      sb.disable();
    } else {
      sb.hideProgress?.();
      sb.enable();
    }
    return;
  }

  const mb = getMainButton();
  if (!mb) return;
  if (visible) {
    mb.showProgress?.();
    mb.disable();
  } else {
    mb.hideProgress?.();
    mb.enable();
  }
}

/** @deprecated Use syncTelegramBottomBar({ mode: "home", onPlay }) */
export function showHomeMainButton(onPlay: () => void): void {
  syncTelegramBottomBar({ mode: "home", onPlay });
}

/** @deprecated Use syncTelegramBottomBar({ mode: "hidden" }) */
export function hideHomeMainButton(): void {
  syncTelegramBottomBar({ mode: "hidden" });
}

export function hapticImpact(style: HapticImpact): void {
  try {
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred(style);
  } catch {
    /* no-op outside Telegram */
  }
}

export function hapticNotification(type: HapticNotification): void {
  try {
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred(type);
  } catch {
    /* no-op outside Telegram */
  }
}

export function disableVerticalSwipe(): void {
  try {
    window.Telegram?.WebApp?.disableVerticalSwipes?.();
  } catch {
    /* no-op outside Telegram */
  }
}

export function enableVerticalSwipe(): void {
  try {
    window.Telegram?.WebApp?.enableVerticalSwipes?.();
  } catch {
    /* no-op outside Telegram */
  }
}

export function initTelegram(): void {
  const tg = window.Telegram?.WebApp;
  document.documentElement.classList.toggle("cl-in-telegram", Boolean(tg?.initData));
  if (tg) {
    tg.ready();
    tg.expand();
    syncTelegramBottomBar({ mode: "hidden" });
    applyTelegramTheme();
    onThemeChanged(applyTelegramTheme);
    onSafeAreaChanged(applySafeAreaInsets);
  }
}

export function getInitData(): string {
  return window.Telegram?.WebApp?.initData ?? "";
}

export function getTelegramUser(): TelegramUser | null {
  const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
  if (user?.id) return user;
  return null;
}

export function getDisplayName(fallback = "CorporateSlave"): string {
  const user = getTelegramUser();
  if (!user) return fallback;
  return user.username ?? user.first_name ?? fallback;
}

/** True when Bot API 8.0+ shareMessage with prepared id is available. */
export function canNativeShare(): boolean {
  const tg = window.Telegram?.WebApp;
  if (!tg || typeof tg.shareMessage !== "function") return false;
  if (typeof tg.isVersionAtLeast === "function") {
    return tg.isVersionAtLeast("8.0");
  }
  return true;
}

const SHARE_MESSAGE_TIMEOUT_MS = 120_000;

/** Open native share picker for a bot-prepared message id; resolves when send completes or fails. */
export function sharePreparedMessage(msgId: string): Promise<boolean> {
  return new Promise((resolve) => {
    const tg = window.Telegram?.WebApp;
    const share = tg?.shareMessage;
    if (!share) {
      resolve(false);
      return;
    }

    let settled = false;
    const finish = (sent: boolean) => {
      if (settled) return;
      settled = true;
      cleanup();
      clearTimeout(timeoutId);
      resolve(sent);
    };

    const onSent = () => finish(true);
    const onFailed = () => finish(false);

    const cleanup = () => {
      tg?.offEvent?.("shareMessageSent", onSent);
      tg?.offEvent?.("shareMessageFailed", onFailed);
    };

    tg?.onEvent?.("shareMessageSent", onSent);
    tg?.onEvent?.("shareMessageFailed", onFailed);

    const timeoutId = setTimeout(() => finish(false), SHARE_MESSAGE_TIMEOUT_MS);

    try {
      share(msgId, (sent) => finish(Boolean(sent)));
    } catch {
      finish(false);
    }
  });
}

export function openExternalLink(url: string): void {
  const tg = window.Telegram?.WebApp;
  if (tg?.openLink) {
    tg.openLink(url);
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
}

export function isTelegram(): boolean {
  return Boolean(window.Telegram?.WebApp?.initData);
}

export function getBotUsername(): string {
  return import.meta.env.VITE_BOT_USERNAME ?? "CorporateLadder_bot";
}

/** Mini App launch param: `t.me/bot?startapp=<value>` → initDataUnsafe.start_param (URL fallback for dev). */
export function getStartParam(): string {
  const fromTelegram = window.Telegram?.WebApp?.initDataUnsafe?.start_param;
  if (fromTelegram) return fromTelegram;
  try {
    return new URLSearchParams(window.location.search).get("tgWebAppStartParam") ?? "";
  } catch {
    return "";
  }
}
