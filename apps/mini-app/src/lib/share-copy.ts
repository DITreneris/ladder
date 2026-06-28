/**
 * Share message body — must match packages/api/app/share_copy.py (status-first hook).
 */

import { getBotUsername } from "./telegram";

const PA_CARD_SUFFIX = " Built with Prompt Anatomy";

/** Short satirical death tag for the status-first share hook — must match share_copy.py. */
export const SHORT_DEATH_TAG: Record<string, string> = {
  meeting: "before a meeting ran long",
  reorg: "before a reorg erased me",
  burnout: "before a deadline buried me",
  badge_gate: "before the turnstile won",
  foliage: "before a desk plant won",
  energy: "before burnout finished me",
  sprint: "before the sprint buzzer",
};
const SHORT_DEATH_TAG_FALLBACK = "before HR caught up";

export type ShareCopyInput = {
  yearsSurvived: number;
  finalRank: string;
  terminationDetail: string;
  terminationFlavor: string;
  deathType: string;
};

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  if (maxLen <= 1) return text.slice(0, maxLen);
  return `${text.slice(0, maxLen - 1)}…`;
}

/** Compact challenge param: years × 10 as integer, e.g. 24.5y → c_245. */
export function buildChallengeLink(yearsSurvived: number, botUsername?: string): string {
  const compact = Math.max(0, Math.round(yearsSurvived * 10));
  const bot = (botUsername ?? getBotUsername()).replace(/^@/, "");
  return `https://t.me/${bot}?startapp=c_${compact}`;
}

export function shortDeathTag(deathType: string): string {
  return SHORT_DEATH_TAG[deathType] ?? SHORT_DEATH_TAG_FALLBACK;
}

/** Card description preview — PA co-brand on card only, not in message body. */
export function buildShareCardDescription(detail: string, flavor: string): string {
  const base = detail.trim() || flavor.trim().replace(/^"|"$/g, "");
  const maxBase = 256 - PA_CARD_SUFFIX.length;
  return truncate(base, maxBase) + PA_CARD_SUFFIX;
}

/** Status-first 3-line share hook for native share body and clipboard fallback. */
export function buildShareMessageText(input: ShareCopyInput): string {
  const years = input.yearsSurvived.toFixed(1);
  const rank = input.finalRank;
  const tag = shortDeathTag(input.deathType);

  const challengeUrl = buildChallengeLink(input.yearsSurvived);
  return `I survived ${years}y as ${rank} ${tag}.\nThink you can climb higher? 👇\n${challengeUrl}`;
}
