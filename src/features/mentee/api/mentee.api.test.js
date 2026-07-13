/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  uploadProfilePicture,
  downloadInvoice,
  searchMentorsBySkill,
  getMyConnectRequests,
  getEscrowWallet,
  getMyLeapRequest,
  createLeapRequest,
  getMentorAvailability,
} from "./mentee.api";

// Mock axiosInstance
vi.mock("@lib/axiosInstance", () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe("mentee.api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("uploadProfilePicture", () => {
    it("should call axiosInstance.post with correct endpoint and config", async () => {
      const mockResponse = { data: { success: true } };
      const axiosInstance = (await import("@lib/axiosInstance")).default;
      axiosInstance.post.mockResolvedValue(mockResponse);

      const formData = new FormData();
      const onUploadProgress = vi.fn();
      const result = await uploadProfilePicture(formData, onUploadProgress);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/upload/profile-picture",
        formData,
        { onUploadProgress }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("downloadInvoice", () => {
    it("should call axiosInstance.get with correct endpoint and responseType", async () => {
      const mockResponse = { data: new Blob() };
      const axiosInstance = (await import("@lib/axiosInstance")).default;
      axiosInstance.get.mockResolvedValue(mockResponse);

      const result = await downloadInvoice("req123");

      expect(axiosInstance.get).toHaveBeenCalledWith(
        "/invoices/req123",
        { responseType: "blob" }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("searchMentorsBySkill", () => {
    it("should call axiosInstance.get with correct endpoint and params", async () => {
      const mockResponse = { data: [] };
      const axiosInstance = (await import("@lib/axiosInstance")).default;
      axiosInstance.get.mockResolvedValue(mockResponse);

      const result = await searchMentorsBySkill("javascript", 4);

      expect(axiosInstance.get).toHaveBeenCalledWith(
        "/mentors/search",
        { params: { skill: "javascript", limit: 4 } }
      );
      expect(result).toEqual(mockResponse);
    });

    it("should use default limit when not provided", async () => {
      const mockResponse = { data: [] };
      const axiosInstance = (await import("@lib/axiosInstance")).default;
      axiosInstance.get.mockResolvedValue(mockResponse);

      const result = await searchMentorsBySkill("javascript");

      expect(axiosInstance.get).toHaveBeenCalledWith(
        "/mentors/search",
        { params: { skill: "javascript", limit: 4 } }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("getMyConnectRequests", () => {
    it("should call axiosInstance.get with correct endpoint", async () => {
      const mockResponse = { data: [] };
      const axiosInstance = (await import("@lib/axiosInstance")).default;
      axiosInstance.get.mockResolvedValue(mockResponse);

      const result = await getMyConnectRequests();

      expect(axiosInstance.get).toHaveBeenCalledWith("/connect-requests/my-requests");
      expect(result).toEqual(mockResponse);
    });
  });

  describe("getEscrowWallet", () => {
    it("should call axiosInstance.get with correct endpoint", async () => {
      const mockResponse = { data: { balance: 100 } };
      const axiosInstance = (await import("@lib/axiosInstance")).default;
      axiosInstance.get.mockResolvedValue(mockResponse);

      const result = await getEscrowWallet();

      expect(axiosInstance.get).toHaveBeenCalledWith("/escrow/wallet");
      expect(result).toEqual(mockResponse);
    });
  });

  describe("getMyLeapRequest", () => {
    it("should call axiosInstance.get with correct endpoint", async () => {
      const mockResponse = { data: null };
      const axiosInstance = (await import("@lib/axiosInstance")).default;
      axiosInstance.get.mockResolvedValue(mockResponse);

      const result = await getMyLeapRequest();

      expect(axiosInstance.get).toHaveBeenCalledWith("/leap-requests/my-request");
      expect(result).toEqual(mockResponse);
    });
  });

  describe("createLeapRequest", () => {
    it("should call axiosInstance.post with correct endpoint and payload", async () => {
      const mockResponse = { data: { success: true } };
      const axiosInstance = (await import("@lib/axiosInstance")).default;
      axiosInstance.post.mockResolvedValue(mockResponse);

      const result = await createLeapRequest("Need more credits");

      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/leap-requests",
        { reason: "Need more credits" }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("getMentorAvailability", () => {
    it("should call axiosInstance.get with correct endpoint and query params", async () => {
      const mockResponse = { data: [] };
      const axiosInstance = (await import("@lib/axiosInstance")).default;
      axiosInstance.get.mockResolvedValue(mockResponse);

      const result = await getMentorAvailability("mentor123", 60);

      expect(axiosInstance.get).toHaveBeenCalledWith(
        "/availability/mentor123/slots?duration=60"
      );
      expect(result).toEqual(mockResponse);
    });
  });
});
