import {
  COFFEE_SPAWN_THRESHOLD,
  INTERN_OBSTACLE_SPAWN_RATE,
  OBSTACLE_SPAWN_RATE,
} from "./constants";

export type DailyPresetId =
  | "standard"
  | "meeting_monday"
  | "coffee_break"
  | "reorg_week"
  | "synergy_sprint";

export interface DailyModifier {
  id: DailyPresetId;
  label: string;
  description: string;
  obstacleSpawnRate: number;
  internObstacleSpawnRate: number;
  coffeeSpawnThreshold: number;
  /** 0–1: cumulative threshold for meeting branch in pickObstacleType */
  meetingPickThreshold: number;
  allowEarlyReorg: boolean;
  /** Optional CSS class on office-grid for preset tint */
  gridTintClass?: string;
  /** Wall-clock run cap (ms); score = years at timeout */
  sprintDurationMs?: number;
}

const PRESET_ORDER: DailyPresetId[] = [
  "standard",
  "meeting_monday",
  "coffee_break",
  "reorg_week",
  "synergy_sprint",
];

/** Monday=1 … Sunday=0 (Date.getUTCDay) → preset id */
const UTC_DAY_PRESET: DailyPresetId[] = [
  "standard", // Sun
  "meeting_monday", // Mon
  "standard", // Tue
  "coffee_break", // Wed
  "reorg_week", // Thu
  "synergy_sprint", // Fri
  "coffee_break", // Sat
];

const PRESETS: Record<DailyPresetId, DailyModifier> = {
  standard: {
    id: "standard",
    label: "Open Floor Plan",
    description: "Synergy optional. Attendance mandatory. Noise +20%. Privacy −80%. Promotion odds unchanged.",
    obstacleSpawnRate: OBSTACLE_SPAWN_RATE,
    internObstacleSpawnRate: INTERN_OBSTACLE_SPAWN_RATE,
    coffeeSpawnThreshold: COFFEE_SPAWN_THRESHOLD,
    meetingPickThreshold: 0.5,
    allowEarlyReorg: false,
  },
  meeting_monday: {
    id: "meeting_monday",
    label: "Meeting Monday",
    description: "Your calendar owns you now. Blockers are decorative. Meeting density +35%. Focus −100%.",
    obstacleSpawnRate: 0.42,
    internObstacleSpawnRate: 0.28,
    coffeeSpawnThreshold: COFFEE_SPAWN_THRESHOLD,
    meetingPickThreshold: 0.72,
    allowEarlyReorg: false,
  },
  coffee_break: {
    id: "coffee_break",
    label: "Coffee Break",
    description: "HR approved hydration. Decaf still not a strategy. Coffee spawns +40%. Sleep debt unchanged.",
    obstacleSpawnRate: OBSTACLE_SPAWN_RATE,
    internObstacleSpawnRate: INTERN_OBSTACLE_SPAWN_RATE,
    coffeeSpawnThreshold: 0.72,
    meetingPickThreshold: 0.5,
    allowEarlyReorg: false,
  },
  reorg_week: {
    id: "reorg_week",
    label: "Reorg Week",
    description:
      "Org chart unstable. Reporting lines are suggestions. Reorgs ramp after onboarding (~3y). Titles fluid.",
    obstacleSpawnRate: 0.38,
    internObstacleSpawnRate: INTERN_OBSTACLE_SPAWN_RATE,
    coffeeSpawnThreshold: COFFEE_SPAWN_THRESHOLD,
    meetingPickThreshold: 0.38,
    allowEarlyReorg: true,
    gridTintClass: "office-grid-reorg-week",
  },
  synergy_sprint: {
    id: "synergy_sprint",
    label: "Synergy Sprint",
    description: "60 seconds. Velocity is a feeling. Outcomes are quarterly. Leaderboard caps at 25y — HR audits velocity. Timer − mercy. Score = years at buzzer.",
    obstacleSpawnRate: 0.4,
    internObstacleSpawnRate: 0.26,
    coffeeSpawnThreshold: 0.8,
    meetingPickThreshold: 0.55,
    allowEarlyReorg: false,
    sprintDurationMs: 60_000,
  },
};

/** Legacy hash — dev/tests only; production preset uses UTC_DAY_PRESET. */
export function hashDateKey(key: string): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = (Math.imul(31, h) + key.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function presetIdForDate(utcDate: Date): DailyPresetId {
  const day = utcDate.getUTCDay();
  return UTC_DAY_PRESET[day] ?? "standard";
}

export function getDailyModifier(utcDate: Date = new Date()): DailyModifier {
  return { ...PRESETS[presetIdForDate(utcDate)] };
}

export function getDailyModifierById(id: DailyPresetId): DailyModifier {
  return { ...PRESETS[id] };
}

export function isDailyPresetId(value: string): value is DailyPresetId {
  return PRESET_ORDER.includes(value as DailyPresetId);
}

const DEV_OVERRIDE_KEY = "cl-daily-preset";

/** Active modifier: dev URL/localStorage override, else UTC day preset */
export function resolveDailyModifier(utcDate: Date = new Date()): DailyModifier {
  if (import.meta.env.DEV && typeof window !== "undefined") {
    const qp = new URLSearchParams(window.location.search).get("dailyPreset");
    if (qp && isDailyPresetId(qp)) {
      return getDailyModifierById(qp);
    }
    try {
      const stored = localStorage.getItem(DEV_OVERRIDE_KEY);
      if (stored && isDailyPresetId(stored)) {
        return getDailyModifierById(stored);
      }
    } catch {
      /* ignore */
    }
  }
  return getDailyModifier(utcDate);
}

export function setDevDailyPreset(id: DailyPresetId | null): void {
  if (!import.meta.env.DEV || typeof window === "undefined") return;
  if (id === null) {
    localStorage.removeItem(DEV_OVERRIDE_KEY);
  } else {
    localStorage.setItem(DEV_OVERRIDE_KEY, id);
  }
}
