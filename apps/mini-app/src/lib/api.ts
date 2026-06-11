const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
export const API_TIMEOUT_MS = 8000;

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
  | { ok: true }
  | { ok: false; reason: ApiFailureReason };

export type LeaderboardResult =
  | { ok: true; entries: LeaderboardEntry[] }
  | { ok: false; reason: ApiFailureReason };

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
): Promise<{ ok: true; data: T } | { ok: false; reason: ApiFailureReason }> {
  try {
    const res = await fetchWithTimeout(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      return { ok: false, reason: statusToReason(res.status) };
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

export async function submitRun(
  initData: string,
  payload: {
    yearsSurvived: number;
    finalRank: string;
    terminationCause: string;
    rungsClimbed: number;
    sprintMode?: boolean;
  }
): Promise<SubmitRunResult> {
  if (!initData) return { ok: false, reason: "auth" };
  const result = await apiPost<{ ok: boolean }>("/runs", {
    initData,
    years_survived: payload.yearsSurvived,
    final_rank: payload.finalRank,
    termination_cause: payload.terminationCause,
    rungs_climbed: payload.rungsClimbed,
    sprint_mode: payload.sprintMode ?? false,
  });
  if (!result.ok) return result;
  return { ok: true };
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
  sessionToken?: string | null
): Promise<LeaderboardResult> {
  try {
    const params = new URLSearchParams({ period, limit: "50" });
    const res = await fetchWithTimeout(`${API_URL}/leaderboard?${params}`);
    if (!res.ok) {
      return { ok: false, reason: statusToReason(res.status) };
    }
    const data = (await res.json()) as LeaderboardResponse;
    const entries = [...data.entries];

    const token = sessionToken ?? cachedSessionToken;
    if (token) {
      const me = await fetchLeaderboardMe(period, token);
      if (me?.on_board && me.rank != null) {
        for (const entry of entries) {
          if (entry.rank === me.rank) {
            entry.is_current_user = true;
            break;
          }
        }
      }
    }

    return { ok: true, entries };
  } catch {
    return { ok: false, reason: "network" };
  }
}
