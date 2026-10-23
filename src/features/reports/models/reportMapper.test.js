/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import { mapFeedback } from "./reportMapper";

describe("reportMapper", () => {
  describe("mapFeedback", () => {
    it("should normalize a complete feedback object", () => {
      const raw = {
        _id: "feedback123",
        rating: 5,
        comment: "Great session!",
        fromUserId: "user1",
        toUserId: "user2",
        fromUser: {
          _id: "user1",
          name: "John Doe",
          email: "john@example.com",
        },
        toUser: {
          _id: "user2",
          name: "Jane Doe",
          email: "jane@example.com",
        },
        connectRequestId: "connect123",
        slotIndex: 0,
        fromRole: "mentee",
        createdAt: "2024-01-15T10:30:00Z",
        updatedAt: "2024-01-15T10:30:00Z",
      };

      const result = mapFeedback(raw);

      expect(result).toEqual({
        _id: "feedback123",
        rating: 5,
        comment: "Great session!",
        fromUserId: "user1",
        toUserId: "user2",
        fromUser: {
          _id: "user1",
          name: "John Doe",
          email: "john@example.com",
        },
        toUser: {
          _id: "user2",
          name: "Jane Doe",
          email: "jane@example.com",
        },
        connectRequestId: "connect123",
        slotIndex: 0,
        fromRole: "mentee",
        createdAt: "2024-01-15T10:30:00Z",
        updatedAt: "2024-01-15T10:30:00Z",
      });
    });

    it("should handle empty input with defaults", () => {
      const result = mapFeedback({});

      expect(result).toEqual({
        _id: null,
        rating: 0,
        comment: "",
        fromUserId: null,
        toUserId: null,
        fromUser: null,
        toUser: null,
        connectRequestId: null,
        slotIndex: null,
        fromRole: "",
        createdAt: null,
        updatedAt: null,
      });
    });

    it("should use id as fallback for _id", () => {
      const raw = {
        id: "feedback123",
      };

      const result = mapFeedback(raw);

      expect(result._id).toBe("feedback123");
    });

    it("should convert string rating to number", () => {
      const raw = {
        rating: "4",
      };

      const result = mapFeedback(raw);

      expect(result.rating).toBe(4);
    });

    it("should handle invalid rating as 0", () => {
      const raw = {
        rating: "invalid",
      };

      const result = mapFeedback(raw);

      expect(result.rating).toBe(0);
    });

    it("should use from as fallback for fromUser", () => {
      const raw = {
        from: {
          _id: "user1",
          name: "John Doe",
          email: "john@example.com",
        },
      };

      const result = mapFeedback(raw);

      expect(result.fromUser).toEqual({
        _id: "user1",
        name: "John Doe",
        email: "john@example.com",
      });
    });

    it("should use to as fallback for toUser", () => {
      const raw = {
        to: {
          _id: "user2",
          name: "Jane Doe",
          email: "jane@example.com",
        },
      };

      const result = mapFeedback(raw);

      expect(result.toUser).toEqual({
        _id: "user2",
        name: "Jane Doe",
        email: "jane@example.com",
      });
    });

    it("should extract fromUserId from nested fromUser", () => {
      const raw = {
        fromUser: {
          _id: "user1",
        },
      };

      const result = mapFeedback(raw);

      expect(result.fromUserId).toBe("user1");
    });

    it("should extract toUserId from nested toUser", () => {
      const raw = {
        toUser: {
          _id: "user2",
        },
      };

      const result = mapFeedback(raw);

      expect(result.toUserId).toBe("user2");
    });

    it("should use connectRequest._id as fallback for connectRequestId", () => {
      const raw = {
        connectRequest: {
          _id: "connect123",
        },
      };

      const result = mapFeedback(raw);

      expect(result.connectRequestId).toBe("connect123");
    });

    it("should use connectRequest as fallback for connectRequestId", () => {
      const raw = {
        connectRequest: "connect123",
      };

      const result = mapFeedback(raw);

      expect(result.connectRequestId).toBe("connect123");
    });

    it("should handle null slotIndex", () => {
      const raw = {
        slotIndex: null,
      };

      const result = mapFeedback(raw);

      expect(result.slotIndex).toBeNull();
    });

    it("should handle string slotIndex as null", () => {
      const raw = {
        slotIndex: "0",
      };

      const result = mapFeedback(raw);

      expect(result.slotIndex).toBeNull();
    });

    it("should use id fallback in nested fromUser", () => {
      const raw = {
        fromUser: {
          id: "user1",
          name: "John Doe",
        },
      };

      const result = mapFeedback(raw);

      expect(result.fromUser._id).toBe("user1");
    });

    it("should use id fallback in nested toUser", () => {
      const raw = {
        toUser: {
          id: "user2",
          name: "Jane Doe",
        },
      };

      const result = mapFeedback(raw);

      expect(result.toUser._id).toBe("user2");
    });
  });
});
