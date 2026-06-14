import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./audio", () => ({
  audio: {
    init: vi.fn(),
    prepareBgmForRun: vi.fn(),
    startManagerBgmRamp: vi.fn(),
    stopBgm: vi.fn(),
    tap: vi.fn(),
    coffee: vi.fn(),
    promo: vi.fn(),
    gameOver: vi.fn(),
    reorg: vi.fn(),
    stress: vi.fn(),
  },
}));

import { getDailyModifierById } from "./daily-modifier";
import { audio } from "./audio";
import { GameEngine } from "./engine";
import {
  COFFEE_RECOVERY,
  INTERN_OBSTACLE_SPAWN_RATE,
  MIN_TAP_INTERVAL_MS,
  OBSTACLE_SPAWN_RATE,
  ROOKIE_INTERN_SPAWN_RATE_CAP,
  TICK_MS,
} from "./constants";
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

function tapWithCooldown(engine: GameEngine, side: "left" | "right"): void {
  engine.handleTap(side);
  vi.advanceTimersByTime(MIN_TAP_INTERVAL_MS + 10);
}

describe("GameEngine", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(Math, "random").mockReturnValue(0.99);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("stops active play after collision game over", () => {
    const onGameOver = vi.fn();
    const { engine } = createEngine({ onGameOver });

    engine.start();
    tapWithCooldown(engine, "left");
    tapWithCooldown(engine, "right");

    expect(onGameOver).toHaveBeenCalledTimes(1);
    expect(onGameOver.mock.calls[0]![0].deathType).toBe("meeting");
    expect(onGameOver.mock.calls[0]![0].runStartedAt).toBeGreaterThan(0);
    expect(engine.isActive()).toBe(false);
  });

  it("scripts tutorial rungs at start", () => {
    const { engine } = createEngine();
    engine.start();
    expect(engine.getRungs()[1]?.obstacle).toBeNull();
    expect(engine.getRungs()[2]?.obstacle).toBe("right");
    expect(engine.getRungs()[2]?.type).toBe("meeting");
    expect(engine.getRungs()[3]?.coffee).toBe("left");
  });

  it("calls onCoffee when climbing onto scripted tutorial coffee", () => {
    const onCoffee = vi.fn();
    const { engine } = createEngine({ onCoffee });
    engine.start();
    tapWithCooldown(engine, "left");
    tapWithCooldown(engine, "left");
    tapWithCooldown(engine, "left");

    expect(onCoffee).toHaveBeenCalledTimes(1);
    expect(onCoffee).toHaveBeenCalledWith("left", expect.any(Number));
  });

  it("invokes onCoffee before renderRungs on coffee pickup", () => {
    const callOrder: string[] = [];
    const renderRungs = vi.fn(() => callOrder.push("renderRungs"));
    const onCoffee = vi.fn(() => callOrder.push("onCoffee"));
    const callbacks: GameCallbacks = {
      onScoreUpdate: vi.fn(),
      onRankChange: vi.fn(),
      onGameOver: vi.fn(),
      onCoffee,
      onToast: vi.fn(),
    };
    const engine = new GameEngine(callbacks, renderRungs, vi.fn(), vi.fn());
    engine.start();
    tapWithCooldown(engine, "left");
    tapWithCooldown(engine, "left");
    callOrder.length = 0;
    tapWithCooldown(engine, "left");

    expect(onCoffee).toHaveBeenCalledTimes(1);
    expect(callOrder).toEqual(["onCoffee", "renderRungs"]);
  });

  it("adds COFFEE_RECOVERY to timeLeft on tutorial coffee tap", () => {
    const { engine } = createEngine();
    engine.start();
    tapWithCooldown(engine, "left");
    tapWithCooldown(engine, "left");
    const beforeCoffee = engine.getTimeLeft();
    engine.handleTap("left");
    expect(engine.getTimeLeft()).toBe(Math.min(100, beforeCoffee + COFFEE_RECOVERY));
  });

  it("does not call onScoreUpdate after energy depletion game over", () => {
    const onScoreUpdate = vi.fn();
    const onGameOver = vi.fn();
    const { engine } = createEngine({ onScoreUpdate, onGameOver }, getDailyModifierById("standard"));

    engine.start();
    tapWithCooldown(engine, "left");

    type EngineInternals = { timeLeft: number };
    const internal = engine as unknown as EngineInternals;
    internal.timeLeft = 0.1;

    onScoreUpdate.mockClear();
    vi.advanceTimersByTime(TICK_MS);

    expect(onGameOver).toHaveBeenCalledTimes(1);
    expect(onGameOver.mock.calls[0]![0].deathType).toBe("energy");
    expect(onScoreUpdate).not.toHaveBeenCalled();
  });

  it("clears coffee from the rung after pickup (no ghost badge on current slot)", () => {
    const onCoffee = vi.fn();
    const { engine } = createEngine({ onCoffee });
    engine.start();
    tapWithCooldown(engine, "left");
    tapWithCooldown(engine, "left");
    tapWithCooldown(engine, "left");

    const rungs = engine.getRungs();
    expect(onCoffee).toHaveBeenCalledTimes(1);
    expect(onCoffee).toHaveBeenCalledWith("left", expect.any(Number));
    expect(rungs.some((r) => r.coffee === "left")).toBe(false);
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
    tapWithCooldown(engine, "left");
    tapWithCooldown(engine, "left");
    tapWithCooldown(engine, "left");
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
    tapWithCooldown(engine2, "left");
    tapWithCooldown(engine2, "right");

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

    const { engine } = createEngine({}, getDailyModifierById("standard"));
    engine.start();

    for (let i = 0; i < 8; i++) {
      tapWithCooldown(engine, i % 2 === 0 ? "left" : "right");
    }

    const types = engine.getRungs().map((r) => r.type).filter(Boolean);
    expect(types.every((t) => t === "meeting" || t === null)).toBe(true);
  });

  it("does not swap the next rung during reorg tick", () => {
    const { engine } = createEngine();
    engine.start();
    tapWithCooldown(engine, "left");

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
  });

  it("pauses energy drain for 2s after promotion", () => {
    const { engine } = createEngine();
    engine.start();
    tapWithCooldown(engine, "left");
    tapWithCooldown(engine, "left");
    tapWithCooldown(engine, "left");

    type EngineInternals = { score: number };
    const internal = engine as unknown as EngineInternals;
    internal.score = 40;
    tapWithCooldown(engine, "left");

    const afterPromo = engine.getTimeLeft();
    vi.advanceTimersByTime(1500);
    expect(engine.getTimeLeft()).toBe(afterPromo);
    vi.advanceTimersByTime(1500);
    expect(engine.getTimeLeft()).toBeLessThan(afterPromo);
  });

  it("keeps reorg week preset across start()", () => {
    const { engine } = createEngine({}, getDailyModifierById("reorg_week"));
    expect(engine.getDailyModifier().allowEarlyReorg).toBe(true);
    engine.start();
    expect(engine.getDailyModifier().id).toBe("reorg_week");
    expect(engine.getDailyModifier().meetingPickThreshold).toBe(0.38);
  });

  it("reorg week intern before tutorial ramp spawns meetings only", () => {
    let randomCall = 0;
    vi.spyOn(Math, "random").mockImplementation(() => {
      const sequence = [
        0.1, 0.5, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9,
      ];
      return sequence[randomCall++] ?? 0.99;
    });

    const { engine } = createEngine({}, getDailyModifierById("reorg_week"));
    engine.start();

    for (let i = 0; i < 8; i++) {
      tapWithCooldown(engine, i % 2 === 0 ? "left" : "right");
    }

    const types = engine.getRungs().map((r) => r.type).filter(Boolean);
    expect(types.every((t) => t === "meeting" || t === null)).toBe(true);
  });

  it("forces tutorial coffee on rungs 1 or 2 by rung 8 when none collected", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.99);
    const { engine } = createEngine();
    engine.start();

    for (let i = 0; i < 8; i++) {
      tapWithCooldown(engine, i % 2 === 0 ? "left" : "right");
    }

    const rungs = engine.getRungs();
    const imminentCoffee = Boolean(rungs[1]?.coffee || rungs[2]?.coffee);
    expect(imminentCoffee).toBe(true);
  });

  it("re-injects tutorial coffee when missed until rung 12", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.99);
    const { engine } = createEngine();
    engine.start();

    for (let i = 0; i < 8; i++) {
      tapWithCooldown(engine, i % 2 === 0 ? "left" : "right");
    }

    const coffeeSide = engine.getRungs()[2]?.coffee ?? engine.getRungs()[1]?.coffee;
    expect(coffeeSide).toBeTruthy();
    const wrongSide = coffeeSide === "left" ? "right" : "left";
    tapWithCooldown(engine, wrongSide);

    for (let i = 0; i < 3; i++) {
      tapWithCooldown(engine, i % 2 === 0 ? "left" : "right");
    }

    const rungs = engine.getRungs();
    expect(rungs.some((r) => r.coffee !== null)).toBe(true);
  });

  it("uses manager obstacle pool on the rung generated at promotion", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.99);
    const { engine } = createEngine();
    engine.start();
    tapWithCooldown(engine, "left");
    tapWithCooldown(engine, "left");
    tapWithCooldown(engine, "left");

    while (engine.getRungsClimbed() < 39) {
      tapWithCooldown(engine, "left");
    }
    vi.spyOn(Math, "random").mockReturnValue(0.1);
    tapWithCooldown(engine, "left");

    type EngineInternals = {
      rungs: { type: string | null; obstacle: string | null }[];
    };
    const internal = engine as unknown as EngineInternals;
    const tail = internal.rungs[internal.rungs.length - 1];
    expect(engine.getCurrentRank()).toBe("Manager");
    const managerTypes = new Set(["meeting", "reorg", "badge_gate"]);
    expect(tail?.type === null || managerTypes.has(tail?.type ?? "")).toBe(true);
    if (tail?.obstacle) {
      expect(managerTypes.has(tail.type ?? "")).toBe(true);
    }
  });

  it("starts BGM ramp when promoted Intern to Manager", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.99);
    const { engine } = createEngine();
    engine.start();
    tapWithCooldown(engine, "left");
    tapWithCooldown(engine, "left");
    tapWithCooldown(engine, "left");

    while (engine.getRungsClimbed() < 39) {
      tapWithCooldown(engine, "left");
    }
    vi.mocked(audio.startManagerBgmRamp).mockClear();
    tapWithCooldown(engine, "left");

    expect(engine.getCurrentRank()).toBe("Manager");
    expect(audio.startManagerBgmRamp).toHaveBeenCalledTimes(1);
  });

  it("ignores taps faster than MIN_TAP_INTERVAL_MS", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.99);
    const onScoreUpdate = vi.fn();
    const { engine } = createEngine({ onScoreUpdate });
    engine.start();

    engine.handleTap("left");
    vi.advanceTimersByTime(50);
    engine.handleTap("left");
    vi.advanceTimersByTime(120);
    engine.handleTap("left");

    type EngineInternals = { score: number };
    const score = (engine as unknown as EngineInternals).score;
    expect(score).toBe(2);
  });

  it("fires onNearMiss when tapping safe side past imminent hazard", () => {
    const onNearMiss = vi.fn();
    const { engine } = createEngine({ onNearMiss });
    engine.start();
    tapWithCooldown(engine, "left");
    tapWithCooldown(engine, "left");

    expect(onNearMiss).toHaveBeenCalledTimes(1);
  });

  it("ends run at sprint duration with sprint death type", () => {
    const onGameOver = vi.fn();
    const sprintMod = getDailyModifierById("synergy_sprint");
    const { engine } = createEngine({ onGameOver }, sprintMod);
    engine.start();
    tapWithCooldown(engine, "left");
    vi.advanceTimersByTime(60_000 + TICK_MS);

    expect(onGameOver).toHaveBeenCalledTimes(1);
    expect(onGameOver.mock.calls[0]![0].deathType).toBe("sprint");
  });

  it("pauses energy drain while document is hidden", () => {
    if (typeof document === "undefined") return;
    const onScoreUpdate = vi.fn();
    const { engine } = createEngine({ onScoreUpdate });
    engine.start();
    tapWithCooldown(engine, "left");
    const energyBefore = engine.getTimeLeft();
    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    document.dispatchEvent(new Event("visibilitychange"));
    vi.advanceTimersByTime(TICK_MS * 50);
    Object.defineProperty(document, "hidden", { configurable: true, value: false });
    document.dispatchEvent(new Event("visibilitychange"));
    expect(engine.getTimeLeft()).toBe(energyBefore);
  });

  it("triggers triage prompt at Manager+ after interval rungs", () => {
    const onTriagePrompt = vi.fn();
    const { engine } = createEngine({ onTriagePrompt });
    engine.start();
    tapWithCooldown(engine, "left");
    tapWithCooldown(engine, "left");
    tapWithCooldown(engine, "left");
    for (let i = 0; i < 37; i++) {
      tapWithCooldown(engine, i % 2 === 0 ? "left" : "right");
    }
    expect(engine.getCurrentRank()).toBe("Manager");
    expect(onTriagePrompt).toHaveBeenCalled();
    expect(engine.isAwaitingTriageChoice()).toBe(true);
  });

  it("triage choice tap does not climb and sets bias", () => {
    const onToast = vi.fn();
    const onTriagePrompt = vi.fn();
    const { engine } = createEngine({ onToast, onTriagePrompt });
    engine.start();
    tapWithCooldown(engine, "left");
    tapWithCooldown(engine, "left");
    tapWithCooldown(engine, "left");
    for (let i = 0; i < 37; i++) {
      tapWithCooldown(engine, i % 2 === 0 ? "left" : "right");
    }
    expect(onTriagePrompt).toHaveBeenCalled();
    expect(engine.isAwaitingTriageChoice()).toBe(true);
    const scoreBefore = engine.getRungsClimbed();
    tapWithCooldown(engine, "right");
    expect(engine.getRungsClimbed()).toBe(scoreBefore);
    expect(engine.isAwaitingTriageChoice()).toBe(false);
    expect(onToast).toHaveBeenCalled();
  });

  it("generateRung always leaves a dodge path on imminent rung", () => {
    const { engine } = createEngine();
    engine.start();
    for (let i = 0; i < 30; i++) {
      tapWithCooldown(engine, i % 2 === 0 ? "left" : "right");
      const imminent = engine.getRungs()[1];
      if (imminent?.obstacle) {
        expect(["left", "right"]).toContain(imminent.obstacle);
      }
    }
  });

  it("promotes to Manager at 10.0 years (40 rungs)", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.99);
    const { engine } = createEngine();
    engine.start();
    tapWithCooldown(engine, "left");
    tapWithCooldown(engine, "left");
    tapWithCooldown(engine, "left");
    while (engine.getRungsClimbed() < 39) {
      tapWithCooldown(engine, "left");
    }
    tapWithCooldown(engine, "left");
    expect(engine.getCurrentRank()).toBe("Manager");
    expect(engine.getRungsClimbed()).toBe(40);
  });

  it("extends rookie ramp and caps intern spawn rate for new players", () => {
    const { engine } = createEngine({}, getDailyModifierById("standard"));
    engine.start();
    type Internals = { score: number; obstacleSpawnRate: () => number };
    const internal = engine as unknown as Internals;

    // Rookie (career best 0): gentle rate persists past 12 rungs, capped after 20
    internal.score = 15;
    expect(internal.obstacleSpawnRate()).toBe(INTERN_OBSTACLE_SPAWN_RATE);
    internal.score = 25;
    expect(internal.obstacleSpawnRate()).toBe(ROOKIE_INTERN_SPAWN_RATE_CAP);

    // Veteran (career best >= Manager): original ramp boundaries
    engine.setCareerBestYears(15);
    internal.score = 15;
    expect(internal.obstacleSpawnRate()).toBe(OBSTACLE_SPAWN_RATE);
    internal.score = 8;
    expect(internal.obstacleSpawnRate()).toBe(INTERN_OBSTACLE_SPAWN_RATE);
  });

  it("promotes to Director at 20.0 years (80 rungs)", () => {
    const onRankChange = vi.fn();
    const { engine } = createEngine({ onRankChange });
    engine.start();
    tapWithCooldown(engine, "left");
    tapWithCooldown(engine, "left");
    tapWithCooldown(engine, "left");

    type EngineInternals = { score: number };
    const internal = engine as unknown as EngineInternals;
    internal.score = 79;
    tapWithCooldown(engine, "left");

    expect(engine.getCurrentRank()).toBe("Director");
    expect(onRankChange).toHaveBeenCalledWith("Director", expect.stringContaining("Director"));
  });

  it("promotes to CEO at 35.0 years (140 rungs)", () => {
    const onRankChange = vi.fn();
    const { engine } = createEngine({ onRankChange });
    engine.start();
    tapWithCooldown(engine, "left");
    tapWithCooldown(engine, "left");
    tapWithCooldown(engine, "left");

    type EngineInternals = { score: number };
    const internal = engine as unknown as EngineInternals;
    internal.score = 139;
    tapWithCooldown(engine, "left");

    expect(engine.getCurrentRank()).toBe("CEO");
    expect(onRankChange).toHaveBeenCalledWith("CEO", expect.stringContaining("CEO"));
  });

  it("promotes to Board Member at 50.0 years (200 rungs)", () => {
    const onRankChange = vi.fn();
    const { engine } = createEngine({ onRankChange });
    engine.start();
    tapWithCooldown(engine, "left");
    tapWithCooldown(engine, "left");
    tapWithCooldown(engine, "left");

    type EngineInternals = { score: number };
    const internal = engine as unknown as EngineInternals;
    internal.score = 199;
    tapWithCooldown(engine, "left");

    expect(engine.getCurrentRank()).toBe("Board Member");
    expect(onRankChange).toHaveBeenCalledWith("Board Member", expect.stringContaining("Board"));
  });

  it("promotes to Angel Investor at 75.0 years (300 rungs)", () => {
    const onRankChange = vi.fn();
    const { engine } = createEngine({ onRankChange });
    engine.start();
    tapWithCooldown(engine, "left");
    tapWithCooldown(engine, "left");
    tapWithCooldown(engine, "left");

    type EngineInternals = { score: number };
    const internal = engine as unknown as EngineInternals;
    internal.score = 299;
    tapWithCooldown(engine, "left");

    expect(engine.getCurrentRank()).toBe("Angel Investor");
    expect(onRankChange).toHaveBeenCalledWith("Angel Investor", expect.stringContaining("Angel"));
  });

  it("captures revive snapshot on collision death", () => {
    const onGameOver = vi.fn();
    const { engine } = createEngine({ onGameOver });
    engine.start();
    tapWithCooldown(engine, "left");
    tapWithCooldown(engine, "right");

    const snapshot = engine.getPendingReviveSnapshot();
    expect(snapshot).not.toBeNull();
    expect(snapshot?.deathType).toBe("meeting");
    expect(snapshot?.score).toBe(engine.getRungsClimbed());
  });

  it("restores collision death with safe imminent rung and bonus energy", () => {
    const onGameOver = vi.fn();
    const { engine } = createEngine({ onGameOver });
    engine.start();
    tapWithCooldown(engine, "left");
    tapWithCooldown(engine, "right");

    const snapshot = engine.getPendingReviveSnapshot();
    expect(snapshot).not.toBeNull();
    const energyBefore = snapshot!.timeLeft;

    engine.restoreFromRevive(snapshot!);

    expect(engine.hasUsedRevive()).toBe(true);
    expect(engine.isActive()).toBe(true);
    expect(engine.getRungs()[1]?.obstacle).toBeNull();
    expect(engine.getTimeLeft()).toBe(Math.min(100, energyBefore + 25));
    expect(onGameOver).toHaveBeenCalledTimes(1);
  });

  it("restores energy death with refill", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.99);
    const onGameOver = vi.fn();
    const { engine } = createEngine({ onGameOver }, getDailyModifierById("standard"));
    engine.start();
    tapWithCooldown(engine, "left");
    vi.advanceTimersByTime(TICK_MS * 5000);

    const snapshot = engine.getPendingReviveSnapshot();
    expect(snapshot?.deathType).toBe("energy");
    engine.restoreFromRevive(snapshot!);
    expect(engine.getTimeLeft()).toBe(50);
    expect(engine.isActive()).toBe(true);
  });

  it("allows only one revive per run", () => {
    const { engine } = createEngine();
    engine.start();
    tapWithCooldown(engine, "left");
    tapWithCooldown(engine, "right");

    const snapshot = engine.getPendingReviveSnapshot();
    engine.restoreFromRevive(snapshot!);
    expect(engine.hasUsedRevive()).toBe(true);
    const energyAfterFirst = engine.getTimeLeft();

    engine.restoreFromRevive(snapshot!);
    expect(engine.getTimeLeft()).toBe(energyAfterFirst);
  });
});
