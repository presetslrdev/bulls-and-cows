import { describe, it, expect, vi } from "vitest";
import { countPossibleSecrets, memoize } from "../src/game/permutations";

describe("countPossibleSecrets (FIRST)", () => {
  describe("Permutations calculation", () => {
    it("should return 1 when length is 0 (base case)", () => {
      expect(countPossibleSecrets(0, 10)).toBe(1);
    });

    it("should correctly compute permutations for binary base (base 2)", () => {
      expect(countPossibleSecrets(1, 2)).toBe(2);
      expect(countPossibleSecrets(2, 2)).toBe(2);
      expect(countPossibleSecrets(3, 2)).toBe(0); // length > base is impossible
    });

    it("should correctly compute permutations for octal base (base 8)", () => {
      // 8 * 7 * 6 = 336
      expect(countPossibleSecrets(3, 8)).toBe(336);
    });

    it("should correctly compute permutations for decimal base (base 10)", () => {
      // 10
      expect(countPossibleSecrets(1, 10)).toBe(10);
      // 10 * 9 = 90
      expect(countPossibleSecrets(2, 10)).toBe(90);
      // 10 * 9 * 8 = 720
      expect(countPossibleSecrets(3, 10)).toBe(720);
      // 10 * 9 * 8 * 7 = 5040
      expect(countPossibleSecrets(4, 10)).toBe(5040);
      // 10 * 9 * 8 * 7 * 6 = 30240
      expect(countPossibleSecrets(5, 10)).toBe(30240);
      // 10 * 9 * 8 * 7 * 6 * 5 = 151200
      expect(countPossibleSecrets(6, 10)).toBe(151200);
    });

    it("should correctly compute permutations for hexadecimal base (base 16)", () => {
      // 16 * 15 * 14 * 13 = 43680
      expect(countPossibleSecrets(4, 16)).toBe(43680);
    });
  });

  describe("Edge cases & boundaries", () => {
    it("should return 0 when length exceeds base", () => {
      expect(countPossibleSecrets(5, 2)).toBe(0);
      expect(countPossibleSecrets(11, 10)).toBe(0);
    });

    it("should return 0 for negative lengths or non-positive base", () => {
      expect(countPossibleSecrets(-1, 10)).toBe(0);
      expect(countPossibleSecrets(2, -5)).toBe(0);
      expect(countPossibleSecrets(2, 0)).toBe(0);
    });
  });

  describe("Memoization mechanics", () => {
    it("should cache results of calls without re-evaluating", () => {
      const spy = vi.fn((x: number, y: number) => x * y);
      const memoizedFn = memoize(spy);

      const first = memoizedFn(4, 10);
      const second = memoizedFn(4, 10);

      expect(first).toBe(40);
      expect(second).toBe(40);
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
});
