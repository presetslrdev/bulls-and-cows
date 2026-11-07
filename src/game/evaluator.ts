import { GuessEvaluation } from "./types";

/**
 * Evaluates a guess against a secret code.
 *
 * Counts:
 * - bulls: correct digit in the correct position
 * - cows: correct digit in an incorrect position
 *
 * Case-insensitive for hex digits.
 * Implemented via higher-order array methods (filter) without manual counter loops.
 */
export const evaluateGuess = (secret: string, guess: string): GuessEvaluation => {
  const normalizedSecret = secret.toLowerCase();
  const normalizedGuess = guess.toLowerCase();
  const guessChars = normalizedGuess.split("");

  const bulls = guessChars.filter((char, index) => char === normalizedSecret[index]).length;

  const cows = guessChars.filter(
    (char, index) => char !== normalizedSecret[index] && normalizedSecret.includes(char),
  ).length;

  return { bulls, cows };
};
