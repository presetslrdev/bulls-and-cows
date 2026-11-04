import { RadixBase } from "./types";

const ALPHABET = "0123456789abcdef";

/**
 * Curried factory: returns a predicate to validate whether a single character
 * is a valid digit for the given base.
 * For hex (base 16), comparison is case-insensitive.
 */
export const createDigitValidator = (base: RadixBase): ((char: string) => boolean) => {
  const allowed = ALPHABET.slice(0, base);

  return (char: string): boolean => {
    if (typeof char !== "string" || char.length !== 1) {
      return false;
    }
    return allowed.includes(char.toLowerCase());
  };
};

/**
 * Validates whether a guess satisfies all game rules:
 * - exact specified length
 * - each character is a valid digit for base (using createDigitValidator)
 * - all digits are unique (case-insensitive for hex)
 */
export const isValidGuess = (guess: string, length: number, base: RadixBase): boolean => {
  if (typeof guess !== "string" || guess.length !== length) {
    return false;
  }

  const isDigit = createDigitValidator(base);
  const normalized = guess.toLowerCase();

  const allDigitsValid = normalized.split("").every(isDigit);
  if (!allDigitsValid) {
    return false;
  }

  const uniqueDigits = new Set(normalized);
  return uniqueDigits.size === length;
};
