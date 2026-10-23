/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import {
  mapMentorProfile,
  mapPagination,
  mapMentorSearchResponse,
} from "./mentorMapper";

describe("mentorMapper", () => {
  describe("mapMentorProfile", () => {
    it("should return default values when called with empty object", () => {
      const result = mapMentorProfile({});
      expect(result).toMatchObject({
        _id: null,
        user: {
          _id: null,
          name: "",
          email: "",
          isEmailVerified: false,
        },
        currentRole: "",
        company: "",
        industry: "",
        bio: "",
        location: "",
        skills: [],
        communicationPreferences: [],
        languages: [],
        portfolioUrl: null,
        linkedInUrl: null,
        hourlyRate: null,
        avgRating: 0,
        reviewCount: 0,
        totalSessions: 0,
        yearsOfExperience: null,
        profilePicture: null,
        profilePictureFileName: null,
        verificationStatus: "unverified",
        isProfilePublished: true,
        emailNotifications: true,
        phoneNumber: null,
        resumeDocument: null,
        workExperienceDocuments: [],
        isProfileComplete: false,
        createdAt: null,
        updatedAt: null,
      });
    });

    it("should map _id from raw._id", () => {
      const result = mapMentorProfile({ _id: "123" });
      expect(result._id).toBe("123");
    });

    it("should map _id from raw.id if _id is not present", () => {
      const result = mapMentorProfile({ id: "456" });
      expect(result._id).toBe("456");
    });

    it("should map user object", () => {
      const result = mapMentorProfile({
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
      const result = mapMentorProfile({
        user: { id: "u2", name: "Test" },
      });
      expect(result.user._id).toBe("u2");
    });

    it("should default user fields when user is missing", () => {
      const result = mapMentorProfile({});
      expect(result.user).toEqual({
        _id: null,
        name: "",
        email: "",
        isEmailVerified: false,
      });
    });

    it("should map isEmailVerified from raw.isEmailVerified if user.isEmailVerified is missing", () => {
      const result = mapMentorProfile({ isEmailVerified: true });
      expect(result.user.isEmailVerified).toBe(true);
    });

    it("should convert isEmailVerified to boolean", () => {
      const result1 = mapMentorProfile({ user: { isEmailVerified: "true" } });
      expect(result1.user.isEmailVerified).toBe(true);

      const result2 = mapMentorProfile({ user: { isEmailVerified: "" } });
      expect(result2.user.isEmailVerified).toBe(false);
    });

    it("should map currentRole, company, industry, bio, location", () => {
      const result = mapMentorProfile({
        currentRole: "Developer",
        company: "Tech Corp",
        industry: "Software",
        bio: "Test bio",
        location: "Remote",
      });
      expect(result.currentRole).toBe("Developer");
      expect(result.company).toBe("Tech Corp");
      expect(result.industry).toBe("Software");
      expect(result.bio).toBe("Test bio");
      expect(result.location).toBe("Remote");
    });

    it("should map skills as array", () => {
      const result = mapMentorProfile({ skills: ["skill1", "skill2"] });
      expect(result.skills).toEqual(["skill1", "skill2"]);
    });

    it("should default skills to empty array if not array", () => {
      const result = mapMentorProfile({ skills: "not an array" });
      expect(result.skills).toEqual([]);
    });

    it("should map communicationPreferences as array", () => {
      const result = mapMentorProfile({
        communicationPreferences: ["pref1", "pref2"],
      });
      expect(result.communicationPreferences).toEqual(["pref1", "pref2"]);
    });

    it("should default communicationPreferences to empty array if not array", () => {
      const result = mapMentorProfile({ communicationPreferences: "not an array" });
      expect(result.communicationPreferences).toEqual([]);
    });

    it("should map languages as array", () => {
      const result = mapMentorProfile({ languages: ["English", "Spanish"] });
      expect(result.languages).toEqual(["English", "Spanish"]);
    });

    it("should default languages to empty array if not array", () => {
      const result = mapMentorProfile({ languages: "not an array" });
      expect(result.languages).toEqual([]);
    });

    it("should map portfolioUrl and linkedInUrl", () => {
      const result = mapMentorProfile({
        portfolioUrl: "https://portfolio.com",
        linkedInUrl: "https://linkedin.com/in/test",
      });
      expect(result.portfolioUrl).toBe("https://portfolio.com");
      expect(result.linkedInUrl).toBe("https://linkedin.com/in/test");
    });

    it("should map hourlyRate as number", () => {
      const result1 = mapMentorProfile({ hourlyRate: 100 });
      expect(result1.hourlyRate).toBe(100);

      const result2 = mapMentorProfile({ hourlyRate: "50" });
      expect(result2.hourlyRate).toBe(null);
    });

    it("should map avgRating as number", () => {
      const result1 = mapMentorProfile({ avgRating: 4.5 });
      expect(result1.avgRating).toBe(4.5);

      const result2 = mapMentorProfile({ avgRating: "5" });
      expect(result2.avgRating).toBe(5);

      const result3 = mapMentorProfile({});
      expect(result3.avgRating).toBe(0);
    });

    it("should map reviewCount as number", () => {
      const result1 = mapMentorProfile({ reviewCount: 10 });
      expect(result1.reviewCount).toBe(10);

      const result2 = mapMentorProfile({ reviewCount: "5" });
      expect(result2.reviewCount).toBe(0);
    });

    it("should map totalSessions as number", () => {
      const result1 = mapMentorProfile({ totalSessions: 20 });
      expect(result1.totalSessions).toBe(20);

      const result2 = mapMentorProfile({ totalSessions: "10" });
      expect(result2.totalSessions).toBe(0);
    });

    it("should map yearsOfExperience as number", () => {
      const result1 = mapMentorProfile({ yearsOfExperience: 5 });
      expect(result1.yearsOfExperience).toBe(5);

      const result2 = mapMentorProfile({ yearsOfExperience: "3" });
      expect(result2.yearsOfExperience).toBe(null);
    });

    it("should map profilePicture from profilePicture or avatar", () => {
      const result1 = mapMentorProfile({ profilePicture: "pic1.jpg" });
      expect(result1.profilePicture).toBe("pic1.jpg");

      const result2 = mapMentorProfile({ avatar: "pic2.jpg" });
      expect(result2.profilePicture).toBe("pic2.jpg");
    });

    it("should map profilePictureFileName", () => {
      const result = mapMentorProfile({ profilePictureFileName: "file.jpg" });
      expect(result.profilePictureFileName).toBe("file.jpg");
    });

    it("should map verificationStatus with default to unverified", () => {
      const result1 = mapMentorProfile({ verificationStatus: "verified" });
      expect(result1.verificationStatus).toBe("verified");

      const result2 = mapMentorProfile({});
      expect(result2.verificationStatus).toBe("unverified");
    });

    it("should map isProfilePublished with default to true", () => {
      const result1 = mapMentorProfile({ isProfilePublished: false });
      expect(result1.isProfilePublished).toBe(false);

      const result2 = mapMentorProfile({});
      expect(result2.isProfilePublished).toBe(true);
    });

    it("should map emailNotifications with default to true", () => {
      const result1 = mapMentorProfile({ emailNotifications: false });
      expect(result1.emailNotifications).toBe(false);

      const result2 = mapMentorProfile({});
      expect(result2.emailNotifications).toBe(true);
    });

    it("should map phoneNumber", () => {
      const result = mapMentorProfile({ phoneNumber: "1234567890" });
      expect(result.phoneNumber).toBe("1234567890");
    });

    it("should map resumeDocument", () => {
      const result = mapMentorProfile({ resumeDocument: "resume.pdf" });
      expect(result.resumeDocument).toBe("resume.pdf");
    });

    it("should map workExperienceDocuments as array", () => {
      const result = mapMentorProfile({
        workExperienceDocuments: ["doc1.pdf", "doc2.pdf"],
      });
      expect(result.workExperienceDocuments).toEqual(["doc1.pdf", "doc2.pdf"]);
    });

    it("should default workExperienceDocuments to empty array if not array", () => {
      const result = mapMentorProfile({ workExperienceDocuments: "not an array" });
      expect(result.workExperienceDocuments).toEqual([]);
    });

    it("should convert isProfileComplete to boolean", () => {
      const result1 = mapMentorProfile({ isProfileComplete: true });
      expect(result1.isProfileComplete).toBe(true);

      const result2 = mapMentorProfile({ isProfileComplete: "true" });
      expect(result2.isProfileComplete).toBe(true);

      const result3 = mapMentorProfile({ isProfileComplete: false });
      expect(result3.isProfileComplete).toBe(false);
    });

    it("should map createdAt and updatedAt", () => {
      const result = mapMentorProfile({
        createdAt: "2024-01-01",
        updatedAt: "2024-01-02",
      });
      expect(result.createdAt).toBe("2024-01-01");
      expect(result.updatedAt).toBe("2024-01-02");
    });
  });

  describe("mapPagination", () => {
    it("should return default values when called with empty object", () => {
      const result = mapPagination({});
      expect(result).toEqual({
        page: 1,
        limit: 6,
        totalCount: 0,
        hasMore: false,
      });
    });

    it("should map page from page or currentPage", () => {
      const result1 = mapPagination({ page: 2 });
      expect(result1.page).toBe(2);

      const result2 = mapPagination({ currentPage: 3 });
      expect(result2.page).toBe(3);
    });

    it("should default page to 1 if not provided", () => {
      const result = mapPagination({});
      expect(result.page).toBe(1);
    });

    it("should map limit with default to 6", () => {
      const result1 = mapPagination({ limit: 10 });
      expect(result1.limit).toBe(10);

      const result2 = mapPagination({});
      expect(result2.limit).toBe(6);
    });

    it("should map totalCount as number", () => {
      const result1 = mapPagination({ totalCount: 100 });
      expect(result1.totalCount).toBe(100);

      const result2 = mapPagination({ totalCount: "50" });
      expect(result2.totalCount).toBe(0);
    });

    it("should default totalCount to 0 if not number", () => {
      const result = mapPagination({});
      expect(result.totalCount).toBe(0);
    });

    it("should convert hasMore to boolean", () => {
      const result1 = mapPagination({ hasMore: true });
      expect(result1.hasMore).toBe(true);

      const result2 = mapPagination({ hasMore: "true" });
      expect(result2.hasMore).toBe(true);

      const result3 = mapPagination({ hasMore: false });
      expect(result3.hasMore).toBe(false);

      const result4 = mapPagination({});
      expect(result4.hasMore).toBe(false);
    });
  });

  describe("mapMentorSearchResponse", () => {
    it("should return default values when called with empty object", () => {
      const result = mapMentorSearchResponse({});
      expect(result).toEqual({
        mentors: [],
        pagination: {
          page: 1,
          limit: 6,
          totalCount: 0,
          hasMore: false,
        },
      });
    });

    it("should map mentors array", () => {
      const result = mapMentorSearchResponse({
        mentors: [
          { _id: "m1", name: "Mentor 1" },
          { _id: "m2", name: "Mentor 2" },
        ],
      });
      expect(result.mentors).toHaveLength(2);
      expect(result.mentors[0]._id).toBe("m1");
      expect(result.mentors[1]._id).toBe("m2");
    });

    it("should default mentors to empty array if not array", () => {
      const result = mapMentorSearchResponse({ mentors: "not an array" });
      expect(result.mentors).toEqual([]);
    });

    it("should map pagination object", () => {
      const result = mapMentorSearchResponse({
        pagination: { page: 2, limit: 10, totalCount: 20, hasMore: true },
      });
      expect(result.pagination).toEqual({
        page: 2,
        limit: 10,
        totalCount: 20,
        hasMore: true,
      });
    });

    it("should default pagination to empty object if not provided", () => {
      const result = mapMentorSearchResponse({});
      expect(result.pagination).toEqual({
        page: 1,
        limit: 6,
        totalCount: 0,
        hasMore: false,
      });
    });

    it("should map both mentors and pagination together", () => {
      const result = mapMentorSearchResponse({
        mentors: [{ _id: "m1", name: "Mentor 1" }],
        pagination: { page: 1, limit: 6, totalCount: 1, hasMore: false },
      });
      expect(result.mentors).toHaveLength(1);
      expect(result.mentors[0]._id).toBe("m1");
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.totalCount).toBe(1);
    });
  });
});
