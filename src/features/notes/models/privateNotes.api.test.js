/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createPrivateNote,
  getPrivateNotes,
  updatePrivateNote,
  deletePrivateNote,
} from "./privateNotes.api";

// Mock axiosInstance
vi.mock("@lib/axiosInstance", () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("privateNotes.api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createPrivateNote", () => {
    it("should call axiosInstance.post with correct endpoint and payload", async () => {
      const mockResponse = { data: { success: true } };
      const axiosInstance = (await import("@lib/axiosInstance")).default;
      axiosInstance.post.mockResolvedValue(mockResponse);

      const result = await createPrivateNote("req123", "Test Title", "Test Content");

      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/private-notes",
        { connectRequestId: "req123", title: "Test Title", content: "Test Content" }
      );
      expect(result).toEqual({ success: true });
    });
  });

  describe("getPrivateNotes", () => {
    it("should call axiosInstance.get with correct endpoint", async () => {
      const mockResponse = { data: [] };
      const axiosInstance = (await import("@lib/axiosInstance")).default;
      axiosInstance.get.mockResolvedValue(mockResponse);

      const result = await getPrivateNotes("req123");

      expect(axiosInstance.get).toHaveBeenCalledWith("/private-notes/req123");
      expect(result).toEqual([]);
    });
  });

  describe("updatePrivateNote", () => {
    it("should call axiosInstance.patch with correct endpoint and payload", async () => {
      const mockResponse = { data: { success: true } };
      const axiosInstance = (await import("@lib/axiosInstance")).default;
      axiosInstance.patch.mockResolvedValue(mockResponse);

      const result = await updatePrivateNote("note123", "Updated Title", "Updated Content");

      expect(axiosInstance.patch).toHaveBeenCalledWith(
        "/private-notes/note123",
        { title: "Updated Title", content: "Updated Content" }
      );
      expect(result).toEqual({ success: true });
    });
  });

  describe("deletePrivateNote", () => {
    it("should call axiosInstance.delete with correct endpoint", async () => {
      const mockResponse = { data: { success: true } };
      const axiosInstance = (await import("@lib/axiosInstance")).default;
      axiosInstance.delete.mockResolvedValue(mockResponse);

      const result = await deletePrivateNote("note123");

      expect(axiosInstance.delete).toHaveBeenCalledWith("/private-notes/note123");
      expect(result).toEqual({ success: true });
    });
  });
});
