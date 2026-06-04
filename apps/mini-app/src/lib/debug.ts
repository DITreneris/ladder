import { MANAGER_YEARS } from "../game/constants";
import type { ObstacleType, PlayerSide, Rung } from "../game/types";

/** Imminent hint + safe-side glow through full Intern phase (Manager promotion at 10y). */
export const INTERN_HINT_RUNGS = MANAGER_YEARS * 4;

const DEBUG_KEY = "cl_debug";
const MAX_LOG_LINES = 5;

let stripEl: HTMLElement | null = null;
const eventLog: string[] = [];

const OBSTACLE_LABEL: Record<ObstacleType, string> = {
  meeting: "Meeting",
  reorg: "Reorg",
  burnout: "Deadline",
  badge_gate: "Badge gate",
  foliage: "Desk plant",
};

export function isDebugMode(): boolean {
  if (typeof window === "undefined") return false;
  if (new URLSearchParams(window.location.search).get("debug") === "1") return true;
  try {
    return localStorage.getItem(DEBUG_KEY) === "1";
  } catch {
    return false;
  }
}

function persistDebugFromUrl(): void {
  if (typeof window === "undefined") return;
  if (new URLSearchParams(window.location.search).get("debug") !== "1") return;
  try {
    localStorage.setItem(DEBUG_KEY, "1");
  } catch {
    /* ignore */
  }
}

function oppositeSide(side: PlayerSide): PlayerSide {
  return side === "left" ? "right" : "left";
}

function sideLabel(side: PlayerSide): string {
  return side === "left" ? "LEFT" : "RIGHT";
}

export function describeNextRung(rung: Rung | undefined): string {
  if (!rung) return "Next rung: waiting…";
  if (rung.obstacle) {
    const label = OBSTACLE_LABEL[rung.type ?? "meeting"];
    return `Next rung: ${label} on ${sideLabel(rung.obstacle)} → tap ${sideLabel(oppositeSide(rung.obstacle))}`;
  }
  if (rung.coffee) {
    return `Next rung: Coffee on ${sideLabel(rung.coffee)} → tap ${sideLabel(rung.coffee)} for +25% energy`;
  }
  return "Next rung: clear — either side is safe";
}

export type TapOutcome = "climb" | "coffee" | "death" | "throttle" | "inactive";

export function describeTapResult(
  side: PlayerSide,
  nextRung: Rung | undefined,
  outcome: TapOutcome
): string {
  if (outcome === "throttle") return `Tap ${sideLabel(side)} ignored (too fast — wait 120ms)`;
  if (outcome === "inactive") return `Tap ${sideLabel(side)} ignored (game not running)`;
  if (outcome === "death") {
    const label = nextRung?.type ? OBSTACLE_LABEL[nextRung.type] : "Obstacle";
    return `Tap ${sideLabel(side)} → hit ${label} → GAME OVER`;
  }
  if (outcome === "coffee") {
    return `Tap ${sideLabel(side)} → coffee picked up (+25% energy)`;
  }
  if (nextRung?.obstacle) {
    return `Tap ${sideLabel(side)} → safe climb (avoided ${OBSTACLE_LABEL[nextRung.type ?? "meeting"]})`;
  }
  return `Tap ${sideLabel(side)} → climb OK`;
}

function ensureDebugStrip(): HTMLElement | null {
  if (!isDebugMode()) return null;
  if (!stripEl) {
    stripEl = document.getElementById("debugStrip");
  }
  return stripEl;
}

function renderDebugStrip(nextLine: string, lastLine: string): void {
  const strip = ensureDebugStrip();
  if (!strip) return;
  const history = eventLog.slice(-MAX_LOG_LINES).join("\n");
  strip.textContent = [nextLine, lastLine, history ? `—\n${history}` : ""].filter(Boolean).join("\n");
  strip.classList.remove("hidden");
}

function pushEvent(line: string): void {
  eventLog.push(line);
  if (eventLog.length > MAX_LOG_LINES) eventLog.shift();
}

export function debugLog(tag: string, message: string, data?: unknown): void {
  if (!isDebugMode()) return;
  const detail = data !== undefined ? ` ${JSON.stringify(data)}` : "";
  console.log(`[CL ${tag}]`, message, data ?? "");
  pushEvent(`${tag}: ${message}${detail}`);
}

export function debugTapContext(nextRung: Rung | undefined): void {
  if (!isDebugMode()) return;
  const nextLine = describeNextRung(nextRung);
  renderDebugStrip(nextLine, eventLog[eventLog.length - 1] ?? "Last: —");
}

export function debugTapResult(side: PlayerSide, nextRung: Rung | undefined, outcome: TapOutcome): void {
  if (!isDebugMode()) return;
  const lastLine = describeTapResult(side, nextRung, outcome);
  pushEvent(lastLine);
  console.log("[CL result]", lastLine);
  renderDebugStrip(describeNextRung(nextRung), `Last: ${lastLine}`);
}

export function mountDebugStrip(): void {
  persistDebugFromUrl();
  if (!isDebugMode()) return;
  renderDebugStrip("Debug ON — tap deck picks your side on the NEXT rung", "Last: —");
}

export function shouldShowImminentHint(rungsClimbed: number): boolean {
  return isDebugMode() || rungsClimbed < INTERN_HINT_RUNGS;
}
