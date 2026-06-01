import { describe, expect, it } from "vitest";
import {
  getDailyModifier,
  getDailyModifierById,
  hashDateKey,
  presetIdForDate,
  resolveDailyModifier,
} from "./daily-modifier";

describe("daily-modifier", () => {
  it("maps the same UTC date to the same preset", () => {
    const a = presetIdForDate(new Date("2026-06-01T12:00:00Z"));
    const b = presetIdForDate(new Date("2026-06-01T23:59:00Z"));
    expect(a).toBe(b);
  });

  it("returns stable hash for a date key", () => {
    expect(hashDateKey("2026-06-01")).toBe(hashDateKey("2026-06-01"));
    expect(hashDateKey("2026-06-02")).not.toBe(hashDateKey("2026-06-01"));
  });

  it("getDailyModifier includes label and spawn overrides for meeting monday", () => {
    const mod = getDailyModifierById("meeting_monday");
    expect(mod.label).toBe("Meeting Monday");
    expect(mod.obstacleSpawnRate).toBeGreaterThan(0.35);
    expect(mod.meetingPickThreshold).toBeGreaterThan(0.5);
  });

  it("reorg week enables early reorg", () => {
    const mod = getDailyModifierById("reorg_week");
    expect(mod.allowEarlyReorg).toBe(true);
    expect(mod.label).toBe("Reorg Week");
  });

  it("synergy sprint enables 60s wall-clock cap", () => {
    const mod = getDailyModifierById("synergy_sprint");
    expect(mod.label).toBe("Synergy Sprint");
    expect(mod.sprintDurationMs).toBe(60_000);
  });

  it("coffee break lowers coffee spawn threshold", () => {
    const mod = getDailyModifierById("coffee_break");
    expect(mod.coffeeSpawnThreshold).toBeLessThan(0.85);
  });

  it("getDailyModifier returns a copy of preset data", () => {
    const mod = getDailyModifier(new Date("2026-01-15T00:00:00Z"));
    expect(mod.id).toBe(presetIdForDate(new Date("2026-01-15T00:00:00Z")));
    expect(mod.description.length).toBeGreaterThan(0);
  });
});

describe("resolveDailyModifier", () => {
  it("falls back to UTC day preset in test env", () => {
    const mod = resolveDailyModifier(new Date("2026-03-10T00:00:00Z"));
    expect(mod.id).toBe(presetIdForDate(new Date("2026-03-10T00:00:00Z")));
  });
});
