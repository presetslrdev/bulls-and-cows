import { describe, it, expect } from "vitest";
import { createDigitValidator } from "../src/game/validator";

describe("createDigitValidator (FIRST)", () => {
  describe("Base 2 (Binary)", () => {
    const isBinDigit = createDigitValidator(2);

    it("should accept valid binary digits '0' and '1'", () => {
      expect(isBinDigit("0")).toBe(true);
      expect(isBinDigit("1")).toBe(true);
    });

    it("should reject digits outside base 2", () => {
      expect(isBinDigit("2")).toBe(false);
      expect(isBinDigit("9")).toBe(false);
      expect(isBinDigit("a")).toBe(false);
    });
  });

  describe("Base 8 (Octal)", () => {
    const isOctDigit = createDigitValidator(8);

    it("should accept digits from '0' to '7'", () => {
      for (let i = 0; i <= 7; i += 1) {
        expect(isOctDigit(String(i))).toBe(true);
      }
    });

    it("should reject digits '8', '9' and non-numeric characters", () => {
      expect(isOctDigit("8")).toBe(false);
      expect(isOctDigit("9")).toBe(false);
      expect(isOctDigit("a")).toBe(false);
    });
  });

  describe("Base 10 (Decimal)", () => {
    const isDecDigit = createDigitValidator(10);

    it("should accept all decimal digits '0' through '9'", () => {
      for (let i = 0; i <= 9; i += 1) {
        expect(isDecDigit(String(i))).toBe(true);
      }
    });

    it("should reject alphabetic characters and symbols", () => {
      expect(isDecDigit("a")).toBe(false);
      expect(isDecDigit("f")).toBe(false);
      expect(isDecDigit("-")).toBe(false);
    });
  });

  describe("Base 16 (Hexadecimal)", () => {
    const isHexDigit = createDigitValidator(16);

    it("should accept decimal digits '0'-'9'", () => {
      for (let i = 0; i <= 9; i += 1) {
        expect(isHexDigit(String(i))).toBe(true);
      }
    });

    it("should accept lowercase letters 'a'-'f'", () => {
      ["a", "b", "c", "d", "e", "f"].forEach((ch) => {
        expect(isHexDigit(ch)).toBe(true);
      });
    });

    it("should accept uppercase letters 'A'-'F' case-insensitively", () => {
      ["A", "B", "C", "D", "E", "F"].forEach((ch) => {
        expect(isHexDigit(ch)).toBe(true);
      });
    });

    it("should reject characters beyond 'f'", () => {
      expect(isHexDigit("g")).toBe(false);
      expect(isHexDigit("G")).toBe(false);
      expect(isHexDigit("z")).toBe(false);
    });
  });

  describe("Edge cases", () => {
    const isDecDigit = createDigitValidator(10);

    it("should reject empty string, whitespace and multi-character inputs", () => {
      expect(isDecDigit("")).toBe(false);
      expect(isDecDigit(" ")).toBe(false);
      expect(isDecDigit("12")).toBe(false);
      expect(isDecDigit("\n")).toBe(false);
    });
  });
});
