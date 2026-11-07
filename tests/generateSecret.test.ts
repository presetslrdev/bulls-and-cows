import { describe, it, expect } from "vitest";
import { generateSecret } from "../src/game/generator";
import { createDigitValidator } from "../src/game/validator";

describe("generateSecret (FIRST)", () => {
  describe("Deterministic generation with injected random", () => {
    it("should produce an exact predictable secret when given a sequence of random values", () => {
      // Mock random sequence picking index 0 every time
      // Available in base 10: ['0','1','2','3','4','5','6','7','8','9']
      // 1st pick: index 0 -> '0'
      // 2nd pick: index 0 -> '1'
      // 3rd pick: index 0 -> '2'
      // 4th pick: index 0 -> '3'
      const deterministicRandom = () => 0.0;

      const secret = generateSecret(4, 10, deterministicRandom);
      expect(secret).toBe("0123");
    });

    it("should pick from middle of available pool based on random values", () => {
      // In base 8: ['0', '1', '2', '3', '4', '5', '6', '7']
      // 1st call: random = 0.5 -> index = floor(0.5 * 8) = 4 -> '4'
      // Remaining: ['0', '1', '2', '3', '5', '6', '7'] (len 7)
      // 2nd call: random = 0.5 -> index = floor(0.5 * 7) = 3 -> '3'
      // Remaining: ['0', '1', '2', '5', '6', '7'] (len 6)
      // 3rd call: random = 0.5 -> index = floor(0.5 * 6) = 3 -> '5'
      const values = [0.5, 0.5, 0.5];
      let callCount = 0;
      const deterministicRandom = () => values[callCount++] ?? 0;

      const secret = generateSecret(3, 8, deterministicRandom);
      expect(secret).toBe("435");
    });
  });

  describe("Properties of generated secret", () => {
    it("should generate secret of exact requested length", () => {
      const secret = generateSecret(4, 10);
      expect(secret).toHaveLength(4);
    });

    it("should contain strictly unique digits", () => {
      for (let i = 0; i < 20; i += 1) {
        const secret = generateSecret(5, 10);
        const uniqueChars = new Set(secret);
        expect(uniqueChars.size).toBe(5);
      }
    });

    it("should only contain digits valid for the specified base", () => {
      const isHex = createDigitValidator(16);
      const secret = generateSecret(6, 16);
      expect(secret).toHaveLength(6);
      expect(secret.split("").every(isHex)).toBe(true);
    });

    it("should work properly for binary base (length 2)", () => {
      const secret = generateSecret(2, 2);
      expect(["01", "10"]).toContain(secret);
    });
  });

  describe("Validation & error handling", () => {
    it("should throw an error if requested length exceeds base size", () => {
      expect(() => generateSecret(3, 2)).toThrow();
      expect(() => generateSecret(11, 10)).toThrow();
    });

    it("should throw an error if length is less than 1", () => {
      expect(() => generateSecret(0, 10)).toThrow();
      expect(() => generateSecret(-2, 10)).toThrow();
    });
  });
});
