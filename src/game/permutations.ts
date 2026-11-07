/**
 * Generic higher-order function for memoizing pure function results.
 */
export const memoize = <Args extends unknown[], Return>(
  fn: (...args: Args) => Return,
  keyResolver?: (...args: Args) => string,
): ((...args: Args) => Return) => {
  const cache = new Map<string, Return>();
  return (...args: Args): Return => {
    const key = keyResolver ? keyResolver(...args) : JSON.stringify(args);
    const cached = cache.get(key);
    if (cached !== undefined) {
      return cached;
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

/**
 * Recursive permutations calculator: P(base, length) = base * P(base - 1, length - 1).
 */
const calculatePermutations = (length: number, base: number): number => {
  if (length === 0) {
    return 1;
  }
  if (length < 0 || base < 0 || length > base) {
    return 0;
  }
  return base * countPossibleSecrets(length - 1, base - 1);
};

/**
 * Calculates the number of possible secret numbers for a given length and base.
 * Permutations without repetitions: P(base, length) = base! / (base - length)!.
 * Implemented recursively and memoized.
 */
export const countPossibleSecrets: (length: number, base: number) => number = memoize(
  calculatePermutations,
  (length, base) => `${length}:${base}`,
);
