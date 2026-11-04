import { RadixBase } from "./types";

const ALPHABET = "0123456789abcdef";

/**
 * Generates a secret number as a string containing `length` unique digits
 * in the specified `base`.
 *
 * Accepts an injectable `random` function to remain a pure, testable function.
 */
export const generateSecret = (
  length: number,
  base: RadixBase,
  random: () => number = Math.random,
): string => {
  if (length < 1 || length > base) {
    throw new Error(`Length must be between 1 and ${base}, got length=${length} for base=${base}`);
  }

  const pool = ALPHABET.slice(0, base).split("");

  const pickDigits = (available: readonly string[], remaining: number, acc: string): string => {
    if (remaining === 0) {
      return acc;
    }
    const index = Math.floor(random() * available.length);
    const chosen = available[index];
    const nextAvailable = available.filter((_, i) => i !== index);
    return pickDigits(nextAvailable, remaining - 1, acc + chosen);
  };

  return pickDigits(pool, length, "");
};
