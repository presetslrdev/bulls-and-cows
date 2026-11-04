import { RadixBase } from "./types";

/**
 * Curried factory: returns a predicate to validate whether a character
 * is a valid digit for the given base.
 */
export const createDigitValidator = (_base: RadixBase): ((char: string) => boolean) => {
  // Stub implementation for TDD red phase
  return (_char: string): boolean => {
    return false;
  };
};
