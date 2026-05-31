import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./audio", () => ({
  audio: {
    init: vi.fn(),
    tap: vi.fn(),
    coffee: vi.fn(),
    promo: vi.fn(),
    gameOver: vi.fn(),
    reorg: vi.fn(),
    stress: vi.fn(),
  },
}));

import { getDailyModifierById } from "./daily-modifier";
import { GameEngine } from "./engine";
import type { DailyModifier } from "./daily-modifier";
import type { GameCallbacks, GameOverResult } from "./types";

function createEngine(
  overrides: Partial<GameCallbacks> = {},
  dailyModifier?: DailyModifier
) {
  const callbacks: GameCallbacks = {
    onScoreUpdate: vi.fn(),
    onRankChange: vi.fn(),
    onGameOver: vi.fn(),
    onCoffee: vi.fn(),
    onToast: vi.fn(),
    ...overrides,
  };
  const engine = new GameEngine(callbacks, vi.fn(), vi.fn(), vi.fn(), dailyModifier);
  return { engine, callbacks };
}

describe("GameEngine", () => {
  beforeEach(() => {
    vi.spyOn(Math, "random").mockReturnValue(0.99);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("stops active play after collision game over", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.1);
    const onGameOver = vi.fn();
    const { engine } = createEngine({ onGameOver });

    engine.start();
    engine.handleTap("left");
    engine.handleTap("left");
    engine.handleTap("left");

    expect(onGameOver).toHaveBeenCalledTimes(1);
    expect(engine.isActive()).toBe(false);
  });

  it("calls onCoffee when climbing onto a coffee rung", () => {
    const onCoffee = vi.fn();
    let randomCall = 0;
    vi.spyOn(Math, "random").mockImplementation(() => {
      const sequence = [0.9, 0.3, 0.99, 0.99, 0.99, 0.99, 0.99, 0.99];
      return sequence[randomCall++] ?? 0.99;
    });

    const { engine } = createEngine({ onCoffee });
    engine.start();
    engine.handleTap("left");
    engine.handleTap("left");
    engine.handleTap("left");

    expect(onCoffee).toHaveBeenCalledTimes(1);
  });

  it("does not drain energy before the first tap", () => {
    vi.useFakeTimers();
    const onGameOver = vi.fn();
    const { engine } = createEngine({ onGameOver });

    engine.start();
    vi.advanceTimersByTime(5000);

    expect(engine.getTimeLeft()).toBe(100);
    expect(onGameOver).not.toHaveBeenCalled();

    vi.useRealTimers();
  });

  it("reports game over result with rung count and flavor", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.99);
    let result: GameOverResult | null = null;
    const { engine } = createEngine({
      onGameOver: (r) => {
        result = r;
      },
    });

    engine.start();
    engine.handleTap("left");
    engine.handleTap("right");
    engine.stop();

    engine.handleTap("left");
    expect(result).toBeNull();

    vi.spyOn(Math, "random").mockReturnValue(0.1);
    const engine2 = createEngine({
      onGameOver: (r) => {
        result = r;
      },
    }).engine;
    engine2.start();
    engine2.handleTap("left");
    engine2.handleTap("left");
    engine2.handleTap("left");

    expect(result).not.toBeNull();
    expect(result!.rungsClimbed).toBeGreaterThan(0);
    expect(result!.finalRank).toBeDefined();
    expect(result!.terminationFlavor).toBeTruthy();
    expect(result!.deathType).toBeDefined();
  });

  it("intern phase never spawns reorg or deadline obstacles", () => {
    let randomCall = 0;
    vi.spyOn(Math, "random").mockImplementation(() => {
      const sequence = [
        0.1, 0.5, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9,
      ];
      return sequence[randomCall++] ?? 0.99;
    });

    const { engine } = createEngine();
    engine.start();

    for (let i = 0; i < 8; i++) {
      engine.handleTap(i % 2 === 0 ? "left" : "right");
    }

    const types = engine.getRungs().map((r) => r.type).filter(Boolean);
    expect(types.every((t) => t === "meeting" || t === null)).toBe(true);
  });

  it("does not swap the next rung during reorg tick", () => {
    vi.useFakeTimers();
    const { engine } = createEngine();
    engine.start();
    engine.handleTap("left");

    type EngineInternals = {
      rungs: { id: number; obstacle: string | null; type: string | null; coffee: string | null }[];
      currentRank: string;
    };
    const internal = engine as unknown as EngineInternals;
    internal.currentRank = "Manager";
    internal.rungs[1] = { id: 99, obstacle: "left", type: "reorg", coffee: null };
    internal.rungs[2] = { id: 100, obstacle: "right", type: "reorg", coffee: null };

    vi.advanceTimersByTime(650);

    expect(internal.rungs[1].obstacle).toBe("left");
    expect(internal.rungs[2].obstacle).toBe("left");

    vi.useRealTimers();
  });

  it("pauses energy drain for 2s after promotion", () => {
    vi.useFakeTimers();
    const { engine } = createEngine();
    engine.start();
    engine.handleTap("left");

    type EngineInternals = { score: number };
    const internal = engine as unknown as EngineInternals;
    internal.score = 39;
    engine.handleTap("right");

    const afterPromo = engine.getTimeLeft();
    vi.advanceTimersByTime(1500);
    expect(engine.getTimeLeft()).toBe(afterPromo);
    vi.advanceTimersByTime(1000);
    expect(engine.getTimeLeft()).toBeLessThan(afterPromo);

    vi.useRealTimers();
  });

  it("keeps reorg week preset across start()", () => {
    const { engine } = createEngine({}, getDailyModifierById("reorg_week"));
    expect(engine.getDailyModifier().allowEarlyReorg).toBe(true);
    engine.start();
    expect(engine.getDailyModifier().id).toBe("reorg_week");
    expect(engine.getDailyModifier().meetingPickThreshold).toBe(0.38);
  });

  it("forces tutorial coffee between rungs 8 and 12 when none collected", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.99);
    const { engine } = createEngine();
    engine.start();

    for (let i = 0; i < 8; i++) {
      engine.handleTap(i % 2 === 0 ? "left" : "right");
    }

    const rungs = engine.getRungs();
    const hasCoffee = rungs.some((r) => r.coffee !== null);
    expect(hasCoffee).toBe(true);
  });
});
