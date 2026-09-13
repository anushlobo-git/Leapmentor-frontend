/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  login,
  exchangeLinkedInToken,
  logoutRequest,
} from "./auth.api";

// Mock axiosInstance
vi.mock("@lib/axiosInstance", () => ({
  default: {
    post: vi.fn(),
  },
}));

describe("auth.api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("login", () => {
    it("should call axiosInstance.post with correct endpoint and payload", async () => {
      const mockResponse = { data: { success: true } };
      const axiosInstance = (await import("@lib/axiosInstance")).default;
      axiosInstance.post.mockResolvedValue(mockResponse);

      const result = await login("user@example.com", "password123");

      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/auth/login",
        { email: "user@example.com", password: "password123" }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("exchangeLinkedInToken", () => {
    it("should call axiosInstance.post with correct endpoint and payload", async () => {
      const mockResponse = { data: { success: true } };
      const axiosInstance = (await import("@lib/axiosInstance")).default;
      axiosInstance.post.mockResolvedValue(mockResponse);

      const payload = {
        code: "linkedin_code",
        roles: ["mentor"],
        termsAccepted: true,
      };
      const result = await exchangeLinkedInToken(payload);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/auth/linkedin/token",
        payload
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("logoutRequest", () => {
    it("should call axiosInstance.post with correct endpoint", async () => {
      const mockResponse = { data: { success: true } };
      const axiosInstance = (await import("@lib/axiosInstance")).default;
      axiosInstance.post.mockResolvedValue(mockResponse);

      const result = await logoutRequest();

      expect(axiosInstance.post).toHaveBeenCalledWith("/auth/logout");
      expect(result).toEqual(mockResponse);
    });
  });
});
