/**
 * Durable queue of failed score submits (survives app reload).
 *
 * Backstop for the in-memory revive flow: when a submit fails with a recoverable
 * reason (auth/network/server), the run is persisted here so it can be
 * auto-resubmitted after the next successful /auth/me. The stored `clientRunId`
 * lets the server dedupe via the atomic submit idempotency index (migration 006),
 * so a resubmit is safe even if the original run actually landed.
 */

export const PENDING_SUBMIT_STORAGE_KEY = "corp_ladder_pending_submits";
/** Keep aligned with API DEFERRED_GRACE_SECONDS so we never resubmit a run the server will reject. */
export const PENDING_SUBMIT_TTL_MS = 26 * 60 * 60 * 1000;
export const PENDING_SUBMIT_MAX = 5;

export interface PendingSubmit {
  clientRunId: string;
  yearsSurvived: number;
  finalRank: string;
  terminationCause: string;
  rungsClimbed: number;
  sprintMode: boolean;
  runStartedAt: number;
  runEndedAt: number;
  createdAt: number;
}

function storage(): Storage | null {
  try {
    return typeof localStorage !== "undefined" ? localStorage : null;
  } catch {
    return null;
  }
}

function isValidEntry(value: unknown): value is PendingSubmit {
  if (typeof value !== "object" || value === null) return false;
  const e = value as Record<string, unknown>;
  return (
    typeof e.clientRunId === "string" &&
    e.clientRunId.length > 0 &&
    typeof e.yearsSurvived === "number" &&
    Number.isFinite(e.yearsSurvived) &&
    typeof e.finalRank === "string" &&
    typeof e.terminationCause === "string" &&
    typeof e.rungsClimbed === "number" &&
    typeof e.sprintMode === "boolean" &&
    typeof e.runStartedAt === "number" &&
    typeof e.runEndedAt === "number" &&
    typeof e.createdAt === "number"
  );
}

function readRaw(): PendingSubmit[] {
  const store = storage();
  if (!store) return [];
  try {
    const raw = store.getItem(PENDING_SUBMIT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidEntry);
  } catch {
    return [];
  }
}

function write(entries: PendingSubmit[]): void {
  const store = storage();
  if (!store) return;
  try {
    if (entries.length === 0) {
      store.removeItem(PENDING_SUBMIT_STORAGE_KEY);
      return;
    }
    store.setItem(PENDING_SUBMIT_STORAGE_KEY, JSON.stringify(entries));
  } catch {
    /* ignore quota/serialization errors */
  }
}

/** Drop entries older than the TTL; returns the surviving entries. */
export function pruneExpired(now: number = Date.now()): PendingSubmit[] {
  const entries = readRaw().filter((e) => now - e.createdAt < PENDING_SUBMIT_TTL_MS);
  write(entries);
  return entries;
}

/** Newest-first list of live (non-expired) pending submits. */
export function loadPending(now: number = Date.now()): PendingSubmit[] {
  return [...pruneExpired(now)].sort((a, b) => b.createdAt - a.createdAt);
}

/** Upsert by clientRunId; caps the queue to the newest PENDING_SUBMIT_MAX entries. */
export function addPending(entry: PendingSubmit): void {
  const others = pruneExpired(entry.createdAt).filter((e) => e.clientRunId !== entry.clientRunId);
  const next = [...others, entry].sort((a, b) => a.createdAt - b.createdAt);
  // FIFO drop oldest beyond cap.
  const capped = next.slice(Math.max(0, next.length - PENDING_SUBMIT_MAX));
  write(capped);
}

export function removePending(clientRunId: string): void {
  write(readRaw().filter((e) => e.clientRunId !== clientRunId));
}

export function clearPending(): void {
  write([]);
}
