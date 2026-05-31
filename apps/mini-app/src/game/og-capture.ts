import { getDailyModifierById } from "./daily-modifier";
import type { PlayerSide, Rank, Rung } from "./types";

export const OG_CAPTURE_SCORE = 8;
export const OG_CAPTURE_YEARS = OG_CAPTURE_SCORE / 4;
export const OG_CAPTURE_ENERGY = 68;
export const OG_CAPTURE_PLAYER_SIDE: PlayerSide = "left";
export const OG_CAPTURE_RANK: Rank = "Intern";
export const OG_CAPTURE_DAILY_MODIFIER = getDailyModifierById("reorg_week");

const OG_RUNG_LAYOUT: Omit<Rung, "id">[] = [
  { obstacle: null, type: null, coffee: null },
  { obstacle: "right", type: "meeting", coffee: null },
  { obstacle: null, type: null, coffee: "left" },
  { obstacle: null, type: null, coffee: null },
  { obstacle: "left", type: "meeting", coffee: null },
  { obstacle: null, type: null, coffee: null },
  { obstacle: null, type: null, coffee: "right" },
];

export function buildOgCaptureRungs(): Rung[] {
  return OG_RUNG_LAYOUT.map((rung, id) => ({ ...rung, id }));
}
