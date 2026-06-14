import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createHrMemoSchedulerForTests, randomRef } from "./hr-memo";

describe("hr-memo", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("randomRef returns REF-##### format", () => {
    const ref = randomRef();
    expect(ref).toMatch(/^REF-\d{5}$/);
  });

  it("drains queued memos in order", () => {
    const shown: string[] = [];
    const scheduler = createHrMemoSchedulerForTests(
      (entry) => {
        shown.push(entry.text);
      },
      () => {}
    );

    scheduler.show("First");
    scheduler.show("Second", { durationMs: 1000 });

    expect(shown).toEqual(["First"]);
    expect(scheduler.isShowing()).toBe(true);
    expect(scheduler.getQueueLength()).toBe(1);

    vi.advanceTimersByTime(1800);
    expect(shown).toEqual(["First", "Second"]);

    vi.advanceTimersByTime(1000);
    expect(scheduler.isShowing()).toBe(false);
  });

  it("hide clears pending queue", () => {
    const shown: string[] = [];
    const hidden: number[] = [];
    const scheduler = createHrMemoSchedulerForTests(
      (entry) => {
        shown.push(entry.text);
      },
      () => {
        hidden.push(shown.length);
      }
    );

    scheduler.show("First");
    scheduler.show("Second");
    scheduler.hide();

    expect(shown).toEqual(["First"]);
    expect(hidden.length).toBeGreaterThan(0);
    expect(scheduler.getQueueLength()).toBe(0);
    expect(scheduler.isShowing()).toBe(false);

    vi.advanceTimersByTime(5000);
    expect(shown).toEqual(["First"]);
  });

  it("drops oldest non-promo when queue exceeds cap", () => {
    const shown: string[] = [];
    const scheduler = createHrMemoSchedulerForTests(
      (entry) => {
        shown.push(entry.text);
      },
      () => {}
    );

    scheduler.show("Info one", { variant: "info" });
    scheduler.show("Info two", { variant: "info" });
    scheduler.show("Info three", { variant: "info" });

    expect(scheduler.getQueueLength()).toBeLessThanOrEqual(2);
  });
});
