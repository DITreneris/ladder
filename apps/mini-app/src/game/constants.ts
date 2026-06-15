import type { DailyPresetId } from "./daily-modifier";
import type { DeathType, ObstacleType, Rank, Rung } from "./types";

export const MAX_VISIBLE_RUNGS = 7;

export const MANAGER_YEARS = 10;
export const DIRECTOR_YEARS = 20;
export const CEO_YEARS = 35;
export const BOARD_YEARS = 50;
export const ANGEL_YEARS = 75;

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
/** Adaptive rookie ramp (v2.1): players with career best < Manager get a longer gentle ramp. */
export const ROOKIE_TUTORIAL_RUNGS = 20;
export const ROOKIE_INTERN_SPAWN_RATE_CAP = 0.3;
export const TUTORIAL_COFFEE_MIN_RUNG = 8;
export const COFFEE_SPAWN_THRESHOLD = 0.85;
export const PROMO_DRAIN_PAUSE_MS = 800;
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
export const LAST_RUN_STORAGE_KEY = "corp_ladder_last_run";
/** First-run tutorial overlay (v2.1.1) — set after scripted rungs 1–3 complete. */
export const TUTORIAL_DONE_STORAGE_KEY = "corp_ladder_tutorial_done";

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
  { text: "Spousal disclosure committee schedules emergency quorum on your weekend", deathType: "meeting" },
  { text: "Marital divestiture memo routed through Legal before breakfast", deathType: "reorg" },
  { text: "Governance calendar now reports directly to your marriage", deathType: "meeting" },
  { text: "Whistleblower forwarded your personal calendar to the board packet", deathType: "meeting" },
  { text: "Executive longevity screening flagged pre-existing ambition", deathType: "burnout" },
  { text: "Cardiologist opened a ticket in the same sprint as your term sheet", deathType: "burnout" },
  { text: "Portfolio review now includes joints and quarterly KPIs", deathType: "foliage" },
  { text: "IV drip lounge replaces coffee; hydration is due diligence", deathType: "energy" },
  { text: "Facilities audit: badge readers now reject the lane you're standing in", deathType: "badge_gate" },
  { text: "Turnstile firmware update — wrong aisle is a feature, not a bug", deathType: "badge_gate" },
  { text: "Mandatory biophilic desk plant program blocks both exits; wellness unchanged", deathType: "foliage" },
  { text: "Friday focus sprint: years survived archived when the timer wins", deathType: "sprint" },
];

/** Shift-pinned lead headline on non-standard UTC preset days (parity with daily-modifier map). */
export const SHIFT_TICKER_HEADLINES: Record<Exclude<DailyPresetId, "standard">, TickerHeadline> = {
  meeting_monday: {
    text: "Meeting Monday declared — your calendar filed a restraining order on free time",
    deathType: "meeting",
  },
  coffee_break: {
    text: "Coffee Break sanctioned — decaf still counts as a personality defect",
    deathType: "energy",
  },
  reorg_week: {
    text: "Reorg Week: reporting lines updated; your desk reports to itself",
    deathType: "reorg",
  },
  synergy_sprint: {
    text: "Synergy Sprint live — HR will grade your climb at the buzzer",
    deathType: "sprint",
  },
};

/** Headlines shown per UTC day in the home ticker rotation (3–5). */
export const TICKER_DAILY_COUNT = 4;

export interface PickTickerOptions {
  utcDate?: Date;
  presetId: DailyPresetId;
  careerBestYears: number;
}

/** Mirrors daily-modifier hashDateKey — kept here to avoid circular imports. */
function tickerHashDateKey(key: string): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = (Math.imul(31, h) + key.charCodeAt(i)) >>> 0;
  }
  return h;
}

function filterTickerPool(opts: PickTickerOptions): TickerHeadline[] {
  const rank = rankFromYears(opts.careerBestYears);
  const allowedDeaths = new Set<DeathType>([
    ...allowedObstacleTypes(rank, opts.presetId === "reorg_week"),
    "energy",
  ]);
  if (opts.presetId === "synergy_sprint") {
    allowedDeaths.add("sprint");
  }
  return NEWS_TICKER_HEADLINES.filter((h) => !h.deathType || allowedDeaths.has(h.deathType));
}

function pickDeterministicSubset(
  pool: TickerHeadline[],
  seed: string,
  count: number,
  excludeText?: string
): TickerHeadline[] {
  const candidates = excludeText ? pool.filter((h) => h.text !== excludeText) : [...pool];
  const source = candidates.length > 0 ? candidates : [...pool];
  const scored = source.map((h, i) => ({
    h,
    score: tickerHashDateKey(`${seed}|${i}|${h.text}`),
  }));
  scored.sort((a, b) => a.score - b.score);

  const result: TickerHeadline[] = [];
  const seen = new Set<string>();
  for (const { h } of scored) {
    if (result.length >= count) break;
    if (seen.has(h.text)) continue;
    seen.add(h.text);
    result.push(h);
  }
  return result;
}

/** Deterministic daily set for home ticker rotation — game-attached by shift, rank, and death type. */
export function pickTickerHeadlineSet(opts: PickTickerOptions): TickerHeadline[] {
  const utcDate = opts.utcDate ?? new Date();
  const dateKey = utcDate.toISOString().slice(0, 10);
  const pool = filterTickerPool(opts);

  if (opts.presetId !== "standard") {
    const pinned = SHIFT_TICKER_HEADLINES[opts.presetId];
    const extras = pickDeterministicSubset(
      pool,
      `${dateKey}|${opts.presetId}|${rankFromYears(opts.careerBestYears)}`,
      Math.max(1, TICKER_DAILY_COUNT - 1),
      pinned.text
    );
    return [pinned, ...extras].slice(0, TICKER_DAILY_COUNT);
  }

  return pickDeterministicSubset(
    pool,
    `${dateKey}|standard|${rankFromYears(opts.careerBestYears)}`,
    TICKER_DAILY_COUNT
  );
}

export function pickTickerHeadline(opts: PickTickerOptions): TickerHeadline {
  return pickTickerHeadlineSet(opts)[0]!;
}

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

export const MEETING_MONDAY_OPENING_MEMO =
  "Meeting Monday — your calendar owns you now. Blockers are decorative.";

export const CEO_TRAP_ANNOUNCEMENT =
  "Corner office secured. Quarterly deadlines now report directly to you.";

export const BOARD_TRAP_ANNOUNCEMENT =
  "Board seat secured. Governance quorum now blocks both lanes of your personal life.";

export const ANGEL_TRAP_ANNOUNCEMENT =
  "Term sheet signed. Runway deadlines and wellness kiosks now audit your biology.";

export const INTERN_FAKE_PROMO: { years: number; message: string }[] = [
  { years: 2, message: "Performance note filed: almost ready for real promotion. Almost." },
  { years: 5, message: "VP pinged about your trajectory. The ping was CC'd to nobody." },
  { years: 9.9, message: "Manager paperwork submitted. Printer jammed. Classic." },
];

export const BOARD_FAKE_PROMO: { years: number; message: string }[] = [
  {
    years: 52,
    message: "Spousal disclosure form filed under strategic partnership. Partnership under review.",
  },
  {
    years: 58,
    message: "Marital divestiture committee scheduled. Assets reorged before lunch.",
  },
  {
    years: 65,
    message: "Conflict-of-interest flagged with your weekend. HR cited fiduciary romance.",
  },
];

export const ANGEL_FAKE_PROMO: { years: number; message: string }[] = [
  {
    years: 78,
    message: "Executive longevity screening complete. Biology declined to comment.",
  },
  {
    years: 85,
    message: "Cardiologist ticket merged with your portfolio review. Same sprint.",
  },
  {
    years: 92,
    message: "IV drip lounge grand opening. Coffee is now a legacy integration.",
  },
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

export const RETRY_TIPS_BY_RANK: Partial<
  Record<Rank, Partial<Record<DeathType, string>>>
> = {
  "Board Member": {
    meeting: "Quorum owns that lane. Dodge governance, not product.",
    reorg: "Restructures shuffle fiduciary drama. Next rung stays frozen.",
    burnout: "Filing deadlines outrank your calendar. Side-step the paperwork.",
    foliage: "ESG mandate planted there. Biophilic compliance is not optional.",
    energy: "Even the board runs dry. Coffee before the disclosure committee.",
  },
  "Angel Investor": {
    meeting: "Pitch deck collision. Investors love slides in your lane.",
    reorg: "Pivot shuffled the runway. Frozen rung still holds.",
    burnout: "Runway clock owns that side. Due diligence is vibes-based.",
    foliage: "Wellness kiosk deployed. IV drip is not a dodge strategy.",
    energy: "Portfolio review drained you. Hydration is a KPI now.",
  },
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
  Director: [
    "Directed strategy until strategy directed you out the door.",
    "Your steering committee steered into a quarterly deadline. You were the airbag.",
    "Signed off on a roadmap that routed through your own exit interview.",
    "Owned three OKRs and zero outcomes. Finance noticed the ratio.",
  ],
  CEO: [
    "The board voted unanimously against your vision. And your expense report.",
    "Strategic pivot into a pivot. You were the pivot.",
    "All-hands applauded your memo. Nobody read past the subject line.",
    "Corner office view excellent. Runway visibility zero.",
  ],
  "Board Member": [
    "Spousal disclosure committee voted you out of your own marriage.",
    "Whistleblower forwarded your calendar to Legal. Quorum optional.",
    "Marital divestiture memo filed under strategic partnership. Partnership dissolved.",
    "Governance meeting about your marriage yielded no standing decisions.",
  ],
  "Angel Investor": [
    "Executive longevity screening flagged pre-existing ambition. Cardiology concurred.",
    "Term sheet signed. Biology opened a follow-up ticket in the same sprint.",
    "Portfolio review included your joints. Due diligence was vibes-based.",
    "IV drip lounge replaced coffee. Hydration KPI met. Energy bar did not.",
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
  Director:
    "Promoted to Director. You now own a strategy deck and the deadlines that come with it.",
  CEO: "Reached CEO. Strategic budget requests denied. Monocle unlocked. The board is watching.",
  "Board Member":
    "Promoted to the Board. Your calendar is now other people's emergencies.",
  "Angel Investor":
    "Angel Investor unlocked. You write checks for pivots you would've killed as CEO.",
};

export function formatTickerText(headline: TickerHeadline): string {
  return `* ${headline.text} *`;
}

export const TICKER_MARQUEE_SEPARATOR = " · ";

export function formatTickerMarqueeText(headlines: TickerHeadline[]): string {
  return headlines.map(formatTickerText).join(TICKER_MARQUEE_SEPARATOR);
}

export const TICKER_MARQUEE_PX_PER_SEC = 55;

export function formatTickerMarqueeLoopText(headlines: TickerHeadline[]): string {
  const once = formatTickerMarqueeText(headlines);
  return `${once}${TICKER_MARQUEE_SEPARATOR}${once}`;
}

/** Duration for one seamless copy pass at constant scroll speed. */
export function tickerMarqueeDurationFromCopyWidth(copyWidthPx: number): number {
  const sec = copyWidthPx / TICKER_MARQUEE_PX_PER_SEC;
  return Math.min(90, Math.max(18, Math.round(sec * 10) / 10));
}

export function reappliesFlavor(runCount: number): string {
  for (const tier of REAPPLY_FLAVOR) {
    if (runCount >= tier.minRuns) return tier.line;
  }
  return REAPPLY_FLAVOR[REAPPLY_FLAVOR.length - 1]!.line;
}

/** Years at which the playfield switches from Intern Pit to Open Office. */
export const OPEN_OFFICE_YEARS = 5;

/** Progressive corporate environment band — drives both floor label and ghost backdrop. */
export type CorpEnvBand =
  | "intern-pit"
  | "open-office"
  | "middle-management"
  | "director-wing"
  | "executive-suite"
  | "boardroom"
  | "investor-lounge";

const CORP_ENV_BAND_LABELS: Record<CorpEnvBand, string> = {
  "intern-pit": "Intern Pit",
  "open-office": "Open Office",
  "middle-management": "Middle Management",
  "director-wing": "Director Wing",
  "executive-suite": "Executive Suite",
  boardroom: "Boardroom",
  "investor-lounge": "Investor Lounge",
};

/** CSS class on `#corpGhostBg` for each band (see `.corp-env-*` in style.css). */
export const CORP_ENV_BAND_CLASSES: Record<CorpEnvBand, string> = {
  "intern-pit": "corp-env-intern-pit",
  "open-office": "corp-env-open-office",
  "middle-management": "corp-env-middle-management",
  "director-wing": "corp-env-director-wing",
  "executive-suite": "corp-env-executive-suite",
  boardroom: "corp-env-boardroom",
  "investor-lounge": "corp-env-investor-lounge",
};

export function corpEnvBandForYears(years: number): CorpEnvBand {
  if (years < OPEN_OFFICE_YEARS) return "intern-pit";
  if (years < MANAGER_YEARS) return "open-office";
  if (years < DIRECTOR_YEARS) return "middle-management";
  if (years < CEO_YEARS) return "director-wing";
  if (years < BOARD_YEARS) return "executive-suite";
  if (years < ANGEL_YEARS) return "boardroom";
  return "investor-lounge";
}

export function floorLabel(years: number): string {
  const floor = Math.max(1, Math.floor(years) + 1);
  return `Floor ${floor} — ${CORP_ENV_BAND_LABELS[corpEnvBandForYears(years)]}`;
}

export function isExecutiveRank(rank: Rank): boolean {
  return rank === "CEO" || rank === "Board Member" || rank === "Angel Investor";
}

export function rankPropEmoji(rank: Rank): string {
  if (rank === "Angel Investor") return "💸";
  if (rank === "Board Member") return "🪑";
  if (rank === "CEO") return "🧐";
  if (rank === "Director") return "💼";
  if (rank === "Manager") return "📋";
  return "🪪";
}

export function rankFromYears(years: number): Rank {
  if (years >= ANGEL_YEARS) return "Angel Investor";
  if (years >= BOARD_YEARS) return "Board Member";
  if (years >= CEO_YEARS) return "CEO";
  if (years >= DIRECTOR_YEARS) return "Director";
  if (years >= MANAGER_YEARS) return "Manager";
  return "Intern";
}

export function rankEmoji(rank: Rank): string {
  if (rank === "Angel Investor") return "👼";
  if (rank === "Board Member") return "🏛️";
  if (rank === "CEO") return "👑";
  if (rank === "Director") return "🕴️";
  if (rank === "Manager") return "🧑‍💼";
  return "🧑‍💻";
}

export function milestoneLabel(years: number): string {
  if (years >= ANGEL_YEARS) return "Term sheet signed";
  if (years >= BOARD_YEARS) {
    const remaining = Math.max(0, ANGEL_YEARS - years);
    return `Angel round in ${remaining.toFixed(1)}y`;
  }
  if (years >= CEO_YEARS) {
    const remaining = Math.max(0, BOARD_YEARS - years);
    return `Board seat in ${remaining.toFixed(1)}y`;
  }
  if (years >= DIRECTOR_YEARS) {
    const remaining = Math.max(0, CEO_YEARS - years);
    return `CEO myth in ${remaining.toFixed(1)}y`;
  }
  if (years >= MANAGER_YEARS) {
    const remaining = Math.max(0, DIRECTOR_YEARS - years);
    return `Director in ${remaining.toFixed(1)}y`;
  }
  const remaining = Math.max(0, MANAGER_YEARS - years);
  return `Manager in ${remaining.toFixed(1)}y`;
}

export function allowedObstacleTypes(rank: Rank, allowEarlyReorg = false): ObstacleType[] {
  if (isExecutiveRank(rank)) return ["meeting", "reorg", "burnout", "foliage"];
  if (rank === "Director") return ["meeting", "reorg", "badge_gate", "burnout"];
  if (rank === "Manager") return ["meeting", "reorg", "badge_gate"];
  if (allowEarlyReorg) return ["meeting", "reorg"];
  return ["meeting"];
}

/** Weighted pick from rank-allowed types only (sums to 1 within each pool). */
const OBSTACLE_WEIGHTS: Partial<Record<Rank, Partial<Record<ObstacleType, number>>>> = {
  Intern: { meeting: 1 },
  Manager: { meeting: 0.55, reorg: 0.3, badge_gate: 0.15 },
  Director: { meeting: 0.45, reorg: 0.28, badge_gate: 0.12, burnout: 0.15 },
  CEO: { meeting: 0.4, reorg: 0.25, burnout: 0.2, foliage: 0.15 },
  "Board Member": { meeting: 0.48, reorg: 0.27, burnout: 0.12, foliage: 0.13 },
  "Angel Investor": { meeting: 0.35, reorg: 0.22, burnout: 0.28, foliage: 0.25 },
};

export type ObstacleBadgeDisplay = { emoji: string; label: string };

const DEFAULT_BADGE_DISPLAY: Record<ObstacleType, ObstacleBadgeDisplay> = {
  meeting: { emoji: "📅", label: "Meeting" },
  reorg: { emoji: "🔄", label: "Reorg" },
  burnout: { emoji: "⏰", label: "Deadline" },
  badge_gate: { emoji: "🪪", label: "Gate" },
  foliage: { emoji: "🪴", label: "Plant" },
};

const BOARD_BADGE_DISPLAY: Partial<Record<ObstacleType, ObstacleBadgeDisplay>> = {
  meeting: { emoji: "🏛️", label: "Quorum" },
  reorg: { emoji: "📋", label: "Restructure" },
  burnout: { emoji: "📑", label: "Filing" },
  foliage: { emoji: "🌿", label: "ESG" },
};

const ANGEL_BADGE_DISPLAY: Partial<Record<ObstacleType, ObstacleBadgeDisplay>> = {
  meeting: { emoji: "📊", label: "Pitch" },
  reorg: { emoji: "🔀", label: "Pivot" },
  burnout: { emoji: "🛫", label: "Runway" },
  foliage: { emoji: "💉", label: "Wellness" },
};

export function obstacleBadgeDisplay(
  type: ObstacleType,
  rank: Rank,
  opts?: { isImminent?: boolean; dailyModifierId?: string; rungId?: number }
): ObstacleBadgeDisplay {
  const isImminent = opts?.isImminent ?? false;
  const dailyModifierId = opts?.dailyModifierId ?? "standard";
  const rungId = opts?.rungId ?? 0;

  if (type === "meeting" && dailyModifierId === "meeting_monday") {
    if (rungId % 2 === 0) {
      return { emoji: "📧", label: "Reply-All" };
    }
    return { emoji: "🧍", label: "Standup" };
  }

  if (type === "reorg" && isImminent) {
    return { emoji: "🧊", label: "Frozen" };
  }

  if (rank === "Board Member" && BOARD_BADGE_DISPLAY[type]) {
    return BOARD_BADGE_DISPLAY[type]!;
  }
  if (rank === "Angel Investor" && ANGEL_BADGE_DISPLAY[type]) {
    return ANGEL_BADGE_DISPLAY[type]!;
  }

  return DEFAULT_BADGE_DISPLAY[type];
}

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
  return isExecutiveRank(rank) ? REORG_INTERVAL_CEO_MS : REORG_INTERVAL_MS;
}
