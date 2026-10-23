/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import { mapMenteeProfile } from "./menteeMapper";

describe("menteeMapper", () => {
  describe("mapMenteeProfile", () => {
    it("should return default values when called with empty object", () => {
      const result = mapMenteeProfile({});
      expect(result).toMatchObject({
        _id: null,
        user: {
          _id: null,
          name: "",
          email: "",
          isEmailVerified: false,
        },
        profilePicture: null,
        profilePictureFileName: null,
        bio: "",
        currentRole: "",
        company: "",
        industry: "",
        yearsOfExperience: null,
        skills: [],
        interestedFields: [],
        communicationPreferences: [],
        languages: [],
        linkedInUrl: null,
        portfolioUrl: null,
        phoneNumber: null,
        isProfilePublished: false,
        emailNotifications: true,
        marketingPreferences: false,
        isProfileComplete: false,
        createdAt: null,
        updatedAt: null,
      });
    });

    it("should map _id from raw._id", () => {
      const result = mapMenteeProfile({ _id: "123" });
      expect(result._id).toBe("123");
    });

    it("should map _id from raw.id if _id is not present", () => {
      const result = mapMenteeProfile({ id: "456" });
      expect(result._id).toBe("456");
    });

    it("should map user object", () => {
      const result = mapMenteeProfile({
        user: {
          _id: "u1",
          name: "Test User",
          email: "test@example.com",
          isEmailVerified: true,
        },
      });
      expect(result.user).toEqual({
        _id: "u1",
        name: "Test User",
        email: "test@example.com",
        isEmailVerified: true,
      });
    });

    it("should map user._id from user.id if user._id is not present", () => {
      const result = mapMenteeProfile({
        user: { id: "u2", name: "Test" },
      });
      expect(result.user._id).toBe("u2");
    });

    it("should default user fields when user is missing", () => {
      const result = mapMenteeProfile({});
      expect(result.user).toEqual({
        _id: null,
        name: "",
        email: "",
        isEmailVerified: false,
      });
    });

    it("should map isEmailVerified from raw.isEmailVerified if user.isEmailVerified is missing", () => {
      const result = mapMenteeProfile({ isEmailVerified: true });
      expect(result.user.isEmailVerified).toBe(true);
    });

    it("should convert isEmailVerified to boolean", () => {
      const result1 = mapMenteeProfile({ user: { isEmailVerified: "true" } });
      expect(result1.user.isEmailVerified).toBe(true);

      const result2 = mapMenteeProfile({ user: { isEmailVerified: "" } });
      expect(result2.user.isEmailVerified).toBe(false);
    });

    it("should map profilePicture from profilePicture or avatar", () => {
      const result1 = mapMenteeProfile({ profilePicture: "pic1.jpg" });
      expect(result1.profilePicture).toBe("pic1.jpg");

      const result2 = mapMenteeProfile({ avatar: "pic2.jpg" });
      expect(result2.profilePicture).toBe("pic2.jpg");
    });

    it("should map profilePictureFileName", () => {
      const result = mapMenteeProfile({ profilePictureFileName: "file.jpg" });
      expect(result.profilePictureFileName).toBe("file.jpg");
    });

    it("should map bio", () => {
      const result = mapMenteeProfile({ bio: "Test bio" });
      expect(result.bio).toBe("Test bio");
    });

    it("should map currentRole, company, industry", () => {
      const result = mapMenteeProfile({
        currentRole: "Developer",
        company: "Tech Corp",
        industry: "Software",
      });
      expect(result.currentRole).toBe("Developer");
      expect(result.company).toBe("Tech Corp");
      expect(result.industry).toBe("Software");
    });

    it("should map yearsOfExperience as number", () => {
      const result1 = mapMenteeProfile({ yearsOfExperience: 5 });
      expect(result1.yearsOfExperience).toBe(5);

      const result2 = mapMenteeProfile({ yearsOfExperience: "3" });
      expect(result2.yearsOfExperience).toBe(3);
    });

    it("should default yearsOfExperience to null if invalid", () => {
      const result1 = mapMenteeProfile({ yearsOfExperience: "invalid" });
      expect(result1.yearsOfExperience).toBe(null);

      const result2 = mapMenteeProfile({ yearsOfExperience: null });
      expect(result2.yearsOfExperience).toBe(null);
    });

    it("should map skills as array", () => {
      const result = mapMenteeProfile({ skills: ["skill1", "skill2"] });
      expect(result.skills).toEqual(["skill1", "skill2"]);
    });

    it("should default skills to empty array if not array", () => {
      const result = mapMenteeProfile({ skills: "not an array" });
      expect(result.skills).toEqual([]);
    });

    it("should map interestedFields as array", () => {
      const result = mapMenteeProfile({ interestedFields: ["field1", "field2"] });
      expect(result.interestedFields).toEqual(["field1", "field2"]);
    });

    it("should default interestedFields to empty array if not array", () => {
      const result = mapMenteeProfile({ interestedFields: "not an array" });
      expect(result.interestedFields).toEqual([]);
    });

    it("should map communicationPreferences as array", () => {
      const result = mapMenteeProfile({ communicationPreferences: ["pref1", "pref2"] });
      expect(result.communicationPreferences).toEqual(["pref1", "pref2"]);
    });

    it("should default communicationPreferences to empty array if not array", () => {
      const result = mapMenteeProfile({ communicationPreferences: "not an array" });
      expect(result.communicationPreferences).toEqual([]);
    });

    it("should map languages as array", () => {
      const result = mapMenteeProfile({ languages: ["English", "Spanish"] });
      expect(result.languages).toEqual(["English", "Spanish"]);
    });

    it("should default languages to empty array if not array", () => {
      const result = mapMenteeProfile({ languages: "not an array" });
      expect(result.languages).toEqual([]);
    });

    it("should map linkedInUrl and portfolioUrl", () => {
      const result = mapMenteeProfile({
        linkedInUrl: "https://linkedin.com/in/test",
        portfolioUrl: "https://portfolio.com",
      });
      expect(result.linkedInUrl).toBe("https://linkedin.com/in/test");
      expect(result.portfolioUrl).toBe("https://portfolio.com");
    });

    it("should map phoneNumber", () => {
      const result = mapMenteeProfile({ phoneNumber: "1234567890" });
      expect(result.phoneNumber).toBe("1234567890");
    });

    it("should map isProfilePublished with default to false", () => {
      const result1 = mapMenteeProfile({ isProfilePublished: true });
      expect(result1.isProfilePublished).toBe(true);

      const result2 = mapMenteeProfile({});
      expect(result2.isProfilePublished).toBe(false);
    });

    it("should map emailNotifications with default to true", () => {
      const result1 = mapMenteeProfile({ emailNotifications: false });
      expect(result1.emailNotifications).toBe(false);

      const result2 = mapMenteeProfile({});
      expect(result2.emailNotifications).toBe(true);
    });

    it("should map marketingPreferences with default to false", () => {
      const result1 = mapMenteeProfile({ marketingPreferences: true });
      expect(result1.marketingPreferences).toBe(true);

      const result2 = mapMenteeProfile({});
      expect(result2.marketingPreferences).toBe(false);
    });

    it("should convert isProfileComplete to boolean", () => {
      const result1 = mapMenteeProfile({ isProfileComplete: true });
      expect(result1.isProfileComplete).toBe(true);

      const result2 = mapMenteeProfile({ isProfileComplete: "true" });
      expect(result2.isProfileComplete).toBe(true);

      const result3 = mapMenteeProfile({ isProfileComplete: false });
      expect(result3.isProfileComplete).toBe(false);
    });

    it("should map createdAt and updatedAt", () => {
      const result = mapMenteeProfile({
        createdAt: "2024-01-01",
        updatedAt: "2024-01-02",
      });
      expect(result.createdAt).toBe("2024-01-01");
      expect(result.updatedAt).toBe("2024-01-02");
    });
  });
});
