import type { DeathType, ObstacleType, Rank } from "./types";

export const MAX_VISIBLE_RUNGS = 7;

export const PLAYER_LEFT = "calc(50% - 92px)";
export const PLAYER_RIGHT = "calc(50% + 28px)";

export const MANAGER_YEARS = 10;
export const CEO_YEARS = 35;

export const TICK_MS = 100;
export const BASE_DRAIN_RATE = 0.85;
export const DRAIN_SCALE_PER_YEAR = 0.12;
export const CLIMB_RECOVERY = 1.5;
export const COFFEE_RECOVERY = 25;
export const REORG_INTERVAL_MS = 600;
export const REORG_INTERVAL_CEO_MS = 500;
export const OBSTACLE_SPAWN_RATE = 0.35;
export const INTERN_OBSTACLE_SPAWN_RATE = 0.22;
export const INTERN_TUTORIAL_RUNGS = 12;
export const TUTORIAL_COFFEE_MIN_RUNG = 8;
export const COFFEE_SPAWN_THRESHOLD = 0.85;
export const PROMO_DRAIN_PAUSE_MS = 2000;

export const DEATH_EMOJI: Record<DeathType, string> = {
  meeting: "📅",
  reorg: "🔄",
  burnout: "⏰",
  energy: "⚡",
};

export const DEATH_LABELS: Record<DeathType, string> = {
  meeting: "Meeting Overload",
  reorg: "Reorganization",
  burnout: "Deadline Crash",
  energy: "Energy Depleted",
};

export const RETRY_TIPS: Record<DeathType, string> = {
  meeting: "Pick the side without the calendar. Revolutionary, we know.",
  reorg: "Wait for the shuffle, then climb. Org charts lie.",
  burnout: "Deadlines look like meetings but mean business. Side-step.",
  energy: "Grab coffee when you can. Decaf is not a strategy.",
};

export const FAILURE_REASONS = [
  "Burned out while compiling a budget sheet that nobody opened.",
  "Accidentally replied 'Reply All' to a company-wide restructuring memo.",
  "Attended an 8-hour strategy sync. No choices made. Synergy levels critically low.",
  "Drowned under an avalanche of unread corporate newsletters.",
  "Called an unapproved brainstorming session. Budget denied.",
  "Failed the team-building exercise by dropping the trust-fall partner.",
  "Substituted actual coffee with decaf. Instant performance system collapse.",
  "Reorganization placed you into a matrix reporting to your own intern.",
];

export const FAILURE_BY_RANK: Partial<Record<Rank, string[]>> = {
  Intern: [
    "Intern orientation overwhelmed you before you learned where the coffee is.",
    "Assigned to shadow a meeting about meetings. Did not survive.",
  ],
  Manager: [
    "Promoted into accountability without authority. Classic trap.",
    "Your direct reports scheduled a sync to discuss syncing schedules.",
  ],
  CEO: [
    "The board voted unanimously against your vision. And your expense report.",
    "Strategic pivot into a pivot. You were the pivot.",
  ],
};

export const PROMOTION_DIALOGUES: Partial<Record<Rank, string>> = {
  Intern: "Still an Intern. HR says your badge printer is 'in the queue.'",
  Manager:
    "Promoted to Manager. Your calendar now belongs to everyone else. Stress increased.",
  CEO: "Reached CEO. Strategic budget requests denied. Monocle unlocked. The board is watching.",
};

export function rankFromYears(years: number): Rank {
  if (years >= CEO_YEARS) return "CEO";
  if (years >= MANAGER_YEARS) return "Manager";
  return "Intern";
}

export function rankEmoji(rank: Rank): string {
  if (rank === "CEO") return "👑";
  if (rank === "Manager") return "🧑‍💼";
  return "🧑‍💻";
}

export function milestoneLabel(years: number): string {
  if (years >= CEO_YEARS) return "Corner office secured";
  if (years >= MANAGER_YEARS) {
    const remaining = Math.max(0, CEO_YEARS - years);
    return `CEO in ${remaining.toFixed(1)}y`;
  }
  const remaining = Math.max(0, MANAGER_YEARS - years);
  return `Manager in ${remaining.toFixed(1)}y`;
}

export function allowedObstacleTypes(rank: Rank): ObstacleType[] {
  if (rank === "CEO") return ["meeting", "reorg", "burnout"];
  if (rank === "Manager") return ["meeting", "reorg"];
  return ["meeting"];
}

export function pickObstacleType(rank: Rank): ObstacleType {
  const allowed = allowedObstacleTypes(rank);
  const typeRand = Math.random();
  let type: ObstacleType;
  if (typeRand < 0.5) type = "meeting";
  else if (typeRand < 0.8) type = "reorg";
  else type = "burnout";
  if (allowed.includes(type)) return type;
  return "meeting";
}

export function reorgIntervalForRank(rank: Rank): number {
  return rank === "CEO" ? REORG_INTERVAL_CEO_MS : REORG_INTERVAL_MS;
}
