import telegramAnalytics from "@telegram-apps/analytics";

/** TON Builders Analytics Keys identifier (case-sensitive). */
export const TELEGRAM_ANALYTICS_APP_NAME = "corporate_ladder" as const;

export function getTelegramAnalyticsAppName(): string {
  const override = import.meta.env.VITE_TELEGRAM_ANALYTICS_APP_NAME?.trim();
  return override || TELEGRAM_ANALYTICS_APP_NAME;
}

/** No-op when `VITE_TELEGRAM_ANALYTICS_TOKEN` is unset (local dev). */
export function initTelegramAnalytics(): void {
  const token = import.meta.env.VITE_TELEGRAM_ANALYTICS_TOKEN?.trim();
  if (!token) return;

  telegramAnalytics.init({
    token,
    appName: getTelegramAnalyticsAppName(),
  });
}
