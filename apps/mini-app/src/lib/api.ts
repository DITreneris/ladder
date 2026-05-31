const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

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

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchProfile(initData: string): Promise<UserProfile | null> {
  if (!initData) return null;
  try {
    return await apiFetch<UserProfile>("/auth/me", {
      method: "POST",
      body: JSON.stringify({ initData }),
    });
  } catch {
    return null;
  }
}

export async function submitRun(
  initData: string,
  payload: {
    yearsSurvived: number;
    finalRank: string;
    terminationCause: string;
    rungsClimbed: number;
  }
): Promise<boolean> {
  if (!initData) return false;
  try {
    await apiFetch("/runs", {
      method: "POST",
      body: JSON.stringify({
        initData,
        years_survived: payload.yearsSurvived,
        final_rank: payload.finalRank,
        termination_cause: payload.terminationCause,
        rungs_climbed: payload.rungsClimbed,
      }),
    });
    return true;
  } catch {
    return false;
  }
}

export async function fetchLeaderboard(
  period: "daily" | "weekly",
  initData?: string
): Promise<LeaderboardEntry[]> {
  try {
    const params = new URLSearchParams({ period, limit: "50" });
    if (initData) params.set("initData", initData);
    const data = await apiFetch<LeaderboardResponse>(`/leaderboard?${params}`);
    return data.entries;
  } catch {
    return [];
  }
}
