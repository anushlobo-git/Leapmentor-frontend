/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import {
  formatFileSize,
  formatDate,
  formatDateSeparator,
  isSameDay,
  getFileType,
  ALLOWED_FILE_TYPES,
  FILE_ICON_STYLES,
  FILE_ICON_LABELS,
  FILE_TYPE_CONFIG,
} from "./notesHelpers";

describe("notesHelpers", () => {
  describe("formatFileSize", () => {
    it("should return dash for null/undefined", () => {
      expect(formatFileSize(null)).toBe("—");
      expect(formatFileSize(undefined)).toBe("—");
      expect(formatFileSize(0)).toBe("—");
    });

    it("should format bytes", () => {
      expect(formatFileSize(500)).toBe("500 B");
      expect(formatFileSize(1023)).toBe("1023 B");
    });

    it("should format kilobytes", () => {
      expect(formatFileSize(1024)).toBe("1.0 KB");
      expect(formatFileSize(2048)).toBe("2.0 KB");
      expect(formatFileSize(1536)).toBe("1.5 KB");
    });

    it("should format megabytes", () => {
      expect(formatFileSize(1024 * 1024)).toBe("1.0 MB");
      expect(formatFileSize(2 * 1024 * 1024)).toBe("2.0 MB");
      expect(formatFileSize(1.5 * 1024 * 1024)).toBe("1.5 MB");
    });
  });

  describe("formatDate", () => {
    it("should return empty string for null/undefined", () => {
      expect(formatDate(null)).toBe("");
      expect(formatDate(undefined)).toBe("");
    });

    it("should format date string", () => {
      const result = formatDate("2024-01-15");
      expect(result).toMatch(/Jan 15, 2024/);
    });
  });

  describe("formatDateSeparator", () => {
    it("should return Today for today's date", () => {
      const today = new Date();
      const result = formatDateSeparator(today.toISOString());
      expect(result).toBe("Today");
    });

    it("should return Yesterday for yesterday's date", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const result = formatDateSeparator(yesterday.toISOString());
      expect(result).toBe("Yesterday");
    });

    it("should return formatted date for older dates", () => {
      const result = formatDateSeparator("2024-01-15");
      expect(result).toMatch(/January 15, 2024/);
    });
  });

  describe("isSameDay", () => {
    it("should return true for same day", () => {
      const date1 = "2024-01-15T10:00:00Z";
      const date2 = "2024-01-15T15:30:00Z";
      expect(isSameDay(date1, date2)).toBe(true);
    });

    it("should return false for different days", () => {
      const date1 = "2024-01-15T10:00:00Z";
      const date2 = "2024-01-16T10:00:00Z";
      expect(isSameDay(date1, date2)).toBe(false);
    });
  });

  describe("getFileType", () => {
    it("should return other for null/undefined", () => {
      expect(getFileType(null)).toBe("other");
      expect(getFileType(undefined)).toBe("other");
    });

    it("should identify PDF files", () => {
      expect(getFileType("document.pdf")).toBe("pdf");
      expect(getFileType("file.PDF")).toBe("pdf");
    });

    it("should identify image files", () => {
      expect(getFileType("photo.jpg")).toBe("image");
      expect(getFileType("photo.jpeg")).toBe("image");
      expect(getFileType("photo.png")).toBe("image");
      expect(getFileType("photo.gif")).toBe("image");
      expect(getFileType("photo.webp")).toBe("image");
    });

    it("should identify document files", () => {
      expect(getFileType("doc.doc")).toBe("doc");
      expect(getFileType("doc.docx")).toBe("doc");
    });

    it("should identify presentation files", () => {
      expect(getFileType("slides.ppt")).toBe("ppt");
      expect(getFileType("slides.pptx")).toBe("ppt");
    });

    it("should identify spreadsheet files", () => {
      expect(getFileType("data.xls")).toBe("excel");
      expect(getFileType("data.xlsx")).toBe("excel");
    });

    it("should identify text files", () => {
      expect(getFileType("notes.txt")).toBe("txt");
    });

    it("should return other for unknown file types", () => {
      expect(getFileType("file.zip")).toBe("other");
      expect(getFileType("file.mp4")).toBe("other");
    });
  });

  describe("ALLOWED_FILE_TYPES", () => {
    it("should contain all expected MIME types", () => {
      expect(ALLOWED_FILE_TYPES).toContain("application/pdf");
      expect(ALLOWED_FILE_TYPES).toContain("image/jpeg");
      expect(ALLOWED_FILE_TYPES).toContain("image/png");
      expect(ALLOWED_FILE_TYPES).toContain("text/plain");
    });
  });

  describe("FILE_ICON_STYLES", () => {
    it("should have styles for all file types", () => {
      expect(FILE_ICON_STYLES.pdf).toBe("bg-red-100 text-red-600");
      expect(FILE_ICON_STYLES.image).toBe("bg-green-100 text-green-600");
      expect(FILE_ICON_STYLES.doc).toBe("bg-blue-100 text-blue-600");
      expect(FILE_ICON_STYLES.ppt).toBe("bg-orange-100 text-orange-600");
      expect(FILE_ICON_STYLES.excel).toBe("bg-emerald-100 text-emerald-600");
      expect(FILE_ICON_STYLES.txt).toBe("bg-slate-100 text-slate-600");
      expect(FILE_ICON_STYLES.other).toBe("bg-violet-100 text-violet-600");
    });
  });

  describe("FILE_ICON_LABELS", () => {
    it("should have labels for all file types", () => {
      expect(FILE_ICON_LABELS.pdf).toBe("PDF");
      expect(FILE_ICON_LABELS.image).toBe("IMG");
      expect(FILE_ICON_LABELS.doc).toBe("DOC");
      expect(FILE_ICON_LABELS.ppt).toBe("PPT");
      expect(FILE_ICON_LABELS.excel).toBe("XLS");
      expect(FILE_ICON_LABELS.txt).toBe("TXT");
      expect(FILE_ICON_LABELS.other).toBe("FILE");
    });
  });

  describe("FILE_TYPE_CONFIG", () => {
    it("should have complete config for all file types", () => {
      expect(FILE_TYPE_CONFIG.pdf).toEqual({
        bg: "bg-red-100",
        border: "border-red-200",
        text: "text-red-600",
        icon: "📕",
        label: "PDF",
      });

      expect(FILE_TYPE_CONFIG.image).toEqual({
        bg: "bg-green-100",
        border: "border-green-200",
        text: "text-green-600",
        icon: "🖼️",
        label: "IMG",
      });

      expect(FILE_TYPE_CONFIG.doc).toEqual({
        bg: "bg-blue-100",
        border: "border-blue-200",
        text: "text-blue-600",
        icon: "📝",
        label: "DOC",
      });

      expect(FILE_TYPE_CONFIG.ppt).toEqual({
        bg: "bg-orange-100",
        border: "border-orange-200",
        text: "text-orange-600",
        icon: "📊",
        label: "PPT",
      });

      expect(FILE_TYPE_CONFIG.excel).toEqual({
        bg: "bg-emerald-100",
        border: "border-emerald-200",
        text: "text-emerald-600",
        icon: "📈",
        label: "XLS",
      });

      expect(FILE_TYPE_CONFIG.txt).toEqual({
        bg: "bg-slate-100",
        border: "border-slate-200",
        text: "text-slate-600",
        icon: "📃",
        label: "TXT",
      });

      expect(FILE_TYPE_CONFIG.other).toEqual({
        bg: "bg-violet-100",
        border: "border-violet-200",
        text: "text-violet-600",
        icon: "📁",
        label: "FILE",
      });
    });
  });
});
