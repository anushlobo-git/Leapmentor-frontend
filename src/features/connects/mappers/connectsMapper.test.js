/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import { mapConnectRequest } from "./connectsMapper";

describe("connectsMapper", () => {
  describe("mapConnectRequest", () => {
    it("should return default values when called with empty object", () => {
      const result = mapConnectRequest({});
      expect(result).toMatchObject({
        _id: null,
        status: "pending",
        mentor: null,
        mentee: null,
        mentorProfile: null,
        menteeProfile: null,
        message: "",
        referredBy: null,
        referredByProfile: null,
        referredTo: null,
        referredToProfile: null,
        referredRequestId: null,
        requestedAt: null,
        respondedAt: null,
        selectedSlots: [],
        confirmedSlot: null,
        additionalSlots: [],
        sessionRate: null,
        sessionCount: null,
        totalAmount: null,
        paymentStatus: null,
        paidAt: null,
        completedAt: null,
        commissionRate: null,
        commissionAmount: null,
        mentorPayout: null,
        createdAt: null,
        updatedAt: null,
      });
    });

    it("should map _id from raw._id", () => {
      const result = mapConnectRequest({ _id: "123" });
      expect(result._id).toBe("123");
    });

    it("should map _id from raw.id if _id is not present", () => {
      const result = mapConnectRequest({ id: "456" });
      expect(result._id).toBe("456");
    });

    it("should map status with default to pending", () => {
      const result = mapConnectRequest({ status: "accepted" });
      expect(result.status).toBe("accepted");
    });

    it("should map mentor using mapPerson", () => {
      const result = mapConnectRequest({
        mentor: { _id: "m1", name: "Mentor Name", email: "mentor@test.com" },
      });
      expect(result.mentor).toEqual({
        _id: "m1",
        name: "Mentor Name",
        email: "mentor@test.com",
        profilePicture: null,
      });
    });

    it("should map mentee using mapPerson", () => {
      const result = mapConnectRequest({
        mentee: { _id: "me1", name: "Mentee Name", email: "mentee@test.com" },
      });
      expect(result.mentee).toEqual({
        _id: "me1",
        name: "Mentee Name",
        email: "mentee@test.com",
        profilePicture: null,
      });
    });

    it("should map mentorProfile and menteeProfile", () => {
      const result = mapConnectRequest({
        mentorProfile: { bio: "Mentor bio" },
        menteeProfile: { bio: "Mentee bio" },
      });
      expect(result.mentorProfile).toEqual({ bio: "Mentor bio" });
      expect(result.menteeProfile).toEqual({ bio: "Mentee bio" });
    });

    it("should map message", () => {
      const result = mapConnectRequest({ message: "Hello" });
      expect(result.message).toBe("Hello");
    });

    it("should map referredBy and referredByProfile", () => {
      const result = mapConnectRequest({
        referredBy: "user123",
        referredByProfile: { name: "Referrer" },
      });
      expect(result.referredBy).toBe("user123");
      expect(result.referredByProfile).toEqual({ name: "Referrer" });
    });

    it("should map referredTo using mapPerson", () => {
      const result = mapConnectRequest({
        referredTo: { _id: "r1", name: "Referred To" },
      });
      expect(result.referredTo).toEqual({
        _id: "r1",
        name: "Referred To",
        email: null,
        profilePicture: null,
      });
    });

    it("should map referredToProfile and referredRequestId", () => {
      const result = mapConnectRequest({
        referredToProfile: { name: "Profile" },
        referredRequestId: "req123",
      });
      expect(result.referredToProfile).toEqual({ name: "Profile" });
      expect(result.referredRequestId).toBe("req123");
    });

    it("should map requestedAt from requestedAt or createdAt", () => {
      const result1 = mapConnectRequest({ requestedAt: "2024-01-01" });
      expect(result1.requestedAt).toBe("2024-01-01");

      const result2 = mapConnectRequest({ createdAt: "2024-01-02" });
      expect(result2.requestedAt).toBe("2024-01-02");
    });

    it("should map respondedAt", () => {
      const result = mapConnectRequest({ respondedAt: "2024-01-01" });
      expect(result.respondedAt).toBe("2024-01-01");
    });

    it("should map selectedSlots as array", () => {
      const result = mapConnectRequest({ selectedSlots: ["slot1", "slot2"] });
      expect(result.selectedSlots).toEqual(["slot1", "slot2"]);
    });

    it("should default selectedSlots to empty array if not array", () => {
      const result = mapConnectRequest({ selectedSlots: "not an array" });
      expect(result.selectedSlots).toEqual([]);
    });

    it("should map confirmedSlot", () => {
      const result = mapConnectRequest({ confirmedSlot: "slot1" });
      expect(result.confirmedSlot).toBe("slot1");
    });

    it("should map additionalSlots as array", () => {
      const result = mapConnectRequest({ additionalSlots: ["slot1", "slot2"] });
      expect(result.additionalSlots).toEqual(["slot1", "slot2"]);
    });

    it("should default additionalSlots to empty array if not array", () => {
      const result = mapConnectRequest({ additionalSlots: "not an array" });
      expect(result.additionalSlots).toEqual([]);
    });

    it("should map payment-related fields", () => {
      const result = mapConnectRequest({
        sessionRate: 100,
        sessionCount: 5,
        totalAmount: 500,
        paymentStatus: "paid",
        paidAt: "2024-01-01",
      });
      expect(result.sessionRate).toBe(100);
      expect(result.sessionCount).toBe(5);
      expect(result.totalAmount).toBe(500);
      expect(result.paymentStatus).toBe("paid");
      expect(result.paidAt).toBe("2024-01-01");
    });

    it("should map completion and commission fields", () => {
      const result = mapConnectRequest({
        completedAt: "2024-01-01",
        commissionRate: 0.1,
        commissionAmount: 50,
        mentorPayout: 450,
      });
      expect(result.completedAt).toBe("2024-01-01");
      expect(result.commissionRate).toBe(0.1);
      expect(result.commissionAmount).toBe(50);
      expect(result.mentorPayout).toBe(450);
    });

    it("should map createdAt and updatedAt", () => {
      const result = mapConnectRequest({
        createdAt: "2024-01-01",
        updatedAt: "2024-01-02",
      });
      expect(result.createdAt).toBe("2024-01-01");
      expect(result.updatedAt).toBe("2024-01-02");
    });

    it("should handle null mentor and mentee", () => {
      const result = mapConnectRequest({
        mentor: null,
        mentee: null,
      });
      expect(result.mentor).toBeNull();
      expect(result.mentee).toBeNull();
    });

    it("should handle person with id instead of _id", () => {
      const result = mapConnectRequest({
        mentor: { id: "m1", name: "Mentor" },
      });
      expect(result.mentor._id).toBe("m1");
    });

    it("should handle person with missing optional fields", () => {
      const result = mapConnectRequest({
        mentor: { _id: "m1" },
      });
      expect(result.mentor).toEqual({
        _id: "m1",
        name: "",
        email: null,
        profilePicture: null,
      });
    });
  });
});
