/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import {
  getPasswordValidation,
  getPasswordStrength,
  getPasswordRules,
} from "./passwordValidation";

describe("passwordValidation", () => {
  describe("getPasswordValidation", () => {
    it("should return 0 passed rules for empty password", () => {
      const result = getPasswordValidation("");
      expect(result.passed).toBe(0);
      expect(result.total).toBe(4);
      expect(result.rules).toHaveLength(4);
    });

    it("should return 1 passed for password with only length", () => {
      const result = getPasswordValidation("abcdefgh");
      expect(result.passed).toBe(1);
    });

    it("should return 1 passed for password with only uppercase", () => {
      const result = getPasswordValidation("A");
      expect(result.passed).toBe(1);
    });

    it("should return 1 passed for password with only number", () => {
      const result = getPasswordValidation("1");
      expect(result.passed).toBe(1);
    });

    it("should return 1 passed for password with only special char", () => {
      const result = getPasswordValidation("!");
      expect(result.passed).toBe(1);
    });

    it("should return 2 passed for password with length and uppercase", () => {
      const result = getPasswordValidation("Abcdefgh");
      expect(result.passed).toBe(2);
    });

    it("should return 2 passed for password with length and number", () => {
      const result = getPasswordValidation("abcdefgh1");
      expect(result.passed).toBe(2);
    });

    it("should return 2 passed for password with length and special", () => {
      const result = getPasswordValidation("abcdefgh!");
      expect(result.passed).toBe(2);
    });

    it("should return 3 passed for password with length, uppercase, number", () => {
      const result = getPasswordValidation("Abcdefgh1");
      expect(result.passed).toBe(3);
    });

    it("should return 3 passed for password with length, uppercase, special", () => {
      const result = getPasswordValidation("Abcdefgh!");
      expect(result.passed).toBe(3);
    });

    it("should return 3 passed for password with length, number, special", () => {
      const result = getPasswordValidation("abcdefgh1!");
      expect(result.passed).toBe(3);
    });

    it("should return 4 passed for strong password", () => {
      const result = getPasswordValidation("Abcdefgh1!");
      expect(result.passed).toBe(4);
    });

    it("should return all rules with correct labels", () => {
      const result = getPasswordValidation("test");
      expect(result.rules[0].id).toBe("length");
      expect(result.rules[0].label).toBe("At least 8 characters");
      expect(result.rules[1].id).toBe("uppercase");
      expect(result.rules[1].label).toBe("At least 1 uppercase letter");
      expect(result.rules[2].id).toBe("number");
      expect(result.rules[2].label).toBe("At least 1 number");
      expect(result.rules[3].id).toBe("special");
      expect(result.rules[3].label).toBe("At least 1 special character");
    });
  });

  describe("getPasswordStrength", () => {
    it("should return Weak for 0 passed", () => {
      const result = getPasswordStrength(0);
      expect(result).toEqual({ label: "Weak", color: "#ef4444", width: "25%" });
    });

    it("should return Weak for 1 passed", () => {
      const result = getPasswordStrength(1);
      expect(result).toEqual({ label: "Weak", color: "#ef4444", width: "25%" });
    });

    it("should return Fair for 2 passed", () => {
      const result = getPasswordStrength(2);
      expect(result).toEqual({ label: "Fair", color: "#f59e0b", width: "50%" });
    });

    it("should return Good for 3 passed", () => {
      const result = getPasswordStrength(3);
      expect(result).toEqual({ label: "Good", color: "#3b82f6", width: "75%" });
    });

    it("should return Strong for 4 passed", () => {
      const result = getPasswordStrength(4);
      expect(result).toEqual({ label: "Strong", color: "#22c55e", width: "100%" });
    });

    it("should return Strong for more than 4 passed", () => {
      const result = getPasswordStrength(5);
      expect(result).toEqual({ label: "Strong", color: "#22c55e", width: "100%" });
    });
  });

  describe("getPasswordRules", () => {
    it("should return all password rules", () => {
      const result = getPasswordRules();
      expect(result).toHaveLength(4);
      expect(result[0].id).toBe("length");
      expect(result[1].id).toBe("uppercase");
      expect(result[2].id).toBe("number");
      expect(result[3].id).toBe("special");
    });

    it("should return rules with test functions", () => {
      const result = getPasswordRules();
      result.forEach((rule) => {
        expect(typeof rule.test).toBe("function");
      });
    });
  });
});
