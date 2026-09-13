/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getMentorAvailabilityForConnect,
} from "./sessions.api";

// Mock axiosInstance
vi.mock("@lib/axiosInstance", () => ({
  default: {
    get: vi.fn(),
  },
}));

describe("sessions.api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getMentorAvailabilityForConnect", () => {
    it("should call axiosInstance.get with correct endpoint and query params", async () => {
      const mockResponse = { data: [] };
      const axiosInstance = (await import("@lib/axiosInstance")).default;
      axiosInstance.get.mockResolvedValue(mockResponse);

      const result = await getMentorAvailabilityForConnect("req123", 60);

      expect(axiosInstance.get).toHaveBeenCalledWith("/sessions/req123/mentor-availability?duration=60");
      expect(result).toEqual(mockResponse);
    });
  });
});
