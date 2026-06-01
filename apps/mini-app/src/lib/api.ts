const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
export const API_TIMEOUT_MS = 8000;

export interface UserProfile {
  telegram_id: number;
  username: string | null;
  first_name: string | null;
  best_score: number;
  best_rank: string;
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

export type ApiFailureReason = "auth" | "rate_limit" | "network" | "server";

export type ProfileResult =
  | { ok: true; profile: UserProfile }
  | { ok: false; reason: ApiFailureReason };

export type SubmitRunResult =
  | { ok: true }
  | { ok: false; reason: ApiFailureReason };

export type LeaderboardResult =
  | { ok: true; entries: LeaderboardEntry[] }
  | { ok: false; reason: ApiFailureReason };

function statusToReason(status: number): ApiFailureReason {
  if (status === 401) return "auth";
  if (status === 429) return "rate_limit";
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
  return { ok: true, profile: result.data };
}

export async function submitRun(
  initData: string,
  payload: {
    yearsSurvived: number;
    finalRank: string;
    terminationCause: string;
    rungsClimbed: number;
  }
): Promise<SubmitRunResult> {
  if (!initData) return { ok: false, reason: "auth" };
  const result = await apiPost<{ ok: boolean }>("/runs", {
    initData,
    years_survived: payload.yearsSurvived,
    final_rank: payload.finalRank,
    termination_cause: payload.terminationCause,
    rungs_climbed: payload.rungsClimbed,
  });
  if (!result.ok) return result;
  return { ok: true };
}

export async function fetchLeaderboard(
  period: "daily" | "weekly",
  initData?: string
): Promise<LeaderboardResult> {
  try {
    const params = new URLSearchParams({ period, limit: "50" });
    if (initData) params.set("initData", initData);
    const res = await fetchWithTimeout(`${API_URL}/leaderboard?${params}`);
    if (!res.ok) {
      return { ok: false, reason: statusToReason(res.status) };
    }
    const data = (await res.json()) as LeaderboardResponse;
    return { ok: true, entries: data.entries };
  } catch {
    return { ok: false, reason: "network" };
  }
}
