import type { DeathType, ObstacleType, Rank, Rung } from "./types";

export const MAX_VISIBLE_RUNGS = 7;

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
export const MIN_TAP_INTERVAL_MS = 120;

/** Corporate triage rung (v2.0) — Manager+ spawn-bias choice every N rungs. */
export const TRIAGE_RUNG_INTERVAL = 16;
export const TRIAGE_BIAS_RUNGS = 3;
export const TRIAGE_SPAWN_BIAS = 0.75;
export const TRIAGE_PROMPT =
  "HR triage: tap LEFT or RIGHT to overload that lane with P1 backlog.";
export function triageConfirmCopy(side: "left" | "right"): string {
  const lane = side === "left" ? "LEFT" : "RIGHT";
  return `P1 backlog routed to the ${lane} lane for the next few rungs.`;
}

/** Scripted imminent rungs after foot (rungs[1..3]) — L/R spawn only. */
export const TUTORIAL_RUNG_SPECS: Omit<Rung, "id">[] = [
  { obstacle: null, type: null, coffee: null },
  { obstacle: "right", type: "meeting", coffee: null },
  { obstacle: null, type: null, coffee: "left" },
];

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
  badge_gate: "🪪",
  foliage: "🪴",
  energy: "⚡",
  sprint: "🏁",
};

export const DEATH_LABELS: Record<DeathType, string> = {
  meeting: "Meeting Overload",
  reorg: "Reorganization",
  burnout: "Deadline Crash",
  badge_gate: "Badge Reader Jam",
  foliage: "Wellness Obstruction",
  energy: "Energy Depleted",
  sprint: "Sprint Standdown",
};

export const RETRY_TIPS: Record<DeathType, string> = {
  meeting: "Pick the side without the calendar. Revolutionary, we know.",
  reorg: "Next rung holds still — further rungs shuffle. Org charts lie.",
  burnout: "Deadlines look like meetings but mean business. Side-step.",
  badge_gate: "Turnstile blocked the wrong aisle. Badge on the safe side only.",
  foliage: "Mandatory desk plant owns that lane. Step to the open side.",
  energy: "Grab coffee when you can. Decaf is not a strategy.",
  sprint: "The buzzer doesn't care about your pipeline. Climb faster next standup.",
};

export const SPRINT_GAME_OVER = {
  cause: "Sprint Standdown",
  detail: "Velocity review complete. HR archived your climb at the buzzer.",
  deathType: "sprint" as const,
};

export const SPRINT_SHARE_LINE = "Sprint archived at the buzzer — velocity noted, outcomes pending.";

export interface ObstacleDeathCopy {
  cause: string;
  detail: string;
  deathType: DeathType;
}

export const OBSTACLE_DEATH_COPY: Record<ObstacleType, ObstacleDeathCopy> = {
  meeting: {
    cause: "Meeting Overload",
    detail: "Fell into an all-hands call on slide layout. Reached maximum agenda tolerance.",
    deathType: "meeting",
  },
  reorg: {
    cause: "Reorganization",
    detail: "A massive department restructuring shuffled you out of direct reports.",
    deathType: "reorg",
  },
  burnout: {
    cause: "Deadline Crash",
    detail: "Waded headfirst into a quarterly deadline with zero active coffee left.",
    deathType: "burnout",
  },
  badge_gate: {
    cause: "Badge Reader Jam",
    detail: "Turnstile rejected your lanyard on the wrong aisle. Facilities filed a wellness ticket.",
    deathType: "badge_gate",
  },
  foliage: {
    cause: "Wellness Obstruction",
    detail: "Mandatory desk plant blocked the corridor. HR cited biophilic compliance.",
    deathType: "foliage",
  },
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
  synergy_sprint: [
    "Synergy Sprint ended at the buzzer. Standup velocity: archived.",
    "Sprint retro filed. Your years survived are now a KPI.",
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
    return `CEO myth in ${remaining.toFixed(1)}y`;
  }
  const remaining = Math.max(0, MANAGER_YEARS - years);
  return `Manager in ${remaining.toFixed(1)}y`;
}

export function allowedObstacleTypes(rank: Rank, allowEarlyReorg = false): ObstacleType[] {
  if (rank === "CEO") return ["meeting", "reorg", "burnout", "foliage"];
  if (rank === "Manager") return ["meeting", "reorg", "badge_gate"];
  if (allowEarlyReorg) return ["meeting", "reorg"];
  return ["meeting"];
}

/** Weighted pick from rank-allowed types only (sums to 1 within each pool). */
const OBSTACLE_WEIGHTS: Partial<Record<Rank, Partial<Record<ObstacleType, number>>>> = {
  Intern: { meeting: 1 },
  Manager: { meeting: 0.55, reorg: 0.3, badge_gate: 0.15 },
  CEO: { meeting: 0.4, reorg: 0.25, burnout: 0.2, foliage: 0.15 },
};

export function pickObstacleType(
  rank: Rank,
  opts?: { allowEarlyReorg?: boolean; meetingPickThreshold?: number }
): ObstacleType {
  const allowEarlyReorg = opts?.allowEarlyReorg ?? false;
  const allowed = allowedObstacleTypes(rank, allowEarlyReorg);

  if (rank === "Intern" && allowEarlyReorg) {
    const meetingCut = opts?.meetingPickThreshold ?? 0.5;
    const typeRand = Math.random();
    if (typeRand < meetingCut) return "meeting";
    return "reorg";
  }

  const poolRank: Rank = rank === "Intern" ? "Intern" : rank;
  const weights = OBSTACLE_WEIGHTS[poolRank] ?? { meeting: 1 };
  let total = 0;
  const entries: { type: ObstacleType; weight: number }[] = [];
  for (const type of allowed) {
    const w = weights[type] ?? 0;
    if (w > 0) {
      entries.push({ type, weight: w });
      total += w;
    }
  }
  if (entries.length === 0) return allowed[0] ?? "meeting";
  if (total <= 0) return allowed[0] ?? "meeting";

  let roll = Math.random() * total;
  for (const { type, weight } of entries) {
    roll -= weight;
    if (roll <= 0) return type;
  }
  return entries[entries.length - 1]!.type;
}

export function reorgIntervalForRank(rank: Rank): number {
  return rank === "CEO" ? REORG_INTERVAL_CEO_MS : REORG_INTERVAL_MS;
}
