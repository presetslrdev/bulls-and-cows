import { GuessEvaluation } from "./types";

/**
 * Evaluates a guess against a secret code.
 *
 * Counts:
 * - bulls: correct digit in the correct position
 * - cows: correct digit in an incorrect position
 *
 * Case-insensitive for hex digits.
 * Implemented via higher-order array methods (filter/reduce).
 */
export const evaluateGuess = (_secret: string, _guess: string): GuessEvaluation => {
  // Stub implementation for TDD red phase
  return { bulls: -1, cows: -1 };
};
