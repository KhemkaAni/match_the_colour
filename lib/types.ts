export type GameMode = "regular" | "hard";

export type GamePhase =
  | "landing"
  | "memorize"
  | "guess"
  | "result"
  | "final";

export interface Player {
  name: string;
  mode: GameMode;
}

export interface Round {
  roundNumber: number;
  targetColor: string;
  guessedColor: string;
  accuracy: number;
  score: number;
  deltaE: number;
}

export interface GameResult {
  playerName: string;
  mode: GameMode;
  rounds: Round[];
  totalScore: number;
  averageAccuracy: number;
  bestRound: number;
  worstRound: number;
}

export interface ChallengeData {
  name: string;
  score: number;
  mode: GameMode;
}

export const TOTAL_ROUNDS = 5;
export const MAX_SCORE = 500;

export const MODE_DISPLAY_TIME: Record<GameMode, number> = {
  regular: 6,
  hard: 3,
};
