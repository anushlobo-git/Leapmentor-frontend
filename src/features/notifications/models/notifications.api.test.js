/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getNotifications,
  markAllNotificationsRead,
  clearAllNotifications,
  markNotificationRead,
  deleteNotification,
} from "./notifications.api";

// Mock axiosInstance
vi.mock("@lib/axiosInstance", () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("notifications.api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getNotifications", () => {
    it("should call axiosInstance.get with correct endpoint", async () => {
      const mockResponse = { data: [] };
      const axiosInstance = (await import("@lib/axiosInstance")).default;
      axiosInstance.get.mockResolvedValue(mockResponse);

      const result = await getNotifications();

      expect(axiosInstance.get).toHaveBeenCalledWith("/notifications");
      expect(result).toEqual(mockResponse);
    });
  });

  describe("markAllNotificationsRead", () => {
    it("should call axiosInstance.patch with correct endpoint and empty payload", async () => {
      const mockResponse = { data: { success: true } };
      const axiosInstance = (await import("@lib/axiosInstance")).default;
      axiosInstance.patch.mockResolvedValue(mockResponse);

      const result = await markAllNotificationsRead();

      expect(axiosInstance.patch).toHaveBeenCalledWith("/notifications/mark-all-read", {});
      expect(result).toEqual(mockResponse);
    });
  });

  describe("clearAllNotifications", () => {
    it("should call axiosInstance.delete with correct endpoint", async () => {
      const mockResponse = { data: { success: true } };
      const axiosInstance = (await import("@lib/axiosInstance")).default;
      axiosInstance.delete.mockResolvedValue(mockResponse);

      const result = await clearAllNotifications();

      expect(axiosInstance.delete).toHaveBeenCalledWith("/notifications/clear-all");
      expect(result).toEqual(mockResponse);
    });
  });

  describe("markNotificationRead", () => {
    it("should call axiosInstance.patch with correct endpoint and empty payload", async () => {
      const mockResponse = { data: { success: true } };
      const axiosInstance = (await import("@lib/axiosInstance")).default;
      axiosInstance.patch.mockResolvedValue(mockResponse);

      const result = await markNotificationRead("notif123");

      expect(axiosInstance.patch).toHaveBeenCalledWith("/notifications/notif123/read", {});
      expect(result).toEqual(mockResponse);
    });
  });

  describe("deleteNotification", () => {
    it("should call axiosInstance.delete with correct endpoint", async () => {
      const mockResponse = { data: { success: true } };
      const axiosInstance = (await import("@lib/axiosInstance")).default;
      axiosInstance.delete.mockResolvedValue(mockResponse);

      const result = await deleteNotification("notif123");

      expect(axiosInstance.delete).toHaveBeenCalledWith("/notifications/notif123");
      expect(result).toEqual(mockResponse);
    });
  });
});
