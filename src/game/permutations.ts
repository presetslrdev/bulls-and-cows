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
 * Calculates the number of possible secret numbers for a given length and base.
 * Permutations without repetitions: P(base, length) = base! / (base - length)!.
 * Implemented recursively and memoized.
 */
export const countPossibleSecrets = (_length: number, _base: number): number => {
  // Stub implementation for TDD red phase
  return -1;
};
