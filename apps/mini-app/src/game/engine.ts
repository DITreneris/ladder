import { audio } from "./audio";
import { debugTapContext, debugTapResult } from "../lib/debug";

import {
  BASE_DRAIN_RATE,
  CLIMB_RECOVERY,
  COFFEE_RECOVERY,
  DRAIN_SCALE_PER_YEAR,
  FAILURE_BY_RANK,
  FAILURE_BY_SHIFT,
  FAILURE_REASONS,
  INTERN_FAKE_PROMO,
  INTERN_TUTORIAL_RUNGS,
  MAX_VISIBLE_RUNGS,
  MIN_TAP_INTERVAL_MS,
  PROMOTION_DIALOGUES,
  PROMO_DRAIN_PAUSE_MS,
  SPRINT_GAME_OVER,
  TICK_MS,
  OBSTACLE_DEATH_COPY,
  TUTORIAL_COFFEE_MIN_RUNG,
  TUTORIAL_RUNG_SPECS,
  pickObstacleType,
  rankFromYears,
  reorgIntervalForRank,
  type TickerHeadline,
} from "./constants";

import type { DailyModifier } from "./daily-modifier";
import { resolveDailyModifier } from "./daily-modifier";

import type { DeathType, GameCallbacks, GameOverResult, ObstacleType, PlayerSide, Rank, Rung } from "./types";

export class GameEngine {
  private score = 0;
  private timeLeft = 100;
  private isPlaying = false;
  private isGameOverState = false;
  private playerSide: PlayerSide = "left";
  private currentRank: Rank = "Intern";
  private rungs: Rung[] = [];
  private nextRungId = 0;
  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private reorgInterval: ReturnType<typeof setInterval> | null = null;
  private callbacks: GameCallbacks;
  private renderRungs: () => void;
  private updatePlayerPosition: (side: PlayerSide) => void;
  private onFirstTap: () => void;
  private firstTapDone = false;
  private coffeeCollected = false;
  private drainPausedUntil = 0;
  private dailyModifier: DailyModifier;
  private readonly fixedDailyModifier?: DailyModifier;
  private activeTicker: TickerHeadline | null = null;
  private internFakePromoShown = new Set<number>();
  private lastTapAt = 0;
  private runStartedAt = 0;

  constructor(
    callbacks: GameCallbacks,
    renderRungs: () => void,
    updatePlayerPosition: (side: PlayerSide) => void,
    onFirstTap: () => void,
    dailyModifier?: DailyModifier
  ) {
    this.callbacks = callbacks;
    this.renderRungs = renderRungs;
    this.updatePlayerPosition = updatePlayerPosition;
    this.onFirstTap = onFirstTap;
    this.fixedDailyModifier = dailyModifier;
    this.dailyModifier = dailyModifier ?? resolveDailyModifier();
  }

  setActiveTicker(headline: TickerHeadline | null): void {
    this.activeTicker = headline;
  }

  getDailyModifier(): DailyModifier {
    return this.dailyModifier;
  }

  getRungs(): Rung[] {
    return this.rungs;
  }

  getCurrentRank(): Rank {
    return this.currentRank;
  }

  getPlayerSide(): PlayerSide {
    return this.playerSide;
  }

  isActive(): boolean {
    return this.isPlaying;
  }

  getRungsClimbed(): number {
    return this.score;
  }

  getTimeLeft(): number {
    return this.timeLeft;
  }

  getSprintSecondsRemaining(): number | null {
    const cap = this.dailyModifier.sprintDurationMs;
    if (!cap || !this.isPlaying) return null;
    const remaining = cap - (Date.now() - this.runStartedAt);
    return Math.max(0, Math.ceil(remaining / 1000));
  }

  isSprintMode(): boolean {
    return Boolean(this.dailyModifier.sprintDurationMs);
  }

  private obstacleSpawnRate(): number {
    if (this.currentRank === "Intern" && this.score < INTERN_TUTORIAL_RUNGS) {
      return this.dailyModifier.internObstacleSpawnRate;
    }
    return this.dailyModifier.obstacleSpawnRate;
  }

  private shouldForceTutorialCoffee(): boolean {
    return (
      !this.coffeeCollected &&
      this.score >= TUTORIAL_COFFEE_MIN_RUNG &&
      this.score <= INTERN_TUTORIAL_RUNGS
    );
  }

  private hasImminentTutorialCoffee(): boolean {
    return Boolean(this.rungs[1]?.coffee || this.rungs[2]?.coffee);
  }

  private injectTutorialCoffee(): void {
    if (!this.shouldForceTutorialCoffee() || this.hasImminentTutorialCoffee()) return;

    const side: PlayerSide = Math.random() < 0.5 ? "left" : "right";
    const coffeeRung: Rung = { id: this.nextRungId++, obstacle: null, type: null, coffee: side };
    const targetIndex = this.score >= INTERN_TUTORIAL_RUNGS ? 1 : 2;
    const existing = this.rungs[targetIndex];

    if (existing && !existing.obstacle && !existing.coffee) {
      this.rungs[targetIndex] = coffeeRung;
      return;
    }

    this.rungs.splice(targetIndex, 0, coffeeRung);
    if (this.rungs.length > MAX_VISIBLE_RUNGS) {
      this.rungs.pop();
    }
  }

  private generateRung(forceEmpty = false): Rung {
    let obstacle: PlayerSide | null = null;
    let type: ObstacleType | null = null;
    let coffee: PlayerSide | null = null;

    if (!forceEmpty) {
      const rand = Math.random();
      if (rand < this.obstacleSpawnRate()) {
        obstacle = Math.random() < 0.5 ? "left" : "right";
        type = pickObstacleType(this.currentRank, {
          allowEarlyReorg: this.dailyModifier.allowEarlyReorg,
          meetingPickThreshold: this.dailyModifier.meetingPickThreshold,
        });
      } else if (rand > this.dailyModifier.coffeeSpawnThreshold) {
        coffee = Math.random() < 0.5 ? "left" : "right";
      }
    }

    return { id: this.nextRungId++, obstacle, type, coffee };
  }

  private startReorgLoop(): void {
    if (this.reorgInterval) clearInterval(this.reorgInterval);
    const intervalMs = reorgIntervalForRank(this.currentRank);
    this.reorgInterval = setInterval(() => {
      if (!this.isPlaying) return;
      let altered = false;
      this.rungs.forEach((r, index) => {
        if (index === 1) return;
        if (r.type === "reorg" && r.obstacle) {
          r.obstacle = r.obstacle === "left" ? "right" : "left";
          altered = true;
        }
      });
      if (altered) {
        this.renderRungs();
        audio.reorg();
      }
    }, intervalMs);
  }

  start(): void {
    audio.init();
    this.score = 0;
    this.timeLeft = 100;
    this.isPlaying = true;
    this.isGameOverState = false;
    this.playerSide = "left";
    this.nextRungId = 0;
    this.currentRank = "Intern";
    this.firstTapDone = false;
    this.coffeeCollected = false;
    this.drainPausedUntil = 0;
    this.internFakePromoShown.clear();
    this.lastTapAt = 0;
    this.runStartedAt = Date.now();
    this.dailyModifier = this.fixedDailyModifier ?? resolveDailyModifier();

    this.rungs = [];
    this.rungs.push(this.generateRung(true));
    for (const spec of TUTORIAL_RUNG_SPECS) {
      this.rungs.push({ ...spec, id: this.nextRungId++ });
    }
    while (this.rungs.length < MAX_VISIBLE_RUNGS) {
      this.rungs.push(this.generateRung());
    }
    this.renderRungs();
    this.callbacks.onScoreUpdate(0, 100);
    this.stopLoops();

    this.timerInterval = setInterval(() => {
      if (!this.isPlaying) return;
      if (!this.firstTapDone) return;
      const sprintCap = this.dailyModifier.sprintDurationMs;
      if (sprintCap && Date.now() - this.runStartedAt >= sprintCap) {
        this.triggerGameOver(
          SPRINT_GAME_OVER.cause,
          SPRINT_GAME_OVER.detail,
          SPRINT_GAME_OVER.deathType
        );
        return;
      }
      const years = Math.floor(this.score / 4);
      if (Date.now() < this.drainPausedUntil) {
        this.callbacks.onScoreUpdate(this.score / 4, this.timeLeft);
        return;
      }
      const drainRate = BASE_DRAIN_RATE + years * DRAIN_SCALE_PER_YEAR;
      this.timeLeft -= drainRate;
      if (this.timeLeft <= 0) {
        this.timeLeft = 0;
        if (sprintCap) {
          this.callbacks.onScoreUpdate(this.score / 4, this.timeLeft);
          return;
        }
        this.triggerGameOver(
          "Energy Depleted",
          "Cognitive overload. Energy reserves fully exhausted before reaching promotion.",
          "energy"
        );
        return;
      }
      this.callbacks.onScoreUpdate(this.score / 4, this.timeLeft);
      if (this.timeLeft < 25 && Math.random() < 0.2) audio.stress();
    }, TICK_MS);

    this.startReorgLoop();
  }

  stop(): void {
    this.isPlaying = false;
    this.stopLoops();
  }

  /** Frozen mid-game state for OG screenshot capture (`?og=1`). */
  applyOgCaptureSnapshot(rungs: Rung[], score: number, timeLeft: number, playerSide: PlayerSide, rank: Rank): void {
    this.stopLoops();
    this.isPlaying = true;
    this.isGameOverState = false;
    this.firstTapDone = true;
    this.score = score;
    this.timeLeft = timeLeft;
    this.playerSide = playerSide;
    this.currentRank = rank;
    this.nextRungId = rungs.length;
    this.coffeeCollected = true;
    this.drainPausedUntil = 0;
    this.internFakePromoShown.clear();
    this.dailyModifier = this.fixedDailyModifier ?? resolveDailyModifier();
    this.rungs = rungs.map((r) => ({ ...r }));

    this.updatePlayerPosition(playerSide);
    this.renderRungs();
    this.callbacks.onScoreUpdate(score / 4, timeLeft);
  }

  private stopLoops(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.reorgInterval) clearInterval(this.reorgInterval);
    this.timerInterval = null;
    this.reorgInterval = null;
  }

  private checkInternFakePromos(years: number): void {
    if (this.currentRank !== "Intern") return;
    const yearsTenths = Math.floor(years * 10) / 10;
    for (const promo of INTERN_FAKE_PROMO) {
      if (yearsTenths >= promo.years && !this.internFakePromoShown.has(promo.years)) {
        this.internFakePromoShown.add(promo.years);
        this.callbacks.onToast(promo.message);
      }
    }
  }

  handleTap(side: PlayerSide): void {
    if (!this.isPlaying || this.isGameOverState) {
      debugTapResult(side, this.rungs[1], "inactive");
      return;
    }

    const now = Date.now();
    if (now - this.lastTapAt < MIN_TAP_INTERVAL_MS) {
      debugTapResult(side, this.rungs[1], "throttle");
      return;
    }
    this.lastTapAt = now;

    if (!this.firstTapDone) {
      this.firstTapDone = true;
      this.onFirstTap();
    }

    this.playerSide = side;
    this.updatePlayerPosition(side);

    const nextRung = this.rungs[1];

    if (nextRung?.obstacle === side) {
      const obstacleType = nextRung.type ?? "reorg";
      const copy = OBSTACLE_DEATH_COPY[obstacleType] ?? OBSTACLE_DEATH_COPY.reorg;
      this.triggerGameOver(copy.cause, copy.detail, copy.deathType);
      debugTapResult(side, nextRung, "death");
      return;
    }

    if (nextRung?.obstacle && nextRung.obstacle !== side) {
      this.callbacks.onNearMiss?.();
    }

    this.score++;
    audio.tap(this.score);

    let coffeePickup: { side: PlayerSide; rungId: number } | null = null;
    if (nextRung?.coffee === this.playerSide) {
      this.timeLeft = Math.min(100, this.timeLeft + COFFEE_RECOVERY);
      this.coffeeCollected = true;
      coffeePickup = { side: this.playerSide, rungId: nextRung.id };
      nextRung.coffee = null;
      audio.coffee();
    } else {
      this.timeLeft = Math.min(100, this.timeLeft + CLIMB_RECOVERY);
    }

    this.rungs.shift();
    this.checkPromotions();
    if (this.shouldForceTutorialCoffee()) {
      this.injectTutorialCoffee();
    }
    this.rungs.push(this.generateRung());

    const years = this.score / 4;
    this.callbacks.onScoreUpdate(years, this.timeLeft);
    this.checkInternFakePromos(years);
    if (coffeePickup) {
      this.callbacks.onCoffee(coffeePickup.side, coffeePickup.rungId);
      debugTapResult(side, nextRung, "coffee");
    } else {
      debugTapResult(side, nextRung, "climb");
    }
    this.renderRungs();
    debugTapContext(this.rungs[1]);
  }

  private checkPromotions(): void {
    const years = Math.floor(this.score / 4);
    const prevRank = this.currentRank;
    this.currentRank = rankFromYears(years);
    if (this.currentRank !== prevRank) {
      audio.promo();
      this.drainPausedUntil = Date.now() + PROMO_DRAIN_PAUSE_MS;
      const msg = PROMOTION_DIALOGUES[this.currentRank] ?? "You have survived organizational hurdles!";
      this.callbacks.onRankChange(this.currentRank, msg);
      this.startReorgLoop();
    }
  }

  private pickFlavorQuote(deathType: DeathType): string {
    if (
      this.activeTicker?.deathType === deathType &&
      Math.random() < 0.2
    ) {
      return `Headline vindicated: ${this.activeTicker.text}`;
    }

    if (this.dailyModifier.id !== "standard") {
      const shiftFlavors = FAILURE_BY_SHIFT[this.dailyModifier.id];
      if (shiftFlavors?.length && Math.random() < 0.3) {
        return shiftFlavors[Math.floor(Math.random() * shiftFlavors.length)]!;
      }
    }

    const rankFlavors = FAILURE_BY_RANK[this.currentRank];
    if (rankFlavors && rankFlavors.length > 0 && Math.random() < 0.3) {
      return rankFlavors[Math.floor(Math.random() * rankFlavors.length)]!;
    }
    return FAILURE_REASONS[Math.floor(Math.random() * FAILURE_REASONS.length)]!;
  }

  private triggerGameOver(cause: string, detail: string, deathType: DeathType): void {
    this.isPlaying = false;
    this.isGameOverState = true;
    this.stopLoops();
    audio.gameOver();

    const yearsSurvived = parseFloat((this.score / 4).toFixed(1));
    const funnyQuote = this.pickFlavorQuote(deathType);

    const result: GameOverResult = {
      yearsSurvived,
      finalRank: this.currentRank,
      rungsClimbed: this.score,
      terminationCause: cause,
      terminationDetail: detail,
      terminationFlavor: funnyQuote,
      deathType,
    };
    this.callbacks.onGameOver(result);
  }
}
