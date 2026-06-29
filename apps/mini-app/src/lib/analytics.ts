import telegramAnalytics from "@telegram-apps/analytics";

export type FunnelEventName =
  | "tutorial_complete"
  | "share_tap"
  | "share_success"
  | "revive_offer"
  | "revive_complete"
  | "hr_stamp_vent"
  | "game_start"
  | "game_finish"
  | "score_submitted"
  | "leaderboard_viewed"
  | "return_session"
  | "ad_shown"
  | "ad_completed";

type AnalyticsClient = {
  event?: (name: string, payload?: Record<string, unknown>) => void;
  track?: (name: string, payload?: Record<string, unknown>) => void;
};

/** Lightweight funnel events — TON Builders SDK when token set; no-op locally. */
export function trackEvent(name: FunnelEventName, payload?: Record<string, unknown>): void {
  const token = import.meta.env.VITE_TELEGRAM_ANALYTICS_TOKEN?.trim();
  if (!token) return;

  try {
    const client = telegramAnalytics as AnalyticsClient;
    if (typeof client.event === "function") {
      client.event(name, payload);
      return;
    }
    if (typeof client.track === "function") {
      client.track(name, payload);
    }
  } catch {
    /* analytics must never break gameplay */
  }
}
