export type RadixBase = 2 | 8 | 10 | 16;

export type BaseName = "bin" | "oct" | "dec" | "hex";

export interface GuessEvaluation {
  bulls: number;
  cows: number;
}

export interface GuessHistoryEntry {
  guess: string;
  bulls: number;
  cows: number;
  timestamp: number;
}

export type GameStatus = "settings" | "playing" | "won";

export interface GameSettings {
  length: number;
  base: RadixBase;
}

export interface GameState {
  settings: GameSettings;
  secret: string;
  history: readonly GuessHistoryEntry[];
  status: GameStatus;
  startTime: number | null;
  endTime: number | null;
}

export interface ScoreRecord {
  id: string;
  playerName: string;
  base: RadixBase;
  length: number;
  attempts: number;
  elapsedSeconds: number;
  date: string;
}
