import { describe, it, expect } from "vitest";
import { evaluateGuess } from "../src/game/evaluator";

describe("evaluateGuess (FIRST)", () => {
  describe("Exact matches (all bulls)", () => {
    it("should return all bulls and 0 cows for an identical guess", () => {
      expect(evaluateGuess("1234", "1234")).toEqual({ bulls: 4, cows: 0 });
      expect(evaluateGuess("01", "01")).toEqual({ bulls: 2, cows: 0 });
    });
  });

  describe("Permutations (all cows)", () => {
    it("should return all cows and 0 bulls when all digits are present in wrong positions", () => {
      expect(evaluateGuess("1234", "4321")).toEqual({ bulls: 0, cows: 4 });
      expect(evaluateGuess("1234", "2341")).toEqual({ bulls: 0, cows: 4 });
      expect(evaluateGuess("01", "10")).toEqual({ bulls: 0, cows: 2 });
    });
  });

  describe("Mixed matches", () => {
    it("should correctly count combinations of bulls and cows", () => {
      // '1', '2' match position (2 bulls); '4', '3' swapped (2 cows)
      expect(evaluateGuess("1234", "1243")).toEqual({ bulls: 2, cows: 2 });

      // '2' matches position (1 bull); '1', '4' in secret at different places (2 cows); '3' not in secret
      expect(evaluateGuess("4271", "1234")).toEqual({ bulls: 1, cows: 2 });

      // '1' is bull (1); '3', '2' are cows (2); '5' is neither
      expect(evaluateGuess("1234", "1325")).toEqual({ bulls: 1, cows: 2 });
    });
  });

  describe("Zero matches", () => {
    it("should return 0 bulls and 0 cows when no digits intersect", () => {
      expect(evaluateGuess("1234", "5678")).toEqual({ bulls: 0, cows: 0 });
      expect(evaluateGuess("abcd", "ef01")).toEqual({ bulls: 0, cows: 0 });
    });
  });

  describe("Hexadecimal case-insensitivity", () => {
    it("should treat hex digits case-insensitively for bulls and cows", () => {
      expect(evaluateGuess("1aB3", "1Ab3")).toEqual({ bulls: 4, cows: 0 });
      expect(evaluateGuess("0fa9", "9Af0")).toEqual({ bulls: 0, cows: 4 });
      expect(evaluateGuess("C0DE", "c0ed")).toEqual({ bulls: 2, cows: 2 });
    });
  });
});
