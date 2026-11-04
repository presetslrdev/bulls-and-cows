import { RadixBase } from "./types";

/**
 * Generates a secret number as a string containing `length` unique digits
 * in the specified `base`.
 *
 * Accepts an injectable `random` function to remain a pure, testable function.
 */
export const generateSecret = (
  _length: number,
  _base: RadixBase,
  _random: () => number = Math.random,
): string => {
  // Stub implementation for TDD red phase
  return "";
};
