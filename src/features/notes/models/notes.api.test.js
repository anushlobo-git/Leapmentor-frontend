/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  uploadNote,
  getNotes,
  getPrivateNotes,
  deleteNote,
} from "./notes.api";

// Mock axiosInstance
vi.mock("@lib/axiosInstance", () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("notes.api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("uploadNote", () => {
    it("should call axiosInstance.post with correct endpoint and formData", async () => {
      const mockResponse = { data: { success: true } };
      const axiosInstance = (await import("@lib/axiosInstance")).default;
      axiosInstance.post.mockResolvedValue(mockResponse);

      const file = new File(["content"], "test.txt");
      const result = await uploadNote("req123", file, "Test Note", false);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/notes/upload",
        expect.any(FormData)
      );
      expect(result).toEqual({ success: true });
    });

    it("should append title when provided", async () => {
      const mockResponse = { data: { success: true } };
      const axiosInstance = (await import("@lib/axiosInstance")).default;
      axiosInstance.post.mockResolvedValue(mockResponse);

      const file = new File(["content"], "test.txt");
      await uploadNote("req123", file, "Test Note", false);

      const formData = axiosInstance.post.mock.calls[0][1];
      expect(formData.get("title")).toBe("Test Note");
    });

    it("should not append title when empty", async () => {
      const mockResponse = { data: { success: true } };
      const axiosInstance = (await import("@lib/axiosInstance")).default;
      axiosInstance.post.mockResolvedValue(mockResponse);

      const file = new File(["content"], "test.txt");
      await uploadNote("req123", file, "", false);

      const formData = axiosInstance.post.mock.calls[0][1];
      expect(formData.get("title")).toBeNull();
    });

    it("should append isPrivate when true", async () => {
      const mockResponse = { data: { success: true } };
      const axiosInstance = (await import("@lib/axiosInstance")).default;
      axiosInstance.post.mockResolvedValue(mockResponse);

      const file = new File(["content"], "test.txt");
      await uploadNote("req123", file, "Test Note", true);

      const formData = axiosInstance.post.mock.calls[0][1];
      expect(formData.get("isPrivate")).toBe("true");
    });

    it("should not append isPrivate when false", async () => {
      const mockResponse = { data: { success: true } };
      const axiosInstance = (await import("@lib/axiosInstance")).default;
      axiosInstance.post.mockResolvedValue(mockResponse);

      const file = new File(["content"], "test.txt");
      await uploadNote("req123", file, "Test Note", false);

      const formData = axiosInstance.post.mock.calls[0][1];
      expect(formData.get("isPrivate")).toBeNull();
    });
  });

  describe("getNotes", () => {
    it("should call axiosInstance.get with correct endpoint", async () => {
      const mockResponse = { data: [] };
      const axiosInstance = (await import("@lib/axiosInstance")).default;
      axiosInstance.get.mockResolvedValue(mockResponse);

      const result = await getNotes("req123");

      expect(axiosInstance.get).toHaveBeenCalledWith("/notes/req123");
      expect(result).toEqual([]);
    });
  });

  describe("getPrivateNotes", () => {
    it("should call axiosInstance.get with correct endpoint", async () => {
      const mockResponse = { data: [] };
      const axiosInstance = (await import("@lib/axiosInstance")).default;
      axiosInstance.get.mockResolvedValue(mockResponse);

      const result = await getPrivateNotes("req123");

      expect(axiosInstance.get).toHaveBeenCalledWith("/notes/req123/private");
      expect(result).toEqual([]);
    });
  });

  describe("deleteNote", () => {
    it("should call axiosInstance.delete with correct endpoint", async () => {
      const mockResponse = { data: { success: true } };
      const axiosInstance = (await import("@lib/axiosInstance")).default;
      axiosInstance.delete.mockResolvedValue(mockResponse);

      const result = await deleteNote("note123");

      expect(axiosInstance.delete).toHaveBeenCalledWith("/notes/note123");
      expect(result).toEqual({ success: true });
    });
  });
});
