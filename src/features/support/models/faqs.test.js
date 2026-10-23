/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import { mentorFaqs, menteeFaqs } from "./faqs";

describe("faqs", () => {
  describe("mentorFaqs", () => {
    it("should be an array of categories", () => {
      expect(Array.isArray(mentorFaqs)).toBe(true);
      expect(mentorFaqs.length).toBeGreaterThan(0);
    });

    it("should have category structure with category and items", () => {
      mentorFaqs.forEach((category) => {
        expect(category).toHaveProperty("category");
        expect(category).toHaveProperty("items");
        expect(Array.isArray(category.items)).toBe(true);
      });
    });

    it("should have items with q and a properties", () => {
      mentorFaqs.forEach((category) => {
        category.items.forEach((item) => {
          expect(item).toHaveProperty("q");
          expect(item).toHaveProperty("a");
          expect(typeof item.q).toBe("string");
          expect(typeof item.a).toBe("string");
        });
      });
    });

    it("should have expected mentor categories", () => {
      const categories = mentorFaqs.map((c) => c.category);
      expect(categories).toContain("Sessions");
      expect(categories).toContain("Payments & Earnings");
      expect(categories).toContain("Profile & Availability");
      expect(categories).toContain("Technical Issues");
    });

    it("should have non-empty questions and answers", () => {
      mentorFaqs.forEach((category) => {
        category.items.forEach((item) => {
          expect(item.q.length).toBeGreaterThan(0);
          expect(item.a.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe("menteeFaqs", () => {
    it("should be an array of categories", () => {
      expect(Array.isArray(menteeFaqs)).toBe(true);
      expect(menteeFaqs.length).toBeGreaterThan(0);
    });

    it("should have category structure with category and items", () => {
      menteeFaqs.forEach((category) => {
        expect(category).toHaveProperty("category");
        expect(category).toHaveProperty("items");
        expect(Array.isArray(category.items)).toBe(true);
      });
    });

    it("should have items with q and a properties", () => {
      menteeFaqs.forEach((category) => {
        category.items.forEach((item) => {
          expect(item).toHaveProperty("q");
          expect(item).toHaveProperty("a");
          expect(typeof item.q).toBe("string");
          expect(typeof item.a).toBe("string");
        });
      });
    });

    it("should have expected mentee categories", () => {
      const categories = menteeFaqs.map((c) => c.category);
      expect(categories).toContain("Booking");
      expect(categories).toContain("Payments & Refunds");
      expect(categories).toContain("Sessions");
      expect(categories).toContain("Technical Issues");
    });

    it("should have non-empty questions and answers", () => {
      menteeFaqs.forEach((category) => {
        category.items.forEach((item) => {
          expect(item.q.length).toBeGreaterThan(0);
          expect(item.a.length).toBeGreaterThan(0);
        });
      });
    });
  });
});
