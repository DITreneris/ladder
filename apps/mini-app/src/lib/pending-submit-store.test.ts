import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  addPending,
  clearPending,
  loadPending,
  PENDING_SUBMIT_MAX,
  PENDING_SUBMIT_STORAGE_KEY,
  PENDING_SUBMIT_TTL_MS,
  pruneExpired,
  removePending,
  type PendingSubmit,
} from "./pending-submit-store";

function createStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.get(key) ?? null;
    },
    key(index: number) {
      return [...store.keys()][index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
  };
}

function makeEntry(overrides: Partial<PendingSubmit> = {}): PendingSubmit {
  return {
    clientRunId: overrides.clientRunId ?? "run-1",
    yearsSurvived: overrides.yearsSurvived ?? 22,
    finalRank: overrides.finalRank ?? "Director",
    terminationCause: overrides.terminationCause ?? "Reorganization",
    rungsClimbed: overrides.rungsClimbed ?? 88,
    sprintMode: overrides.sprintMode ?? false,
    runStartedAt: overrides.runStartedAt ?? 1_000,
    runEndedAt: overrides.runEndedAt ?? 61_000,
    createdAt: overrides.createdAt ?? Date.now(),
  };
}

describe("pending-submit-store", () => {
  beforeEach(() => {
    (globalThis as { localStorage?: Storage }).localStorage = createStorage();
  });

  afterEach(() => {
    delete (globalThis as { localStorage?: Storage }).localStorage;
  });

  it("starts empty", () => {
    expect(loadPending()).toEqual([]);
  });

  it("adds and loads an entry", () => {
    const entry = makeEntry();
    addPending(entry);
    expect(loadPending()).toEqual([entry]);
  });

  it("upserts by clientRunId instead of duplicating", () => {
    const base = Date.now();
    addPending(makeEntry({ clientRunId: "run-1", yearsSurvived: 10, createdAt: base }));
    addPending(makeEntry({ clientRunId: "run-1", yearsSurvived: 20, createdAt: base + 1 }));
    const all = loadPending();
    expect(all).toHaveLength(1);
    expect(all[0]!.yearsSurvived).toBe(20);
  });

  it("removes an entry by clientRunId", () => {
    const base = Date.now();
    addPending(makeEntry({ clientRunId: "a", createdAt: base }));
    addPending(makeEntry({ clientRunId: "b", createdAt: base + 1 }));
    removePending("a");
    expect(loadPending().map((e) => e.clientRunId)).toEqual(["b"]);
  });

  it("returns entries newest-first", () => {
    const base = Date.now();
    addPending(makeEntry({ clientRunId: "old", createdAt: base + 100 }));
    addPending(makeEntry({ clientRunId: "new", createdAt: base + 200 }));
    expect(loadPending().map((e) => e.clientRunId)).toEqual(["new", "old"]);
  });

  it("caps the queue to PENDING_SUBMIT_MAX, dropping oldest", () => {
    const base = Date.now();
    for (let i = 0; i < PENDING_SUBMIT_MAX + 2; i++) {
      addPending(makeEntry({ clientRunId: `run-${i}`, createdAt: base + i }));
    }
    const all = loadPending();
    expect(all).toHaveLength(PENDING_SUBMIT_MAX);
    // Oldest two (run-0, run-1) dropped.
    expect(all.map((e) => e.clientRunId)).not.toContain("run-0");
    expect(all.map((e) => e.clientRunId)).not.toContain("run-1");
  });

  it("prunes entries older than the TTL", () => {
    const now = 10 * PENDING_SUBMIT_TTL_MS;
    addPending(makeEntry({ clientRunId: "stale", createdAt: now - PENDING_SUBMIT_TTL_MS - 1 }));
    addPending(makeEntry({ clientRunId: "fresh", createdAt: now - 1 }));
    const survivors = pruneExpired(now);
    expect(survivors.map((e) => e.clientRunId)).toEqual(["fresh"]);
  });

  it("ignores corrupt storage payloads", () => {
    localStorage.setItem(PENDING_SUBMIT_STORAGE_KEY, "{not json");
    expect(loadPending()).toEqual([]);
  });

  it("filters out structurally invalid entries", () => {
    localStorage.setItem(
      PENDING_SUBMIT_STORAGE_KEY,
      JSON.stringify([{ clientRunId: "x" }, makeEntry({ clientRunId: "valid" })])
    );
    expect(loadPending().map((e) => e.clientRunId)).toEqual(["valid"]);
  });

  it("clears all entries", () => {
    addPending(makeEntry());
    clearPending();
    expect(loadPending()).toEqual([]);
  });
});
