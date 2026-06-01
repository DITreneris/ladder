import { audio } from "./audio";

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
  PROMOTION_DIALOGUES,
  PROMO_DRAIN_PAUSE_MS,
  TICK_MS,
  TUTORIAL_COFFEE_MIN_RUNG,
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
  private tutorialCoffeeDone = false;
  private drainPausedUntil = 0;
  private dailyModifier: DailyModifier;
  private readonly fixedDailyModifier?: DailyModifier;
  private activeTicker: TickerHeadline | null = null;
  private internFakePromoShown = new Set<number>();

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

  getTimeLeft(): number {
    return this.timeLeft;
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
      !this.tutorialCoffeeDone &&
      this.score >= TUTORIAL_COFFEE_MIN_RUNG &&
      this.score <= INTERN_TUTORIAL_RUNGS
    );
  }

  private generateRung(forceEmpty = false): Rung {
    let obstacle: PlayerSide | null = null;
    let type: ObstacleType | null = null;
    let coffee: PlayerSide | null = null;

    if (!forceEmpty) {
      if (this.shouldForceTutorialCoffee()) {
        coffee = Math.random() < 0.5 ? "left" : "right";
        this.tutorialCoffeeDone = true;
      } else {
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
    this.tutorialCoffeeDone = false;
    this.drainPausedUntil = 0;
    this.internFakePromoShown.clear();
    this.dailyModifier = this.fixedDailyModifier ?? resolveDailyModifier();

    this.rungs = [];
    this.rungs.push(this.generateRung(true), this.generateRung(true), this.generateRung(true));
    for (let i = 3; i < MAX_VISIBLE_RUNGS; i++) {
      this.rungs.push(this.generateRung());
    }

    this.updatePlayerPosition(this.playerSide);
    this.renderRungs();
    this.callbacks.onScoreUpdate(0, 100);
    this.stopLoops();

    this.timerInterval = setInterval(() => {
      if (!this.isPlaying) return;
      if (!this.firstTapDone) return;
      const years = Math.floor(this.score / 4);
      if (Date.now() < this.drainPausedUntil) {
        this.callbacks.onScoreUpdate(this.score / 4, this.timeLeft);
        return;
      }
      const drainRate = BASE_DRAIN_RATE + years * DRAIN_SCALE_PER_YEAR;
      this.timeLeft -= drainRate;
      if (this.timeLeft <= 0) {
        this.timeLeft = 0;
        this.triggerGameOver(
          "Energy Depleted",
          "Cognitive overload. Energy reserves fully exhausted before reaching promotion.",
          "energy"
        );
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
    this.coffeeCollected = false;
    this.tutorialCoffeeDone = true;
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
    for (const promo of INTERN_FAKE_PROMO) {
      if (years >= promo.years && !this.internFakePromoShown.has(promo.years)) {
        this.internFakePromoShown.add(promo.years);
        this.callbacks.onToast(promo.message);
      }
    }
  }

  handleTap(side: PlayerSide): void {
    if (!this.isPlaying || this.isGameOverState) return;

    if (!this.firstTapDone) {
      this.firstTapDone = true;
      this.onFirstTap();
    }

    this.playerSide = side;
    this.updatePlayerPosition(side);

    const nextRung = this.rungs[1];
    if (nextRung?.obstacle === this.playerSide) {
      let cause = "Reorganization";
      let detail = "A massive department restructuring shuffled you out of direct reports.";
      let deathType: DeathType = "reorg";
      if (nextRung.type === "meeting") {
        cause = "Meeting Overload";
        detail = "Fell into an all-hands call on slide layout. Reached maximum agenda tolerance.";
        deathType = "meeting";
      } else if (nextRung.type === "burnout") {
        cause = "Deadline Crash";
        detail = "Waded headfirst into a quarterly deadline with zero active coffee left.";
        deathType = "burnout";
      }
      this.triggerGameOver(cause, detail, deathType);
      return;
    }

    this.score++;
    audio.tap(this.score);

    if (nextRung?.coffee === this.playerSide) {
      this.timeLeft = Math.min(100, this.timeLeft + COFFEE_RECOVERY);
      this.coffeeCollected = true;
      nextRung.coffee = null;
      audio.coffee();
      this.callbacks.onCoffee();
      // #region agent log
      if (typeof fetch !== "undefined") {
        fetch("http://127.0.0.1:7808/ingest/23292cd7-62fc-4135-a998-c5f22f7ea8ca", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "a50bb8" },
          body: JSON.stringify({
            sessionId: "a50bb8",
            hypothesisId: "H-coffee",
            location: "engine.ts:handleTap",
            message: "coffee collected",
            data: { side, rung0Coffee: this.rungs[0]?.coffee ?? null, rung1Coffee: this.rungs[1]?.coffee ?? null },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
      }
      // #endregion
    } else {
      this.timeLeft = Math.min(100, this.timeLeft + CLIMB_RECOVERY);
    }

    this.rungs.shift();
    this.rungs.push(this.generateRung());

    const years = this.score / 4;
    this.callbacks.onScoreUpdate(years, this.timeLeft);
    this.checkInternFakePromos(years);
    this.checkPromotions();
    this.renderRungs();
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
