export type PlayerSide = "left" | "right";
export type ObstacleType = "meeting" | "reorg" | "burnout" | "badge_gate" | "foliage";
export type Rank = "Intern" | "Manager" | "Director" | "CEO" | "Board Member" | "Angel Investor";
export type DeathType = ObstacleType | "energy" | "sprint";

export interface Rung {
  id: number;
  obstacle: PlayerSide | null;
  type: ObstacleType | null;
  coffee: PlayerSide | null;
}

export interface GameOverResult {
  yearsSurvived: number;
  finalRank: Rank;
  rungsClimbed: number;
  terminationCause: string;
  terminationDetail: string;
  terminationFlavor: string;
  deathType: DeathType;
  /** Unix ms when the run clock started (engine.start). */
  runStartedAt: number;
  /** Unix ms when the run ended (game over). */
  runEndedAt: number;
}

export interface ReviveSnapshot {
  deathType: DeathType;
  rungs: Rung[];
  score: number;
  timeLeft: number;
  playerSide: PlayerSide;
  currentRank: Rank;
  nextRungId: number;
  firstTapDone: boolean;
  coffeeCollected: boolean;
  drainPausedUntil: number;
  dailyModifierId: string;
  runStartedAt: number;
  awaitingTriageChoice: boolean;
  triageBiasSide: PlayerSide | null;
  triageBiasRemaining: number;
  lastTriageAtScore: number;
  rankBandPromoShown: number[];
}

export interface GameCallbacks {
  onScoreUpdate: (years: number, energy: number) => void;
  onRankChange: (rank: Rank, message: string) => void;
  onGameOver: (result: GameOverResult) => void;
  onCoffee: (side: PlayerSide, rungId: number) => void;
  onToast: (msg: string) => void;
  onNearMiss?: () => void;
  onTriagePrompt?: () => void;
}
