/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import {
  MENTEE_ONBOARDING_FIELDS,
  MENTOR_ONBOARDING_FIELDS,
} from "./onboardingFields";

describe("onboardingFields", () => {
  describe("MENTEE_ONBOARDING_FIELDS", () => {
    it("should be an array of field definitions", () => {
      expect(Array.isArray(MENTEE_ONBOARDING_FIELDS)).toBe(true);
      expect(MENTEE_ONBOARDING_FIELDS.length).toBeGreaterThan(0);
    });

    it("should have field objects with key and type properties", () => {
      MENTEE_ONBOARDING_FIELDS.forEach((field) => {
        expect(field).toHaveProperty("key");
        expect(field).toHaveProperty("type");
        expect(typeof field.key).toBe("string");
        expect(typeof field.type).toBe("string");
      });
    });

    it("should have expected mentee fields", () => {
      const keys = MENTEE_ONBOARDING_FIELDS.map((f) => f.key);
      expect(keys).toContain("profilePicture");
      expect(keys).toContain("bio");
      expect(keys).toContain("currentRole");
      expect(keys).toContain("company");
      expect(keys).toContain("industry");
      expect(keys).toContain("yearsOfExperience");
      expect(keys).toContain("interestedFields");
      expect(keys).toContain("skills");
      expect(keys).toContain("communicationPreferences");
      expect(keys).toContain("languages");
      expect(keys).toContain("linkedInUrl");
      expect(keys).toContain("portfolioUrl");
    });

    it("should have correct field types", () => {
      const fieldTypes = MENTEE_ONBOARDING_FIELDS.reduce((acc, field) => {
        acc[field.key] = field.type;
        return acc;
      }, {});

      expect(fieldTypes.profilePicture).toBe("string");
      expect(fieldTypes.bio).toBe("string");
      expect(fieldTypes.interestedFields).toBe("array");
      expect(fieldTypes.skills).toBe("array");
      expect(fieldTypes.communicationPreferences).toBe("array");
      expect(fieldTypes.languages).toBe("array");
    });
  });

  describe("MENTOR_ONBOARDING_FIELDS", () => {
    it("should be an array of field definitions", () => {
      expect(Array.isArray(MENTOR_ONBOARDING_FIELDS)).toBe(true);
      expect(MENTOR_ONBOARDING_FIELDS.length).toBeGreaterThan(0);
    });

    it("should have field objects with key and type properties", () => {
      MENTOR_ONBOARDING_FIELDS.forEach((field) => {
        expect(field).toHaveProperty("key");
        expect(field).toHaveProperty("type");
        expect(typeof field.key).toBe("string");
        expect(typeof field.type).toBe("string");
      });
    });

    it("should have expected mentor fields", () => {
      const keys = MENTOR_ONBOARDING_FIELDS.map((f) => f.key);
      expect(keys).toContain("profilePicture");
      expect(keys).toContain("bio");
      expect(keys).toContain("currentRole");
      expect(keys).toContain("industry");
      expect(keys).toContain("company");
      expect(keys).toContain("yearsOfExperience");
      expect(keys).toContain("hourlyRate");
      expect(keys).toContain("skills");
      expect(keys).toContain("communicationPreferences");
      expect(keys).toContain("languages");
      expect(keys).toContain("linkedInUrl");
      expect(keys).toContain("portfolioUrl");
    });

    it("should have correct field types", () => {
      const fieldTypes = MENTOR_ONBOARDING_FIELDS.reduce((acc, field) => {
        acc[field.key] = field.type;
        return acc;
      }, {});

      expect(fieldTypes.profilePicture).toBe("string");
      expect(fieldTypes.bio).toBe("string");
      expect(fieldTypes.hourlyRate).toBe("string");
      expect(fieldTypes.skills).toBe("array");
      expect(fieldTypes.communicationPreferences).toBe("array");
      expect(fieldTypes.languages).toBe("string");
    });

    it("should have hourlyRate field which mentee does not have", () => {
      const menteeKeys = MENTEE_ONBOARDING_FIELDS.map((f) => f.key);
      const mentorKeys = MENTOR_ONBOARDING_FIELDS.map((f) => f.key);

      expect(mentorKeys).toContain("hourlyRate");
      expect(menteeKeys).not.toContain("hourlyRate");
    });

    it("should have interestedFields field which mentor does not have", () => {
      const menteeKeys = MENTEE_ONBOARDING_FIELDS.map((f) => f.key);
      const mentorKeys = MENTOR_ONBOARDING_FIELDS.map((f) => f.key);

      expect(menteeKeys).toContain("interestedFields");
      expect(mentorKeys).not.toContain("interestedFields");
    });
  });
});
