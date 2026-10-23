/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import {
  mapEarningsSummary,
  mapChartPoint,
  mapPayout,
  mapPayoutsResponse,
} from "./earningsMapper";

describe("earningsMapper", () => {
  describe("mapEarningsSummary", () => {
    it("should return default values when called with empty object", () => {
      const result = mapEarningsSummary({});
      expect(result).toEqual({
        totalEarnings: 0,
        sessionsThisMonth: 0,
        avgRating: 0,
        pendingPayout: 0,
        walletBalance: 0,
      });
    });

    it("should map totalEarnings as number", () => {
      const result1 = mapEarningsSummary({ totalEarnings: 1000 });
      expect(result1.totalEarnings).toBe(1000);

      const result2 = mapEarningsSummary({ totalEarnings: "500" });
      expect(result2.totalEarnings).toBe(0);
    });

    it("should map sessionsThisMonth as number", () => {
      const result1 = mapEarningsSummary({ sessionsThisMonth: 10 });
      expect(result1.sessionsThisMonth).toBe(10);

      const result2 = mapEarningsSummary({ sessionsThisMonth: "5" });
      expect(result2.sessionsThisMonth).toBe(0);
    });

    it("should map avgRating as number", () => {
      const result1 = mapEarningsSummary({ avgRating: 4.5 });
      expect(result1.avgRating).toBe(4.5);

      const result2 = mapEarningsSummary({ avgRating: "5" });
      expect(result2.avgRating).toBe(5);

      const result3 = mapEarningsSummary({});
      expect(result3.avgRating).toBe(0);
    });

    it("should map pendingPayout as number", () => {
      const result1 = mapEarningsSummary({ pendingPayout: 250 });
      expect(result1.pendingPayout).toBe(250);

      const result2 = mapEarningsSummary({ pendingPayout: "100" });
      expect(result2.pendingPayout).toBe(0);
    });

    it("should map walletBalance as number", () => {
      const result1 = mapEarningsSummary({ walletBalance: 500 });
      expect(result1.walletBalance).toBe(500);

      const result2 = mapEarningsSummary({ walletBalance: "200" });
      expect(result2.walletBalance).toBe(0);
    });
  });

  describe("mapChartPoint", () => {
    it("should return default values when called with empty object", () => {
      const result = mapChartPoint({});
      expect(result).toEqual({
        label: null,
        amount: 0,
        sessions: 0,
      });
    });

    it("should map label from label or date", () => {
      const result1 = mapChartPoint({ label: "Jan 2024" });
      expect(result1.label).toBe("Jan 2024");

      const result2 = mapChartPoint({ date: "2024-01-01" });
      expect(result2.label).toBe("2024-01-01");
    });

    it("should map amount as number", () => {
      const result1 = mapChartPoint({ amount: 100 });
      expect(result1.amount).toBe(100);

      const result2 = mapChartPoint({ amount: "50" });
      expect(result2.amount).toBe(0);
    });

    it("should map sessions as number", () => {
      const result1 = mapChartPoint({ sessions: 5 });
      expect(result1.sessions).toBe(5);

      const result2 = mapChartPoint({ sessions: "3" });
      expect(result2.sessions).toBe(0);
    });
  });

  describe("mapPayout", () => {
    it("should return default values when called with empty object", () => {
      const result = mapPayout({});
      expect(result).toEqual({
        id: null,
        date: null,
        menteeName: "",
        sessionType: "",
        duration: "",
        amount: 0,
        status: "pending",
        processedAt: null,
        transactionId: null,
        bankAccount: null,
      });
    });

    it("should map id from _id or id", () => {
      const result1 = mapPayout({ _id: "p1" });
      expect(result1.id).toBe("p1");

      const result2 = mapPayout({ id: "p2" });
      expect(result2.id).toBe("p2");
    });

    it("should map date from date, createdAt, or requestedAt", () => {
      const result1 = mapPayout({ date: "2024-01-01" });
      expect(result1.date).toBe("2024-01-01");

      const result2 = mapPayout({ createdAt: "2024-01-02" });
      expect(result2.date).toBe("2024-01-02");

      const result3 = mapPayout({ requestedAt: "2024-01-03" });
      expect(result3.date).toBe("2024-01-03");
    });

    it("should map menteeName from menteeName or mentee.name", () => {
      const result1 = mapPayout({ menteeName: "John Doe" });
      expect(result1.menteeName).toBe("John Doe");

      const result2 = mapPayout({ mentee: { name: "Jane Doe" } });
      expect(result2.menteeName).toBe("Jane Doe");
    });

    it("should map sessionType from sessionType or session.type", () => {
      const result1 = mapPayout({ sessionType: "video" });
      expect(result1.sessionType).toBe("video");

      const result2 = mapPayout({ session: { type: "chat" } });
      expect(result2.sessionType).toBe("chat");
    });

    it("should map duration from duration or session.duration", () => {
      const result1 = mapPayout({ duration: "60min" });
      expect(result1.duration).toBe("60min");

      const result2 = mapPayout({ session: { duration: "30min" } });
      expect(result2.duration).toBe("30min");
    });

    it("should map amount as number", () => {
      const result1 = mapPayout({ amount: 100 });
      expect(result1.amount).toBe(100);

      const result2 = mapPayout({ amount: "50" });
      expect(result2.amount).toBe(0);
    });

    it("should map status with default to pending", () => {
      const result1 = mapPayout({ status: "completed" });
      expect(result1.status).toBe("completed");

      const result2 = mapPayout({});
      expect(result2.status).toBe("pending");
    });

    it("should map processedAt", () => {
      const result = mapPayout({ processedAt: "2024-01-01" });
      expect(result.processedAt).toBe("2024-01-01");
    });

    it("should map transactionId", () => {
      const result = mapPayout({ transactionId: "txn123" });
      expect(result.transactionId).toBe("txn123");
    });

    it("should map bankAccount from bankAccount or accountNumber", () => {
      const result1 = mapPayout({ bankAccount: "123456" });
      expect(result1.bankAccount).toBe("123456");

      const result2 = mapPayout({ accountNumber: "654321" });
      expect(result2.bankAccount).toBe("654321");
    });
  });

  describe("mapPayoutsResponse", () => {
    it("should return default values when called with empty object", () => {
      const result = mapPayoutsResponse({});
      expect(result.payouts).toEqual([]);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 6,
        totalCount: 0,
        hasMore: false,
      });
    });

    it("should map payouts array", () => {
      const result = mapPayoutsResponse({
        payouts: [
          { _id: "p1", amount: 100 },
          { _id: "p2", amount: 200 },
        ],
      });
      expect(result.payouts).toHaveLength(2);
      expect(result.payouts[0].id).toBe("p1");
      expect(result.payouts[1].id).toBe("p2");
    });

    it("should default payouts to empty array if not array", () => {
      const result = mapPayoutsResponse({ payouts: "not an array" });
      expect(result.payouts).toEqual([]);
    });

    it("should map pagination object", () => {
      const result = mapPayoutsResponse({
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
      const result = mapPayoutsResponse({});
      expect(result.pagination).toEqual({
        page: 1,
        limit: 6,
        totalCount: 0,
        hasMore: false,
      });
    });

    it("should map both payouts and pagination together", () => {
      const result = mapPayoutsResponse({
        payouts: [{ _id: "p1", amount: 100 }],
        pagination: { page: 1, limit: 6, totalCount: 1, hasMore: false },
      });
      expect(result.payouts).toHaveLength(1);
      expect(result.payouts[0].id).toBe("p1");
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.totalCount).toBe(1);
    });
  });
});
