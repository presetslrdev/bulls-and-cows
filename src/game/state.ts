import { GameSettings, GameState, GuessEvaluation, GuessHistoryEntry, RadixBase } from "./types";
import { generateSecret } from "./generator";
import { evaluateGuess } from "./evaluator";
import { isValidGuess } from "./validator";

export const DEFAULT_SETTINGS: GameSettings = {
  length: 4,
  base: 10,
};

/**
 * Creates the initial game state in "settings" mode.
 */
export const createInitialState = (settings: GameSettings = DEFAULT_SETTINGS): GameState => ({
  settings,
  secret: "",
  history: [],
  status: "settings",
  startTime: null,
  endTime: null,
});

/**
 * Pure function: starts a game with the specified settings and secret generator.
 */
export const startNewGame = (
  settings: GameSettings,
  random: () => number = Math.random,
  now: () => number = Date.now,
): GameState => {
  // Constrain binary length to max 2
  const length = settings.base === 2 ? Math.min(settings.length, 2) : settings.length;
  const effectiveSettings: GameSettings = {
    ...settings,
    length,
  };

  const secret = generateSecret(effectiveSettings.length, effectiveSettings.base, random);

  return {
    settings: effectiveSettings,
    secret,
    history: [],
    status: "playing",
    startTime: now(),
    endTime: null,
  };
};

export type GuessOutcome =
  | { type: "INVALID_GUESS"; reason: string; state: GameState }
  | { type: "DUPLICATE_GUESS"; state: GameState }
  | { type: "SUCCESS"; evaluation: GuessEvaluation; state: GameState };

/**
 * Pure function: immutably submits a guess to the game state.
 * Returns the outcome and the new state without mutating the previous state.
 */
export const processGuess = (
  state: GameState,
  rawGuess: string,
  now: () => number = Date.now,
): GuessOutcome => {
  if (state.status !== "playing") {
    return {
      type: "INVALID_GUESS",
      reason: "Game is not in playing state",
      state,
    };
  }

  const normalizedGuess = rawGuess.trim().toLowerCase();

  // Validate guess format and uniqueness of digits
  if (!isValidGuess(normalizedGuess, state.settings.length, state.settings.base)) {
    return {
      type: "INVALID_GUESS",
      reason: `Guess must be ${state.settings.length} unique digits for base ${state.settings.base}`,
      state,
    };
  }

  // Prevent duplicate attempts in history without failing
  const isDuplicate = state.history.some((entry) => entry.guess.toLowerCase() === normalizedGuess);
  if (isDuplicate) {
    return {
      type: "DUPLICATE_GUESS",
      state,
    };
  }

  const evaluation = evaluateGuess(state.secret, normalizedGuess);
  const isWin = evaluation.bulls === state.settings.length;
  const currentTime = now();

  const newEntry: GuessHistoryEntry = {
    guess: normalizedGuess,
    bulls: evaluation.bulls,
    cows: evaluation.cows,
    timestamp: currentTime,
  };

  const nextState: GameState = {
    ...state,
    history: [...state.history, newEntry],
    status: isWin ? "won" : "playing",
    endTime: isWin ? currentTime : null,
  };

  return {
    type: "SUCCESS",
    evaluation,
    state: nextState,
  };
};

/**
 * Resets the game back to settings mode without page reload.
 */
export const resetGame = (settings?: GameSettings): GameState => {
  return createInitialState(settings ?? DEFAULT_SETTINGS);
};

/**
 * Helper to get human-readable base label.
 */
export const getBaseName = (base: RadixBase): string => {
  switch (base) {
    case 2:
      return "BIN (2)";
    case 8:
      return "OCT (8)";
    case 10:
      return "DEC (10)";
    case 16:
      return "HEX (16)";
  }
};
