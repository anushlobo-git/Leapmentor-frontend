import { renderHook, act } from "@testing-library/react";
import useRequestHistory from "./useRequestHistory";
import axiosInstance from "@lib/axiosInstance";
import logger from "@lib/logger";
import { mapConnectRequest } from "@features/connects/mappers/connectsMapper";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock axiosInstance
vi.mock("@lib/axiosInstance", () => ({
  default: {
    get: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock logger
vi.mock("@lib/logger", () => ({
  default: {
    error: vi.fn(),
  },
}));

// Mock mappers
vi.mock("@features/connects/mappers/connectsMapper", () => ({
  mapConnectRequest: vi.fn((r) => r),
}));

describe("useRequestHistory hook", () => {
  const mockRequests = [
    { _id: "req1", status: "pending" },
    { _id: "req2", status: "accepted" },
    { _id: "req3", status: "ongoing" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    axiosInstance.get.mockResolvedValue({ data: { requests: mockRequests } });
    axiosInstance.delete.mockResolvedValue({ data: { success: true } });
  });

  it("fetches requests on mount and maps results", async () => {
    const { result } = renderHook(() => useRequestHistory());

    expect(result.current.loading).toBe(true);

    await act(async () => {
      await Promise.resolve(); // flush mount microtasks
    });

    expect(axiosInstance.get).toHaveBeenCalledWith(
      "/connect-requests/my-requests",
    );
    expect(mapConnectRequest).toHaveBeenCalled();
    expect(result.current.requests).toEqual(mockRequests);
    expect(result.current.loading).toBe(false);
  });

  it("handles fallback to empty array if response requests is not an array", async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: { requests: null } });

    const { result } = renderHook(() => useRequestHistory());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.requests).toEqual([]);
  });

  it("handles load error during fetching", async () => {
    axiosInstance.get.mockRejectedValueOnce({
      response: { data: { message: "Internal server error" } },
    });

    const { result } = renderHook(() => useRequestHistory());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.error).toBe("Internal server error");
  });

  it("performs deleteRequest action and filters out of lists", async () => {
    const { result } = renderHook(() => useRequestHistory());
    await act(async () => {
      await Promise.resolve();
    });

    // Select req1
    act(() => {
      result.current.setSelected({ _id: "req1" });
    });

    await act(async () => {
      await result.current.deleteRequest("req1");
    });

    expect(axiosInstance.delete).toHaveBeenCalledWith("/connect-requests/req1");
    expect(result.current.requests).toHaveLength(2);
    expect(result.current.selected).toBeNull();
  });

  it("keeps selected if a different request is deleted", async () => {
    const { result } = renderHook(() => useRequestHistory());
    await act(async () => {
      await Promise.resolve();
    });

    // Select req2
    act(() => {
      result.current.setSelected({ _id: "req2" });
    });

    await act(async () => {
      await result.current.deleteRequest("req1");
    });

    expect(result.current.selected).toEqual({ _id: "req2" });
  });

  it("logs error if deleteRequest api call fails", async () => {
    axiosInstance.delete.mockRejectedValueOnce(
      new Error("Database disconnected"),
    );

    const { result } = renderHook(() => useRequestHistory());
    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      await result.current.deleteRequest("req1");
    });

    expect(logger.error).toHaveBeenCalled();
  });

  it("performs updateRequest in place for target element", async () => {
    const { result } = renderHook(() => useRequestHistory());
    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      result.current.setSelected({ _id: "req2", status: "accepted" });
    });

    act(() => {
      result.current.updateRequest("req2", { status: "ongoing" });
    });

    expect(result.current.requests[1].status).toBe("ongoing");
    expect(result.current.selected.status).toBe("ongoing");
  });

  it("filters request list by active tab key", async () => {
    const { result } = renderHook(() => useRequestHistory());
    await act(async () => {
      await Promise.resolve();
    });

    // Tab default is all
    expect(result.current.filtered).toHaveLength(3);

    act(() => {
      result.current.setActiveTab("pending");
    });
    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0]._id).toBe("req1");
  });

  it("provides correct counts for category types", async () => {
    const { result } = renderHook(() => useRequestHistory());
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.counts).toEqual({
      all: 3,
      pending: 1,
      accepted: 1,
      ongoing: 1,
      completed: 0,
      rejected: 0,
      referred: 0,
    });
  });

  it("handles fetching error without response message fallback", async () => {
    axiosInstance.get.mockRejectedValueOnce({}); // no message or response

    const { result } = renderHook(() => useRequestHistory());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.error).toBe("Failed to load requests.");
  });

  it("does not update selected request if selected id does not match", async () => {
    const { result } = renderHook(() => useRequestHistory());
    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      result.current.setSelected({ _id: "other-id", status: "accepted" });
    });

    act(() => {
      result.current.updateRequest("req2", { status: "ongoing" });
    });

    expect(result.current.selected.status).toBe("accepted");
  });

  it("does not update selected request if selected is null", async () => {
    const { result } = renderHook(() => useRequestHistory());
    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      result.current.setSelected(null);
    });

    act(() => {
      result.current.updateRequest("req2", { status: "ongoing" });
    });

    expect(result.current.selected).toBeNull();
  });
});
