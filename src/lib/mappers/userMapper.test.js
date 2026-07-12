/**
 * Copyright (c) 2026 LeapMentor. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import { mapAuthUser } from "./userMapper";

describe("userMapper", () => {
  describe("mapAuthUser", () => {
    it("should map user with all fields", () => {
      const raw = {
        _id: "123",
        name: "John Doe",
        email: "john@example.com",
        roles: ["mentor", "mentee"],
        profilePicture: "avatar.jpg",
        isEmailVerified: true,
        termsAccepted: true,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-02",
      };

      const result = mapAuthUser(raw);

      expect(result).toEqual({
        _id: "123",
        name: "John Doe",
        email: "john@example.com",
        roles: ["mentor", "mentee"],
        profilePicture: "avatar.jpg",
        isVerified: true,
        termsAccepted: true,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-02",
      });
    });

    it("should use id field when _id is not present", () => {
      const raw = {
        id: "456",
        name: "Jane Doe",
        email: "jane@example.com",
      };

      const result = mapAuthUser(raw);

      expect(result._id).toBe("456");
    });

    it("should provide default empty string for name", () => {
      const result = mapAuthUser({});
      expect(result.name).toBe("");
    });

    it("should provide default empty string for email", () => {
      const result = mapAuthUser({});
      expect(result.email).toBe("");
    });

    it("should provide default empty array for roles", () => {
      const result = mapAuthUser({});
      expect(result.roles).toEqual([]);
    });

    it("should handle non-array roles", () => {
      const result = mapAuthUser({ roles: "mentor" });
      expect(result.roles).toEqual([]);
    });

    it("should handle null roles", () => {
      const result = mapAuthUser({ roles: null });
      expect(result.roles).toEqual([]);
    });

    it("should use avatar field when profilePicture is not present", () => {
      const raw = {
        avatar: "avatar.jpg",
      };

      const result = mapAuthUser(raw);

      expect(result.profilePicture).toBe("avatar.jpg");
    });

    it("should use user.profilePicture when profilePicture and avatar are not present", () => {
      const raw = {
        user: {
          profilePicture: "user-avatar.jpg",
        },
      };

      const result = mapAuthUser(raw);

      expect(result.profilePicture).toBe("user-avatar.jpg");
    });

    it("should provide default null for profilePicture", () => {
      const result = mapAuthUser({});
      expect(result.profilePicture).toBe(null);
    });

    it("should convert isEmailVerified to boolean", () => {
      const result1 = mapAuthUser({ isEmailVerified: true });
      expect(result1.isVerified).toBe(true);

      const result2 = mapAuthUser({ isEmailVerified: false });
      expect(result2.isVerified).toBe(false);

      const result3 = mapAuthUser({ isEmailVerified: "true" });
      expect(result3.isVerified).toBe(true);
    });

    it("should use isVerified field when isEmailVerified is not present", () => {
      const result = mapAuthUser({ isVerified: true });
      expect(result.isVerified).toBe(true);
    });

    it("should use emailVerified field when isEmailVerified and isVerified are not present", () => {
      const result = mapAuthUser({ emailVerified: true });
      expect(result.isVerified).toBe(true);
    });

    it("should provide default false for isVerified", () => {
      const result = mapAuthUser({});
      expect(result.isVerified).toBe(false);
    });

    it("should convert termsAccepted to boolean", () => {
      const result1 = mapAuthUser({ termsAccepted: true });
      expect(result1.termsAccepted).toBe(true);

      const result2 = mapAuthUser({ termsAccepted: false });
      expect(result2.termsAccepted).toBe(false);

      const result3 = mapAuthUser({ termsAccepted: "true" });
      expect(result3.termsAccepted).toBe(true);
    });

    it("should provide default false for termsAccepted", () => {
      const result = mapAuthUser({});
      expect(result.termsAccepted).toBe(false);
    });

    it("should provide default null for createdAt", () => {
      const result = mapAuthUser({});
      expect(result.createdAt).toBe(null);
    });

    it("should provide default null for updatedAt", () => {
      const result = mapAuthUser({});
      expect(result.updatedAt).toBe(null);
    });

    it("should handle null input", () => {
      const result = mapAuthUser(null);
      expect(result).toEqual({
        _id: null,
        name: "",
        email: "",
        roles: [],
        profilePicture: null,
        isVerified: false,
        termsAccepted: false,
        createdAt: null,
        updatedAt: null,
      });
    });

    it("should handle undefined input", () => {
      const result = mapAuthUser(undefined);
      expect(result).toEqual({
        _id: null,
        name: "",
        email: "",
        roles: [],
        profilePicture: null,
        isVerified: false,
        termsAccepted: false,
        createdAt: null,
        updatedAt: null,
      });
    });

    it("should prefer profilePicture over avatar over user.profilePicture", () => {
      const raw = {
        profilePicture: "direct.jpg",
        avatar: "avatar.jpg",
        user: {
          profilePicture: "user.jpg",
        },
      };

      const result = mapAuthUser(raw);

      expect(result.profilePicture).toBe("direct.jpg");
    });

    it("should prefer isEmailVerified over isVerified over emailVerified", () => {
      const raw = {
        isEmailVerified: false,
        isVerified: true,
        emailVerified: true,
      };

      const result = mapAuthUser(raw);

      expect(result.isVerified).toBe(false);
    });
  });
});
