/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import {
  FONT,
  MONO,
  SKELETON_ROW_IDS,
  SKELETON_COL_IDS,
  SKELETON_COL_WIDTHS,
  TYPE_CONFIG,
  STATUS_CONFIG,
  TYPE_FILTERS,
  TABLE_COLUMNS,
} from "./payments.constants";

describe("payments.constants", () => {
  describe("FONT and MONO", () => {
    it("should export FONT", () => {
      expect(FONT).toBe("'DM Sans', sans-serif");
    });

    it("should export MONO", () => {
      expect(MONO).toBe("'DM Mono', monospace");
    });
  });

  describe("SKELETON_ROW_IDS", () => {
    it("should be an array of row IDs", () => {
      expect(Array.isArray(SKELETON_ROW_IDS)).toBe(true);
      expect(SKELETON_ROW_IDS).toHaveLength(5);
    });

    it("should have expected row IDs", () => {
      expect(SKELETON_ROW_IDS).toEqual([
        "sk-row-1",
        "sk-row-2",
        "sk-row-3",
        "sk-row-4",
        "sk-row-5",
      ]);
    });
  });

  describe("SKELETON_COL_IDS", () => {
    it("should be an array of column IDs", () => {
      expect(Array.isArray(SKELETON_COL_IDS)).toBe(true);
      expect(SKELETON_COL_IDS).toHaveLength(6);
    });

    it("should have expected column IDs", () => {
      expect(SKELETON_COL_IDS).toEqual([
        "sk-col-1",
        "sk-col-2",
        "sk-col-3",
        "sk-col-4",
        "sk-col-5",
        "sk-col-6",
      ]);
    });
  });

  describe("SKELETON_COL_WIDTHS", () => {
    it("should be an array of column widths", () => {
      expect(Array.isArray(SKELETON_COL_WIDTHS)).toBe(true);
      expect(SKELETON_COL_WIDTHS).toHaveLength(6);
    });

    it("should have expected column widths", () => {
      expect(SKELETON_COL_WIDTHS).toEqual([100, 130, 70, 70, 70, 70]);
    });

    it("should match the length of SKELETON_COL_IDS", () => {
      expect(SKELETON_COL_WIDTHS.length).toBe(SKELETON_COL_IDS.length);
    });
  });

  describe("TYPE_CONFIG", () => {
    it("should be an object with type configurations", () => {
      expect(typeof TYPE_CONFIG).toBe("object");
      expect(Object.keys(TYPE_CONFIG).length).toBeGreaterThan(0);
    });

    it("should have credit configuration", () => {
      expect(TYPE_CONFIG.credit).toEqual({
        bg: "#f0fdf4",
        color: "#059669",
        border: "#bbf7d0",
        label: "Commission",
      });
    });

    it("should have escrow_hold configuration", () => {
      expect(TYPE_CONFIG.escrow_hold).toEqual({
        bg: "#eff6ff",
        color: "#2563eb",
        border: "#bfdbfe",
        label: "Escrow",
      });
    });

    it("should have escrow_release configuration", () => {
      expect(TYPE_CONFIG.escrow_release).toEqual({
        bg: "#f5f3ff",
        color: "#7c3aed",
        border: "#ddd6fe",
        label: "Released",
      });
    });

    it("should have escrow_refund configuration", () => {
      expect(TYPE_CONFIG.escrow_refund).toEqual({
        bg: "#fef2f2",
        color: "#dc2626",
        border: "#fecaca",
        label: "Refund",
      });
    });

    it("should have commission_deduct configuration", () => {
      expect(TYPE_CONFIG.commission_deduct).toEqual({
        bg: "#f0fdf4",
        color: "#059669",
        border: "#bbf7d0",
        label: "Commission",
      });
    });

    it("should have mentor_payout configuration", () => {
      expect(TYPE_CONFIG.mentor_payout).toEqual({
        bg: "#f5f3ff",
        color: "#7c3aed",
        border: "#ddd6fe",
        label: "Received",
      });
    });

    it("should have debit configuration", () => {
      expect(TYPE_CONFIG.debit).toEqual({
        bg: "#fef2f2",
        color: "#dc2626",
        border: "#fecaca",
        label: "Payout",
      });
    });

    it("should have all required properties for each type", () => {
      Object.values(TYPE_CONFIG).forEach((config) => {
        expect(config).toHaveProperty("bg");
        expect(config).toHaveProperty("color");
        expect(config).toHaveProperty("border");
        expect(config).toHaveProperty("label");
        expect(typeof config.bg).toBe("string");
        expect(typeof config.color).toBe("string");
        expect(typeof config.border).toBe("string");
        expect(typeof config.label).toBe("string");
      });
    });
  });

  describe("STATUS_CONFIG", () => {
    it("should be an object with status configurations", () => {
      expect(typeof STATUS_CONFIG).toBe("object");
      expect(Object.keys(STATUS_CONFIG).length).toBeGreaterThan(0);
    });

    it("should have completed configuration", () => {
      expect(STATUS_CONFIG.completed).toEqual({
        color: "#059669",
        dot: "#22c55e",
        label: "COMPLETED",
      });
    });

    it("should have pending configuration", () => {
      expect(STATUS_CONFIG.pending).toEqual({
        color: "#d97706",
        dot: "#f59e0b",
        label: "PENDING",
      });
    });

    it("should have refunded configuration", () => {
      expect(STATUS_CONFIG.refunded).toEqual({
        color: "#dc2626",
        dot: "#ef4444",
        label: "REFUNDED",
      });
    });

    it("should have all required properties for each status", () => {
      Object.values(STATUS_CONFIG).forEach((config) => {
        expect(config).toHaveProperty("color");
        expect(config).toHaveProperty("dot");
        expect(config).toHaveProperty("label");
        expect(typeof config.color).toBe("string");
        expect(typeof config.dot).toBe("string");
        expect(typeof config.label).toBe("string");
      });
    });
  });

  describe("TYPE_FILTERS", () => {
    it("should be an array of filter options", () => {
      expect(Array.isArray(TYPE_FILTERS)).toBe(true);
      expect(TYPE_FILTERS.length).toBeGreaterThan(0);
    });

    it("should have filter objects with key and label properties", () => {
      TYPE_FILTERS.forEach((filter) => {
        expect(filter).toHaveProperty("key");
        expect(filter).toHaveProperty("label");
        expect(typeof filter.key).toBe("string");
        expect(typeof filter.label).toBe("string");
      });
    });

    it("should have All filter as first option", () => {
      expect(TYPE_FILTERS[0]).toEqual({ key: "", label: "All" });
    });

    it("should have expected filter keys", () => {
      const keys = TYPE_FILTERS.map((f) => f.key);
      expect(keys).toContain("");
      expect(keys).toContain("commission_deduct");
      expect(keys).toContain("mentor_payout");
      expect(keys).toContain("debit");
      expect(keys).toContain("escrow_hold");
      expect(keys).toContain("escrow_refund");
    });
  });

  describe("TABLE_COLUMNS", () => {
    it("should be an array of column names", () => {
      expect(Array.isArray(TABLE_COLUMNS)).toBe(true);
      expect(TABLE_COLUMNS.length).toBeGreaterThan(0);
    });

    it("should have expected column names", () => {
      expect(TABLE_COLUMNS).toEqual([
        "TRANSACTION ID",
        "USER",
        "AMOUNT",
        "TYPE",
        "DATE",
        "STATUS",
      ]);
    });

    it("should have all string values", () => {
      TABLE_COLUMNS.forEach((column) => {
        expect(typeof column).toBe("string");
      });
    });
  });
});
