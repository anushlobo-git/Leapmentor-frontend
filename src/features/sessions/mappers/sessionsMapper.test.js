/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import { mapSlot, mapSessionSlotsResponse } from "./sessionsMapper";

describe("sessionsMapper", () => {
  describe("mapSlot", () => {
    it("should normalize a complete slot object", () => {
      const raw = {
        _id: "slot123",
        day: "Monday",
        date: "2024-01-15",
        startTime: "10:00",
        endTime: "11:00",
        meetingLink: "https://meet.example.com/abc123",
        status: "completed",
        isCompleted: true,
        isCancelled: false,
        menteeMarked: true,
        mentorMarked: true,
        isRescheduled: false,
        cancelledBy: null,
        cancellationReason: null,
        createdAt: "2024-01-10T10:00:00Z",
        updatedAt: "2024-01-15T11:00:00Z",
      };

      const result = mapSlot(raw);

      expect(result).toEqual({
        _id: "slot123",
        day: "Monday",
        date: "2024-01-15",
        startTime: "10:00",
        endTime: "11:00",
        meetingLink: "https://meet.example.com/abc123",
        status: "completed",
        isCompleted: true,
        isCancelled: false,
        menteeMarked: true,
        mentorMarked: true,
        isRescheduled: false,
        cancelledBy: null,
        cancellationReason: null,
        createdAt: "2024-01-10T10:00:00Z",
        updatedAt: "2024-01-15T11:00:00Z",
      });
    });

    it("should handle empty input with defaults", () => {
      const result = mapSlot({});

      expect(result).toEqual({
        _id: null,
        day: "",
        date: null,
        startTime: "",
        endTime: "",
        meetingLink: null,
        status: "scheduled",
        isCompleted: false,
        isCancelled: false,
        menteeMarked: false,
        mentorMarked: false,
        isRescheduled: false,
        cancelledBy: null,
        cancellationReason: null,
        createdAt: null,
        updatedAt: null,
      });
    });

    it("should use id as fallback for _id", () => {
      const raw = {
        id: "slot123",
      };

      const result = mapSlot(raw);

      expect(result._id).toBe("slot123");
    });

    it("should convert boolean-like values to booleans", () => {
      const raw = {
        isCompleted: 1,
        isCancelled: "true",
        menteeMarked: "yes",
        mentorMarked: 0,
        isRescheduled: null,
      };

      const result = mapSlot(raw);

      expect(result.isCompleted).toBe(true);
      expect(result.isCancelled).toBe(true);
      expect(result.menteeMarked).toBe(true);
      expect(result.mentorMarked).toBe(false);
      expect(result.isRescheduled).toBe(false);
    });

    it("should use cancelReason as fallback for cancellationReason", () => {
      const raw = {
        cancelReason: "Emergency",
      };

      const result = mapSlot(raw);

      expect(result.cancellationReason).toBe("Emergency");
    });

    it("should prefer cancellationReason over cancelReason", () => {
      const raw = {
        cancellationReason: "Primary reason",
        cancelReason: "Fallback reason",
      };

      const result = mapSlot(raw);

      expect(result.cancellationReason).toBe("Primary reason");
    });
  });

  describe("mapSessionSlotsResponse", () => {
    it("should normalize a complete response object", () => {
      const raw = {
        slots: [
          {
            _id: "slot1",
            day: "Monday",
            status: "completed",
          },
          {
            _id: "slot2",
            day: "Tuesday",
            status: "scheduled",
          },
        ],
        completedSlots: 1,
        totalSlots: 2,
        progress: 50,
        allComplete: false,
      };

      const result = mapSessionSlotsResponse(raw);

      expect(result).toEqual({
        slots: [
          {
            _id: "slot1",
            day: "Monday",
            date: null,
            startTime: "",
            endTime: "",
            meetingLink: null,
            status: "completed",
            isCompleted: false,
            isCancelled: false,
            menteeMarked: false,
            mentorMarked: false,
            isRescheduled: false,
            cancelledBy: null,
            cancellationReason: null,
            createdAt: null,
            updatedAt: null,
          },
          {
            _id: "slot2",
            day: "Tuesday",
            date: null,
            startTime: "",
            endTime: "",
            meetingLink: null,
            status: "scheduled",
            isCompleted: false,
            isCancelled: false,
            menteeMarked: false,
            mentorMarked: false,
            isRescheduled: false,
            cancelledBy: null,
            cancellationReason: null,
            createdAt: null,
            updatedAt: null,
          },
        ],
        completedSlots: 1,
        totalSlots: 2,
        progress: 50,
        allComplete: false,
      });
    });

    it("should handle empty input with defaults", () => {
      const result = mapSessionSlotsResponse({});

      expect(result).toEqual({
        slots: [],
        completedSlots: 0,
        totalSlots: 0,
        progress: 0,
        allComplete: false,
      });
    });

    it("should handle non-array slots as empty array", () => {
      const raw = {
        slots: "not an array",
      };

      const result = mapSessionSlotsResponse(raw);

      expect(result.slots).toEqual([]);
    });

    it("should convert string numbers to numbers", () => {
      const raw = {
        completedSlots: "5",
        totalSlots: "10",
        progress: "50",
      };

      const result = mapSessionSlotsResponse(raw);

      expect(result.completedSlots).toBe(0);
      expect(result.totalSlots).toBe(0);
      expect(result.progress).toBe(0);
    });

    it("should handle null/undefined numeric fields as 0", () => {
      const raw = {
        completedSlots: null,
        totalSlots: undefined,
        progress: null,
      };

      const result = mapSessionSlotsResponse(raw);

      expect(result.completedSlots).toBe(0);
      expect(result.totalSlots).toBe(0);
      expect(result.progress).toBe(0);
    });

    it("should convert boolean-like allComplete to boolean", () => {
      const raw = {
        allComplete: "true",
      };

      const result = mapSessionSlotsResponse(raw);

      expect(result.allComplete).toBe(true);
    });

    it("should handle null allComplete as false", () => {
      const raw = {
        allComplete: null,
      };

      const result = mapSessionSlotsResponse(raw);

      expect(result.allComplete).toBe(false);
    });
  });
});
