/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import { mentorProfileConfig, menteeProfileConfig } from "./profileConfig";

describe("profileConfig", () => {
  describe("mentorProfileConfig", () => {
    it("should have correct mentor configuration", () => {
      expect(mentorProfileConfig.role).toBe("mentor");
      expect(mentorProfileConfig.dashboardTitle).toBe("Mentor Dashboard");
      expect(mentorProfileConfig.editPath).toBe("/dashboard/mentor/edit-profile");
      expect(mentorProfileConfig.showVerification).toBe(true);
    });

    it("should have professional fields with format functions", () => {
      expect(mentorProfileConfig.professionalFields).toHaveLength(6);

      const yearsField = mentorProfileConfig.professionalFields.find(
        (f) => f.key === "yearsOfExperience"
      );
      expect(yearsField.format(5)).toBe("5+ Years");
      expect(yearsField.format(null)).toBeNull();

      const rateField = mentorProfileConfig.professionalFields.find(
        (f) => f.key === "hourlyRate"
      );
      expect(rateField.format(100)).toBe("LP 100/hr");
      expect(rateField.format(0)).toBeNull();

      const ratingField = mentorProfileConfig.professionalFields.find(
        (f) => f.key === "avgRating"
      );
      expect(ratingField.format(4.5)).toBe("⭐ 4.5 / 5");
      expect(ratingField.format(0)).toBeNull();
    });

    it("should have skills tag section", () => {
      expect(mentorProfileConfig.tagSections).toHaveLength(1);
      expect(mentorProfileConfig.tagSections[0].key).toBe("skills");
      expect(mentorProfileConfig.tagSections[0].title).toBe("Skills & Expertise");
      expect(mentorProfileConfig.tagSections[0].emptyText).toBe("No skills added yet.");
      expect(mentorProfileConfig.tagSections[0].chipStyle).toBe("accent");
    });

    it("should have null commLabelMap", () => {
      expect(mentorProfileConfig.commLabelMap).toBeNull();
    });
  });

  describe("menteeProfileConfig", () => {
    it("should have correct mentee configuration", () => {
      expect(menteeProfileConfig.role).toBe("mentee");
      expect(menteeProfileConfig.dashboardTitle).toBe("Mentee Dashboard");
      expect(menteeProfileConfig.editPath).toBe("/dashboard/mentee/edit-profile");
      expect(menteeProfileConfig.showVerification).toBe(false);
    });

    it("should have professional fields with format functions", () => {
      expect(menteeProfileConfig.professionalFields).toHaveLength(4);

      const yearsField = menteeProfileConfig.professionalFields.find(
        (f) => f.key === "yearsOfExperience"
      );
      expect(yearsField.format(5)).toBe("5 Years");
      expect(yearsField.format(null)).toBeNull();
    });

    it("should have two tag sections", () => {
      expect(menteeProfileConfig.tagSections).toHaveLength(2);

      const interestedFields = menteeProfileConfig.tagSections.find(
        (s) => s.key === "interestedFields"
      );
      expect(interestedFields.title).toBe("Interested Fields");
      expect(interestedFields.chipStyle).toBe("plain");

      const skills = menteeProfileConfig.tagSections.find((s) => s.key === "skills");
      expect(skills.title).toBe("Top Skills");
      expect(skills.chipStyle).toBe("plain");
    });

    it("should have commLabelMap with friendly labels", () => {
      expect(menteeProfileConfig.commLabelMap).toEqual({
        Chat: "Instant Messaging / Chat",
        "Video Call": "Video Conferences",
        Email: "Email Correspondence",
      });
    });
  });

  describe("format functions", () => {
    it("should format mentor years of experience with + suffix", () => {
      const field = mentorProfileConfig.professionalFields.find(
        (f) => f.key === "yearsOfExperience"
      );
      expect(field.format(3)).toBe("3+ Years");
      expect(field.format(10)).toBe("10+ Years");
    });

    it("should format mentee years of experience without + suffix", () => {
      const field = menteeProfileConfig.professionalFields.find(
        (f) => f.key === "yearsOfExperience"
      );
      expect(field.format(3)).toBe("3 Years");
      expect(field.format(10)).toBe("10 Years");
    });

    it("should format hourly rate with LP prefix", () => {
      const field = mentorProfileConfig.professionalFields.find(
        (f) => f.key === "hourlyRate"
      );
      expect(field.format(50)).toBe("LP 50/hr");
      expect(field.format(150)).toBe("LP 150/hr");
    });

    it("should format rating with star and decimal", () => {
      const field = mentorProfileConfig.professionalFields.find(
        (f) => f.key === "avgRating"
      );
      expect(field.format(4.5)).toBe("⭐ 4.5 / 5");
      expect(field.format(3.75)).toBe("⭐ 3.8 / 5");
    });
  });
});
