/**
 * Share message body — must match packages/api/app/share_copy.py (Variant A hook).
 */

import { SPRINT_SHARE_LINE } from "../game/constants";
import { getBotUsername } from "./telegram";

const MAX_DEATH_LINE = 90;
const PA_CARD_SUFFIX = " Built with Prompt Anatomy";

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

export function pickDeathLine(detail: string, flavor: string): string {
  const flavorClean = flavor.trim().replace(/^"|"$/g, "");
  if (flavorClean && flavorClean.length <= MAX_DEATH_LINE) {
    return flavorClean.replace(/\.$/, "");
  }

  const detailTrim = detail.trim();
  if (detailTrim) {
    const periodIdx = detailTrim.indexOf(".");
    const first = periodIdx >= 0 ? detailTrim.slice(0, periodIdx + 1) : detailTrim;
    return truncate(first.trim().replace(/\.$/, ""), MAX_DEATH_LINE);
  }

  if (flavorClean) {
    return truncate(flavorClean.replace(/\.$/, ""), MAX_DEATH_LINE);
  }

  return "HR filed the paperwork";
}

/** Card description preview — PA co-brand on card only, not in message body. */
export function buildShareCardDescription(detail: string, flavor: string): string {
  const base = detail.trim() || flavor.trim().replace(/^"|"$/g, "");
  const maxBase = 256 - PA_CARD_SUFFIX.length;
  return truncate(base, maxBase) + PA_CARD_SUFFIX;
}

/** 3-line share hook for native share body and clipboard fallback. */
export function buildShareMessageText(input: ShareCopyInput): string {
  const years = input.yearsSurvived.toFixed(1);
  const rank = input.finalRank;
  const shortDeath =
    input.deathType === "sprint"
      ? SPRINT_SHARE_LINE.replace(/\.$/, "")
      : pickDeathLine(input.terminationDetail, input.terminationFlavor);

  const challengeUrl = buildChallengeLink(input.yearsSurvived);
  return `${rank} · ${years}y — ${shortDeath}.\nThink you can outlast me?\n${challengeUrl}`;
}
