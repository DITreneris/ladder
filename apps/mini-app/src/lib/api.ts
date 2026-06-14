import { rankFromYears } from "../game/constants";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
export const API_TIMEOUT_MS = 8000;
/** Matches API SUBMIT_COOLDOWN_SECONDS + 1s buffer for 429 retry. */
export const SUBMIT_COOLDOWN_RETRY_MS = 11_000;
export const SUBMIT_MAX_ATTEMPTS = 3;

export interface UserProfile {
  telegram_id: number;
  username: string | null;
  first_name: string | null;
  best_score: number;
  best_rank: string;
  session_token?: string | null;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  first_name: string | null;
  years_survived: number;
  final_rank: string;
  is_current_user: boolean;
}

export interface LeaderboardResponse {
  period: string;
  entries: LeaderboardEntry[];
}

export interface LeaderboardMeResponse {
  period: string;
  rank: number | null;
  years_survived: number | null;
  final_rank: string | null;
  on_board: boolean;
}

export type ApiFailureReason = "auth" | "rate_limit" | "validation" | "network" | "server";

export type ProfileResult =
  | { ok: true; profile: UserProfile; sessionToken: string | null }
  | { ok: false; reason: ApiFailureReason };

export type SubmitRunResult =
  | { ok: true; bestScore: number; bestRank: string }
  | { ok: false; reason: ApiFailureReason; detail?: string };

export type LeaderboardResult =
  | { ok: true; entries: LeaderboardEntry[] }
  | { ok: false; reason: ApiFailureReason };

export interface SubmitRunCallbacks {
  onRetry?: (attempt: number, waitMs: number, secondsRemaining: number) => void;
  /** Local career high before this run — enables immediate 429 retry when beating PB. */
  previousBestScore?: number;
}

let cachedSessionToken: string | null = null;

export function getSessionToken(): string | null {
  return cachedSessionToken;
}

export function setSessionToken(token: string | null): void {
  cachedSessionToken = token;
}

export function statusToReason(status: number): ApiFailureReason {
  if (status === 401) return "auth";
  if (status === 429) return "rate_limit";
  if (status === 400 || status === 422) return "validation";
  if (status >= 500) return "server";
  return "server";
}

async function fetchWithTimeout(
  url: string,
  options?: RequestInit,
  timeoutMs = API_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function apiPost<T>(
  path: string,
  body: unknown
): Promise<
  { ok: true; data: T } | { ok: false; reason: ApiFailureReason; status?: number; detail?: string }
> {
  try {
    const res = await fetchWithTimeout(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      let detail: string | undefined;
      try {
        const errBody = (await res.json()) as { detail?: unknown };
        detail = typeof errBody.detail === "string" ? errBody.detail : JSON.stringify(errBody.detail);
      } catch {
        detail = undefined;
      }
      return { ok: false, reason: statusToReason(res.status), status: res.status, detail };
    }
    return { ok: true, data: (await res.json()) as T };
  } catch {
    return { ok: false, reason: "network" };
  }
}

export async function fetchProfile(initData: string): Promise<ProfileResult> {
  if (!initData) return { ok: false, reason: "auth" };
  const result = await apiPost<UserProfile>("/auth/me", { initData });
  if (!result.ok) return result;
  const token = result.data.session_token ?? null;
  setSessionToken(token);
  return { ok: true, profile: result.data, sessionToken: token };
}

async function sleepMsWithCountdown(
  ms: number,
  onTick?: (secondsRemaining: number) => void
): Promise<void> {
  const started = Date.now();
  const tick = (): void => {
    const elapsed = Date.now() - started;
    const remaining = Math.max(0, ms - elapsed);
    const sec = Math.ceil(remaining / 1000);
    onTick?.(sec);
  };
  tick();
  const interval = setInterval(tick, 100);
  await new Promise<void>((resolve) => {
    setTimeout(() => {
      clearInterval(interval);
      resolve();
    }, ms);
  });
}

export async function submitRun(
  initData: string,
  payload: {
    yearsSurvived: number;
    finalRank: string;
    terminationCause: string;
    rungsClimbed: number;
    sprintMode?: boolean;
    runStartedAt: number;
    runEndedAt?: number;
  },
  callbacks?: SubmitRunCallbacks
): Promise<SubmitRunResult> {
  if (!initData) return { ok: false, reason: "auth" };
  const rungsClimbed = Math.max(0, Math.round(payload.rungsClimbed));
  const yearsSurvived = Number(payload.yearsSurvived);
  if (!Number.isFinite(yearsSurvived)) return { ok: false, reason: "validation" };
  const finalRank = rankFromYears(yearsSurvived);
  const runEndedAt = payload.runEndedAt ?? Date.now();
  const body = {
    initData,
    years_survived: yearsSurvived,
    final_rank: finalRank,
    termination_cause: payload.terminationCause ?? "",
    rungs_climbed: rungsClimbed,
    sprint_mode: Boolean(payload.sprintMode),
    run_started_at: Math.floor(payload.runStartedAt / 1000),
    run_ended_at: Math.floor(runEndedAt / 1000),
  };

  const previousBest = callbacks?.previousBestScore ?? 0;
  let immediateRetryUsed = false;

  let lastResult:
    | { ok: true; data: { ok: boolean; best_score: number; best_rank: string } }
    | { ok: false; reason: ApiFailureReason; status?: number; detail?: string }
    | null = null;

  for (let attempt = 1; attempt <= SUBMIT_MAX_ATTEMPTS; attempt++) {
    lastResult = await apiPost<{ ok: boolean; best_score: number; best_rank: string }>("/runs", body);
    if (lastResult.ok) {
      return {
        ok: true,
        bestScore: lastResult.data.best_score,
        bestRank: lastResult.data.best_rank,
      };
    }
    const retriable =
      (lastResult.reason === "rate_limit" || lastResult.reason === "server") &&
      attempt < SUBMIT_MAX_ATTEMPTS;
    if (retriable) {
      if (lastResult.reason === "rate_limit") {
        const canImmediateRetry =
          !immediateRetryUsed && yearsSurvived > previousBest && previousBest >= 0;
        if (canImmediateRetry) {
          immediateRetryUsed = true;
          continue;
        }
      }
      callbacks?.onRetry?.(attempt, SUBMIT_COOLDOWN_RETRY_MS, Math.ceil(SUBMIT_COOLDOWN_RETRY_MS / 1000));
      await sleepMsWithCountdown(SUBMIT_COOLDOWN_RETRY_MS, (sec) => {
        callbacks?.onRetry?.(attempt, SUBMIT_COOLDOWN_RETRY_MS, sec);
      });
      continue;
    }
    break;
  }
  if (lastResult && !lastResult.ok) {
    return { ok: false, reason: lastResult.reason, detail: lastResult.detail };
  }
  return { ok: false, reason: "server" };
}

async function fetchLeaderboardMe(
  period: "daily" | "weekly",
  sessionToken: string
): Promise<LeaderboardMeResponse | null> {
  const result = await apiPost<LeaderboardMeResponse>("/leaderboard/me", {
    sessionToken,
    period,
  });
  if (!result.ok) return null;
  return result.data;
}

export { fetchLeaderboardMe };

export type PrepareShareResult =
  | { ok: true; preparedMessageId: string }
  | { ok: false; reason: ApiFailureReason };

export interface SharePreparePayload {
  initData: string;
  yearsSurvived: number;
  finalRank: string;
  shiftLabel: string;
  terminationDetail: string;
  terminationFlavor: string;
  deathType?: string | null;
}

export async function prepareShare(payload: SharePreparePayload): Promise<PrepareShareResult> {
  if (!payload.initData) return { ok: false, reason: "auth" };
  const result = await apiPost<{ preparedMessageId: string }>("/share/prepare", {
    initData: payload.initData,
    years_survived: payload.yearsSurvived,
    final_rank: payload.finalRank,
    shift_label: payload.shiftLabel,
    termination_detail: payload.terminationDetail,
    termination_flavor: payload.terminationFlavor,
    death_type: payload.deathType ?? null,
  });
  if (!result.ok) return result;
  return { ok: true, preparedMessageId: result.data.preparedMessageId };
}

export async function fetchLeaderboard(
  period: "daily" | "weekly",
  _sessionToken?: string | null
): Promise<LeaderboardResult> {
  try {
    const params = new URLSearchParams({ period, limit: "50" });
    const res = await fetchWithTimeout(`${API_URL}/leaderboard?${params}`);
    if (!res.ok) {
      return { ok: false, reason: statusToReason(res.status) };
    }
    const data = (await res.json()) as LeaderboardResponse;
    return { ok: true, entries: [...data.entries] };
  } catch {
    return { ok: false, reason: "network" };
  }
}

export async function fetchLeaderboardWithMeHighlight(
  period: "daily" | "weekly",
  sessionToken?: string | null
): Promise<LeaderboardResult> {
  const result = await fetchLeaderboard(period);
  if (!result.ok) return result;

  const token = sessionToken ?? cachedSessionToken;
  if (token) {
    const me = await fetchLeaderboardMe(period, token);
    if (me?.on_board && me.rank != null) {
      for (const entry of result.entries) {
        if (entry.rank === me.rank) {
          entry.is_current_user = true;
          break;
        }
      }
    }
  }

  return result;
}
