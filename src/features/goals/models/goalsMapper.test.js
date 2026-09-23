/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import { mapGoal, mapMilestone } from "./goalsMapper";

describe("goalsMapper", () => {
  describe("mapGoal", () => {
    it("should return null when raw is null", () => {
      const result = mapGoal(null);
      expect(result).toBeNull();
    });

    it("should return null when raw is undefined", () => {
      const result = mapGoal(undefined);
      expect(result).toBeNull();
    });

    it("should return default values when called with empty object", () => {
      const result = mapGoal({});
      expect(result).toMatchObject({
        _id: null,
        title: "",
        description: "",
        startDate: null,
        endDate: null,
        status: null,
        connectRequestId: null,
        createdBy: null,
        mentor: null,
        mentee: null,
        createdAt: null,
        updatedAt: null,
      });
    });

    it("should map _id from raw._id", () => {
      const result = mapGoal({ _id: "123" });
      expect(result._id).toBe("123");
    });

    it("should map _id from raw.id if _id is not present", () => {
      const result = mapGoal({ id: "456" });
      expect(result._id).toBe("456");
    });

    it("should map title", () => {
      const result = mapGoal({ title: "Test Goal" });
      expect(result.title).toBe("Test Goal");
    });

    it("should map description", () => {
      const result = mapGoal({ description: "Test description" });
      expect(result.description).toBe("Test description");
    });

    it("should map startDate and endDate", () => {
      const result = mapGoal({
        startDate: "2024-01-01",
        endDate: "2024-12-31",
      });
      expect(result.startDate).toBe("2024-01-01");
      expect(result.endDate).toBe("2024-12-31");
    });

    it("should map status", () => {
      const result = mapGoal({ status: "in_progress" });
      expect(result.status).toBe("in_progress");
    });

    it("should map connectRequestId from connectRequestId or connectRequest", () => {
      const result1 = mapGoal({ connectRequestId: "req1" });
      expect(result1.connectRequestId).toBe("req1");

      const result2 = mapGoal({ connectRequest: "req2" });
      expect(result2.connectRequestId).toBe("req2");
    });

    it("should map createdBy", () => {
      const result = mapGoal({ createdBy: "user123" });
      expect(result.createdBy).toBe("user123");
    });

    it("should map mentor and mentee", () => {
      const result = mapGoal({
        mentor: "mentor123",
        mentee: "mentee123",
      });
      expect(result.mentor).toBe("mentor123");
      expect(result.mentee).toBe("mentee123");
    });

    it("should map createdAt and updatedAt", () => {
      const result = mapGoal({
        createdAt: "2024-01-01",
        updatedAt: "2024-01-02",
      });
      expect(result.createdAt).toBe("2024-01-01");
      expect(result.updatedAt).toBe("2024-01-02");
    });
  });

  describe("mapMilestone", () => {
    it("should return null when raw is null", () => {
      const result = mapMilestone(null);
      expect(result).toBeNull();
    });

    it("should return default values when called with undefined (due to default parameter)", () => {
      const result = mapMilestone(undefined);
      expect(result).toMatchObject({
        _id: null,
        title: "",
        description: "",
        dueDate: null,
        isCompleted: false,
        completedAt: null,
        completedBy: null,
        goalId: null,
        connectRequestId: null,
        order: 0,
        slotIndex: null,
        createdAt: null,
        updatedAt: null,
      });
    });

    it("should return default values when called with empty object", () => {
      const result = mapMilestone({});
      expect(result).toMatchObject({
        _id: null,
        title: "",
        description: "",
        dueDate: null,
        isCompleted: false,
        completedAt: null,
        completedBy: null,
        goalId: null,
        connectRequestId: null,
        order: 0,
        slotIndex: null,
        createdAt: null,
        updatedAt: null,
      });
    });

    it("should map _id from raw._id", () => {
      const result = mapMilestone({ _id: "123" });
      expect(result._id).toBe("123");
    });

    it("should map _id from raw.id if _id is not present", () => {
      const result = mapMilestone({ id: "456" });
      expect(result._id).toBe("456");
    });

    it("should map title", () => {
      const result = mapMilestone({ title: "Test Milestone" });
      expect(result.title).toBe("Test Milestone");
    });

    it("should map description", () => {
      const result = mapMilestone({ description: "Test description" });
      expect(result.description).toBe("Test description");
    });

    it("should map dueDate", () => {
      const result = mapMilestone({ dueDate: "2024-01-01" });
      expect(result.dueDate).toBe("2024-01-01");
    });

    it("should convert isCompleted to boolean", () => {
      const result1 = mapMilestone({ isCompleted: true });
      expect(result1.isCompleted).toBe(true);

      const result2 = mapMilestone({ isCompleted: "true" });
      expect(result2.isCompleted).toBe(true);

      const result3 = mapMilestone({ isCompleted: false });
      expect(result3.isCompleted).toBe(false);

      const result4 = mapMilestone({});
      expect(result4.isCompleted).toBe(false);
    });

    it("should map completedAt and completedBy", () => {
      const result = mapMilestone({
        completedAt: "2024-01-01",
        completedBy: "user123",
      });
      expect(result.completedAt).toBe("2024-01-01");
      expect(result.completedBy).toBe("user123");
    });

    it("should map goalId from goalId, goal._id, goal.id, or goal", () => {
      const result1 = mapMilestone({ goalId: "goal1" });
      expect(result1.goalId).toBe("goal1");

      const result2 = mapMilestone({ goal: { _id: "goal2" } });
      expect(result2.goalId).toBe("goal2");

      const result3 = mapMilestone({ goal: { id: "goal3" } });
      expect(result3.goalId).toBe("goal3");

      const result4 = mapMilestone({ goal: "goal4" });
      expect(result4.goalId).toBe("goal4");
    });

    it("should map connectRequestId from connectRequestId or connectRequest", () => {
      const result1 = mapMilestone({ connectRequestId: "req1" });
      expect(result1.connectRequestId).toBe("req1");

      const result2 = mapMilestone({ connectRequest: "req2" });
      expect(result2.connectRequestId).toBe("req2");
    });

    it("should map order as number", () => {
      const result1 = mapMilestone({ order: 5 });
      expect(result1.order).toBe(5);

      const result2 = mapMilestone({ order: "3" });
      expect(result2.order).toBe(0);
    });

    it("should default order to 0 if not number", () => {
      const result = mapMilestone({});
      expect(result.order).toBe(0);
    });

    it("should map slotIndex as number", () => {
      const result1 = mapMilestone({ slotIndex: 2 });
      expect(result1.slotIndex).toBe(2);

      const result2 = mapMilestone({ slotIndex: "1" });
      expect(result2.slotIndex).toBe(null);
    });

    it("should default slotIndex to null if not number", () => {
      const result = mapMilestone({});
      expect(result.slotIndex).toBe(null);
    });

    it("should map createdAt and updatedAt", () => {
      const result = mapMilestone({
        createdAt: "2024-01-01",
        updatedAt: "2024-01-02",
      });
      expect(result.createdAt).toBe("2024-01-01");
      expect(result.updatedAt).toBe("2024-01-02");
    });
  });
});
