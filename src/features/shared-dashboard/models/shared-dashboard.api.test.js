/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getConnectDetail,
} from "./shared-dashboard.api";

// Mock axiosInstance
vi.mock("@lib/axiosInstance", () => ({
  default: {
    get: vi.fn(),
  },
}));

describe("shared-dashboard.api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getConnectDetail", () => {
    it("should call axiosInstance.get with correct endpoint", async () => {
      const mockResponse = { data: { success: true } };
      const axiosInstance = (await import("@lib/axiosInstance")).default;
      axiosInstance.get.mockResolvedValue(mockResponse);

      const result = await getConnectDetail("req123");

      expect(axiosInstance.get).toHaveBeenCalledWith("/connect-requests/req123/detail");
      expect(result).toEqual(mockResponse);
    });
  });
});
