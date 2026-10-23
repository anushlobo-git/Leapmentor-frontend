/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect, vi } from "vitest";
import {
  STEPS,
  validatePassword,
  getStrength,
  getStepDotClass,
} from "./forgotPassword.utils";

// Mock the password validation imports
vi.mock("@lib/validation/passwordValidation", () => ({
  getPasswordValidation: vi.fn((password) => ({
    isValid: password.length >= 8,
    errors: password.length < 8 ? ["Password must be at least 8 characters"] : [],
  })),
  getPasswordStrength: vi.fn((password) => {
    if (password.length >= 12) return "strong";
    if (password.length >= 8) return "medium";
    return "weak";
  }),
}));

describe("forgotPassword.utils", () => {
  describe("STEPS", () => {
    it("should have EMAIL step as 1", () => {
      expect(STEPS.EMAIL).toBe(1);
    });

    it("should have OTP step as 2", () => {
      expect(STEPS.OTP).toBe(2);
    });

    it("should have PASSWORD step as 3", () => {
      expect(STEPS.PASSWORD).toBe(3);
    });
  });

  describe("validatePassword", () => {
    it("should call getPasswordValidation with password", () => {
      const result = validatePassword("password123");
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("should return validation result for weak password", () => {
      const result = validatePassword("short");
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Password must be at least 8 characters");
    });
  });

  describe("getStrength", () => {
    it("should call getPasswordStrength with password", () => {
      const result = getStrength("password123");
      expect(result).toBe("medium");
    });

    it("should return strong for long password", () => {
      const result = getStrength("verylongpassword123");
      expect(result).toBe("strong");
    });

    it("should return weak for short password", () => {
      const result = getStrength("short");
      expect(result).toBe("weak");
    });
  });

  describe("getStepDotClass", () => {
    it("should return active class when dotStep equals currentStep", () => {
      const result = getStepDotClass(2, 2);
      expect(result).toBe("w-6 h-2.5 bg-blue-900");
    });

    it("should return completed class when dotStep is less than currentStep", () => {
      const result = getStepDotClass(1, 2);
      expect(result).toBe("w-2.5 h-2.5 bg-blue-300");
    });

    it("should return default class when dotStep is greater than currentStep", () => {
      const result = getStepDotClass(3, 2);
      expect(result).toBe("w-2.5 h-2.5 bg-slate-200");
    });

    it("should return active class for step 1 when on step 1", () => {
      const result = getStepDotClass(1, 1);
      expect(result).toBe("w-6 h-2.5 bg-blue-900");
    });

    it("should return completed class for step 1 when on step 2", () => {
      const result = getStepDotClass(1, 2);
      expect(result).toBe("w-2.5 h-2.5 bg-blue-300");
    });

    it("should return default class for step 3 when on step 1", () => {
      const result = getStepDotClass(3, 1);
      expect(result).toBe("w-2.5 h-2.5 bg-slate-200");
    });
  });
});
