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

interface TelegramMainButton {
  show: () => void;
  hide: () => void;
  enable: () => void;
  disable: () => void;
  setText: (text: string) => void;
  onClick: (callback: () => void) => void;
  offClick: (callback: () => void) => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        initData: string;
        initDataUnsafe: { user?: TelegramUser; start_param?: string };
        shareMessage?: (params: { text: string }) => void;
        openLink?: (url: string, options?: { try_instant_view?: boolean }) => void;
        openTelegramLink?: (url: string) => void;
        MainButton: TelegramMainButton;
        BackButton?: TelegramBackButton;
        themeParams: Record<string, string>;
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

let backButtonHandler: (() => void) | null = null;
let mainButtonHandler: (() => void) | null = null;

function setThemeVar(root: HTMLElement, cssVar: string, value: string | undefined, fallback: string): void {
  root.style.setProperty(cssVar, value && value.length > 0 ? value : fallback);
}

function insetPx(value: number | undefined): string {
  if (value === undefined || Number.isNaN(value)) return "0px";
  return `${Math.max(0, value)}px`;
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

export function applyTelegramTheme(): void {
  const tg = window.Telegram?.WebApp;
  const root = document.documentElement;
  const params = tg?.themeParams ?? {};

  setThemeVar(root, "--cl-bg", params.bg_color, "#020617");
  setThemeVar(root, "--cl-secondary-bg", params.secondary_bg_color, "#f8fafc");
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

  if (params.bg_color && tg?.setBackgroundColor) {
    tg.setBackgroundColor(params.bg_color);
  } else if (tg?.setBackgroundColor) {
    tg.setBackgroundColor("#020617");
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

export function showHomeMainButton(onPlay: () => void): void {
  const mb = window.Telegram?.WebApp?.MainButton;
  if (!mb || !isTelegram()) return;
  if (mainButtonHandler) {
    mb.offClick(mainButtonHandler);
  }
  mainButtonHandler = onPlay;
  mb.setText("PUNCH IN & CLIMB");
  mb.enable();
  mb.onClick(onPlay);
  mb.show();
}

export function hideHomeMainButton(): void {
  const mb = window.Telegram?.WebApp?.MainButton;
  if (!mb) return;
  if (mainButtonHandler) {
    mb.offClick(mainButtonHandler);
    mainButtonHandler = null;
  }
  mb.hide();
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
    hideHomeMainButton();
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

/** Native Telegram share when WebApp.shareMessage is available; else clipboard in app.ts. */
export function shareText(text: string): boolean {
  const share = window.Telegram?.WebApp?.shareMessage;
  if (typeof share !== "function") return false;
  try {
    share({ text });
    return true;
  } catch {
    return false;
  }
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
