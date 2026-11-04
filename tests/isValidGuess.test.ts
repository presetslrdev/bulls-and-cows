import { describe, it, expect } from "vitest";
import { isValidGuess } from "../src/game/validator";

describe("isValidGuess (FIRST)", () => {
  describe("Valid guesses", () => {
    it("should accept valid binary guesses of length 2", () => {
      expect(isValidGuess("01", 2, 2)).toBe(true);
      expect(isValidGuess("10", 2, 2)).toBe(true);
    });

    it("should accept valid decimal guesses, including leading zeros", () => {
      expect(isValidGuess("0123", 4, 10)).toBe(true);
      expect(isValidGuess("9876", 4, 10)).toBe(true);
      expect(isValidGuess("4321", 4, 10)).toBe(true);
    });

    it("should accept valid hexadecimal guesses with mixed case", () => {
      expect(isValidGuess("1aB3", 4, 16)).toBe(true);
      expect(isValidGuess("0Fa9", 4, 16)).toBe(true);
      expect(isValidGuess("cde0", 4, 16)).toBe(true);
    });
  });

  describe("Length validation", () => {
    it("should reject guesses that are shorter than required length", () => {
      expect(isValidGuess("123", 4, 10)).toBe(false);
      expect(isValidGuess("1", 2, 2)).toBe(false);
      expect(isValidGuess("", 4, 10)).toBe(false);
    });

    it("should reject guesses that are longer than required length", () => {
      expect(isValidGuess("12345", 4, 10)).toBe(false);
      expect(isValidGuess("010", 2, 2)).toBe(false);
    });
  });

  describe("Base character validation", () => {
    it("should reject binary guess containing digits > 1", () => {
      expect(isValidGuess("02", 2, 2)).toBe(false);
      expect(isValidGuess("91", 2, 2)).toBe(false);
    });

    it("should reject octal guess containing digits '8' or '9'", () => {
      expect(isValidGuess("1278", 4, 8)).toBe(false);
      expect(isValidGuess("0349", 4, 8)).toBe(false);
    });

    it("should reject decimal guess containing letters or symbols", () => {
      expect(isValidGuess("123a", 4, 10)).toBe(false);
      expect(isValidGuess("1-23", 4, 10)).toBe(false);
      expect(isValidGuess("12 3", 4, 10)).toBe(false);
    });

    it("should reject hexadecimal guess containing characters > 'f'", () => {
      expect(isValidGuess("123g", 4, 16)).toBe(false);
      expect(isValidGuess("abcdG", 5, 16)).toBe(false);
    });
  });

  describe("Duplicate digits validation", () => {
    it("should reject guesses with duplicate decimal digits", () => {
      expect(isValidGuess("1123", 4, 10)).toBe(false);
      expect(isValidGuess("1223", 4, 10)).toBe(false);
      expect(isValidGuess("1231", 4, 10)).toBe(false);
      expect(isValidGuess("0012", 4, 10)).toBe(false);
    });

    it("should reject hex guesses with duplicate letters of different case", () => {
      expect(isValidGuess("aA12", 4, 16)).toBe(false);
      expect(isValidGuess("0fF1", 4, 16)).toBe(false);
      expect(isValidGuess("B1b2", 4, 16)).toBe(false);
    });
  });
});
