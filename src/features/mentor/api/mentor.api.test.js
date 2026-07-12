/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  uploadVerificationDocuments,
  uploadMentorProfilePicture,
  getIncomingRequests,
  respondToRequest,
  getSimilarMentors,
  referRequest,
  getMentorEarnings,
  getGoogleCalendarAuthUrl,
  disconnectGoogleCalendar,
  getGoogleCalendarBusySlots,
  getGoogleCalendarEvents,
} from "./mentor.api";

// Mock axiosInstance
vi.mock("@lib/axiosInstance", () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

describe("mentor.api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("uploadVerificationDocuments", () => {
    it("should call axiosInstance.post with correct endpoint and config", async () => {
      const mockResponse = { data: { success: true } };
      const axiosInstance = (await import("@lib/axiosInstance")).default;
      axiosInstance.post.mockResolvedValue(mockResponse);

      const formData = new FormData();
      const onUploadProgress = vi.fn();
      const result = await uploadVerificationDocuments(formData, onUploadProgress);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/upload/verification-documents",
        formData,
        { onUploadProgress }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("uploadMentorProfilePicture", () => {
    it("should call axiosInstance.post with correct endpoint and config", async () => {
      const mockResponse = { data: { success: true } };
      const axiosInstance = (await import("@lib/axiosInstance")).default;
      axiosInstance.post.mockResolvedValue(mockResponse);

      const formData = new FormData();
      const onUploadProgress = vi.fn();
      const result = await uploadMentorProfilePicture(formData, onUploadProgress);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/upload/profile-picture",
        formData,
        { onUploadProgress }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("getIncomingRequests", () => {
    it("should call axiosInstance.get with correct endpoint", async () => {
      const mockResponse = { data: [] };
      const axiosInstance = (await import("@lib/axiosInstance")).default;
      axiosInstance.get.mockResolvedValue(mockResponse);

      const result = await getIncomingRequests();

      expect(axiosInstance.get).toHaveBeenCalledWith("/connect-requests/incoming");
      expect(result).toEqual(mockResponse);
    });
  });

  describe("respondToRequest", () => {
    it("should call axiosInstance.patch with correct endpoint and payload", async () => {
      const mockResponse = { data: { success: true } };
      const axiosInstance = (await import("@lib/axiosInstance")).default;
      axiosInstance.patch.mockResolvedValue(mockResponse);

      const body = { status: "accepted" };
      const result = await respondToRequest("req123", body);

      expect(axiosInstance.patch).toHaveBeenCalledWith(
        "/connect-requests/req123",
        body
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("getSimilarMentors", () => {
    it("should call axiosInstance.get with correct endpoint", async () => {
      const mockResponse = { data: [] };
      const axiosInstance = (await import("@lib/axiosInstance")).default;
      axiosInstance.get.mockResolvedValue(mockResponse);

      const result = await getSimilarMentors("req123");

      expect(axiosInstance.get).toHaveBeenCalledWith(
        "/connect-requests/req123/similar-mentors"
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("referRequest", () => {
    it("should call axiosInstance.patch with correct endpoint and payload", async () => {
      const mockResponse = { data: { success: true } };
      const axiosInstance = (await import("@lib/axiosInstance")).default;
      axiosInstance.patch.mockResolvedValue(mockResponse);

      const result = await referRequest("req123", "mentor456");

      expect(axiosInstance.patch).toHaveBeenCalledWith(
        "/connect-requests/req123/refer",
        { referToMentorId: "mentor456" }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("getMentorEarnings", () => {
    it("should call axiosInstance.get with correct endpoint", async () => {
      const mockResponse = { data: { total: 1000 } };
      const axiosInstance = (await import("@lib/axiosInstance")).default;
      axiosInstance.get.mockResolvedValue(mockResponse);

      const result = await getMentorEarnings();

      expect(axiosInstance.get).toHaveBeenCalledWith("/mentor/earnings");
      expect(result).toEqual(mockResponse);
    });
  });

  describe("google calendar integration", () => {
    describe("getGoogleCalendarAuthUrl", () => {
      it("should call axiosInstance.get with correct endpoint", async () => {
        const mockResponse = { data: { authUrl: "https://example.com" } };
        const axiosInstance = (await import("@lib/axiosInstance")).default;
        axiosInstance.get.mockResolvedValue(mockResponse);

        const result = await getGoogleCalendarAuthUrl();

        expect(axiosInstance.get).toHaveBeenCalledWith("/google-calendar/auth-url");
        expect(result).toEqual(mockResponse);
      });
    });

    describe("disconnectGoogleCalendar", () => {
      it("should call axiosInstance.post with correct endpoint", async () => {
        const mockResponse = { data: { success: true } };
        const axiosInstance = (await import("@lib/axiosInstance")).default;
        axiosInstance.post.mockResolvedValue(mockResponse);

        const result = await disconnectGoogleCalendar();

        expect(axiosInstance.post).toHaveBeenCalledWith("/google-calendar/disconnect");
        expect(result).toEqual(mockResponse);
      });
    });

    describe("getGoogleCalendarBusySlots", () => {
      it("should call axiosInstance.get with correct endpoint and params", async () => {
        const mockResponse = { data: [] };
        const axiosInstance = (await import("@lib/axiosInstance")).default;
        axiosInstance.get.mockResolvedValue(mockResponse);

        const params = { start: "2024-01-01", end: "2024-01-31" };
        const result = await getGoogleCalendarBusySlots(params);

        expect(axiosInstance.get).toHaveBeenCalledWith(
          "/google-calendar/busy",
          { params }
        );
        expect(result).toEqual(mockResponse);
      });
    });

    describe("getGoogleCalendarEvents", () => {
      it("should call axiosInstance.get with correct endpoint and params", async () => {
        const mockResponse = { data: [] };
        const axiosInstance = (await import("@lib/axiosInstance")).default;
        axiosInstance.get.mockResolvedValue(mockResponse);

        const params = { start: "2024-01-01", end: "2024-01-31" };
        const result = await getGoogleCalendarEvents(params);

        expect(axiosInstance.get).toHaveBeenCalledWith(
          "/google-calendar/events",
          { params }
        );
        expect(result).toEqual(mockResponse);
      });
    });
  });
});
