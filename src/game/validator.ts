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
