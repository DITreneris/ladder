export interface TelegramUser {
  id: number;
  username?: string;
  first_name?: string;
}

type HapticImpact = "light" | "medium" | "heavy" | "rigid" | "soft";
type HapticNotification = "error" | "success" | "warning";

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        initData: string;
        initDataUnsafe: { user?: TelegramUser };
        shareMessage?: (params: { text: string }) => void;
        openLink?: (url: string, options?: { try_instant_view?: boolean }) => void;
        openTelegramLink?: (url: string) => void;
        MainButton: { hide: () => void };
        themeParams: Record<string, string>;
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

function setThemeVar(root: HTMLElement, cssVar: string, value: string | undefined, fallback: string): void {
  root.style.setProperty(cssVar, value && value.length > 0 ? value : fallback);
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
  setThemeVar(root, "--cl-header-text", params.header_text_color, "#ffffff");
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
}

function onThemeChanged(callback: () => void): void {
  const tg = window.Telegram?.WebApp;
  if (tg?.onEvent) {
    tg.onEvent("themeChanged", callback);
  }
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
    tg.MainButton.hide();
    applyTelegramTheme();
    onThemeChanged(applyTelegramTheme);
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

export function shareText(text: string): boolean {
  const tg = window.Telegram?.WebApp;
  if (tg?.shareMessage) {
    tg.shareMessage({ text });
    return true;
  }
  return false;
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
  return import.meta.env.VITE_BOT_USERNAME ?? "CorporateLadderBot";
}
