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

export const REAPPLY_STORAGE_KEY = "corp_ladder_reapply_count";

export interface TickerHeadline {
  text: string;
  deathType?: DeathType;
}

export const NEWS_TICKER_HEADLINES: TickerHeadline[] = [
  { text: "CEO bans all desks — hot-desking now mandatory standing", deathType: "meeting" },
  { text: "VP of Coffee suggests double espressos count as one serving", deathType: "energy" },
  { text: "Reorg delayed due to unscheduled reorg", deathType: "reorg" },
  { text: "Burnout at optimal productivity per Q3 dashboard", deathType: "burnout" },
  { text: "All-hands moved to async memo nobody will read", deathType: "meeting" },
  { text: "Synergy workshop scheduled during actual deadline week", deathType: "burnout" },
  { text: "Org chart updated; reporting lines now circular", deathType: "reorg" },
  { text: "Wellness initiative replaces lunch breaks with gratitude journals", deathType: "energy" },
  { text: "Reply-All incident declared Level 3 communications emergency", deathType: "meeting" },
  { text: "Strategic pivot requires pivoting the previous pivot", deathType: "reorg" },
  { text: "Quarter-end crunch rebranded as 'focus sprint'", deathType: "burnout" },
  { text: "Decaf stations removed for culture fit", deathType: "energy" },
  { text: "Standup about standups yields no standing decisions", deathType: "meeting" },
  { text: "Matrix management trial enters year seven of phase one", deathType: "reorg" },
  { text: "Board approves unlimited PTO that nobody can take", deathType: "energy" },
];

export const REAPPLY_FLAVOR: { minRuns: number; line: string }[] = [
  {
    minRuns: 10,
    line: "Ten applications on file. HR upgraded you to frequent-reapply status.",
  },
  {
    minRuns: 5,
    line: "Fifth re-application this week. Your cover letter is now auto-generated.",
  },
  {
    minRuns: 1,
    line: "First termination of the session. The ladder accepts all comers.",
  },
];

export const MANAGER_NEMESIS_LINE =
  "VP of People Ops: Congratulations. Your 1:1s are now everyone else's calendar problem.";

export const CEO_TRAP_ANNOUNCEMENT =
  "Corner office secured. Quarterly deadlines now report directly to you.";

export const INTERN_FAKE_PROMO: { years: number; message: string }[] = [
  { years: 2, message: "Performance note filed: almost ready for real promotion. Almost." },
  { years: 5, message: "VP pinged about your trajectory. The ping was CC'd to nobody." },
  { years: 9.9, message: "Manager paperwork submitted. Printer jammed. Classic." },
];

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
    "Badge printer still in queue. You expired waiting.",
    "Shadowed a director who only spoke in acronyms. Brain rejected input.",
  ],
  Manager: [
    "Promoted into accountability without authority. Classic trap.",
    "Your direct reports scheduled a sync to discuss syncing schedules.",
    "Delegated upward until the task orbited you and collapsed.",
    "Approved a team outing that became a working lunch with slides.",
  ],
  CEO: [
    "The board voted unanimously against your vision. And your expense report.",
    "Strategic pivot into a pivot. You were the pivot.",
    "All-hands applauded your memo. Nobody read past the subject line.",
    "Corner office view excellent. Runway visibility zero.",
  ],
};

/** Keys match DailyPresetId in daily-modifier.ts (standard has no shift-specific lines). */
export const FAILURE_BY_SHIFT: Record<string, string[]> = {
  meeting_monday: [
    "Meeting Monday claimed another calendar hostage before coffee.",
    "Standup ran long. Your safe side was in another timezone.",
  ],
  coffee_break: [
    "Coffee Break shift and you still ran dry. HR noted the irony.",
    "Hydration initiative succeeded. Your energy bar did not.",
  ],
  reorg_week: [
    "Reorg Week shuffled your exit interview ahead of schedule.",
    "Org chart unstable; your ladder rung reported to itself.",
  ],
};

export const PROMOTION_DIALOGUES: Partial<Record<Rank, string>> = {
  Intern: "Still an Intern. HR says your badge printer is 'in the queue.'",
  Manager:
    "Promoted to Manager. Your calendar now belongs to everyone else. Stress increased.",
  CEO: "Reached CEO. Strategic budget requests denied. Monocle unlocked. The board is watching.",
};

export function pickTickerHeadline(): TickerHeadline {
  return NEWS_TICKER_HEADLINES[Math.floor(Math.random() * NEWS_TICKER_HEADLINES.length)]!;
}

export function formatTickerText(headline: TickerHeadline): string {
  return `* ${headline.text} *`;
}

export function reappliesFlavor(runCount: number): string {
  for (const tier of REAPPLY_FLAVOR) {
    if (runCount >= tier.minRuns) return tier.line;
  }
  return REAPPLY_FLAVOR[REAPPLY_FLAVOR.length - 1]!.line;
}

export function floorLabel(years: number): string {
  const floor = Math.max(1, Math.floor(years) + 1);
  if (years < 5) return `Floor ${floor} — Intern Pit`;
  if (years < MANAGER_YEARS) return `Floor ${floor} — Open Office`;
  if (years < CEO_YEARS) return `Floor ${floor} — Middle Management`;
  return `Floor ${floor} — Executive Suite`;
}

export function rankPropEmoji(rank: Rank): string {
  if (rank === "CEO") return "🧐";
  if (rank === "Manager") return "📋";
  return "🪪";
}

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

export function allowedObstacleTypes(rank: Rank, allowEarlyReorg = false): ObstacleType[] {
  if (rank === "CEO") return ["meeting", "reorg", "burnout"];
  if (rank === "Manager") return ["meeting", "reorg"];
  if (allowEarlyReorg) return ["meeting", "reorg"];
  return ["meeting"];
}

export function pickObstacleType(
  rank: Rank,
  opts?: { allowEarlyReorg?: boolean; meetingPickThreshold?: number }
): ObstacleType {
  const allowEarlyReorg = opts?.allowEarlyReorg ?? false;
  const meetingCut = opts?.meetingPickThreshold ?? 0.5;
  const allowed = allowedObstacleTypes(rank, allowEarlyReorg);
  const typeRand = Math.random();
  let type: ObstacleType;
  if (typeRand < meetingCut) type = "meeting";
  else if (typeRand < meetingCut + 0.3) type = "reorg";
  else type = "burnout";
  if (allowed.includes(type)) return type;
  return allowed[0] ?? "meeting";
}

export function reorgIntervalForRank(rank: Rank): number {
  return rank === "CEO" ? REORG_INTERVAL_CEO_MS : REORG_INTERVAL_MS;
}
