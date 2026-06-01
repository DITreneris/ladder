export type PlayerSide = "left" | "right";
export type ObstacleType = "meeting" | "reorg" | "burnout";
export type Rank = "Intern" | "Manager" | "CEO";
export type DeathType = ObstacleType | "energy";

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
}

export interface GameCallbacks {
  onScoreUpdate: (years: number, energy: number) => void;
  onRankChange: (rank: Rank, message: string) => void;
  onGameOver: (result: GameOverResult) => void;
  onCoffee: (side: PlayerSide, rungId: number) => void;
  onToast: (msg: string) => void;
}
