import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useOngoingConnects from "./useOngoingConnects";
import axiosInstance from "@lib/axiosInstance";
import { mapConnectRequest } from "@features/connects/mappers/connectsMapper";

// Mock external axios instance and data mappers
vi.mock("@lib/axiosInstance", () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock("@features/connects/mappers/connectsMapper", () => ({
  mapConnectRequest: vi.fn((item) => item),
}));

describe("useOngoingConnects", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch and sort connections into ongoing and completed buckets on mount", async () => {
    const mockApiResponse = {
      data: {
        connects: [
          { id: "1", status: "ongoing", title: "Mentorship A" },
          { id: "2", status: "completed", title: "Mentorship B" },
          { id: "3", status: "ongoing", title: "Mentorship C" },
        ],
      },
    };

    axiosInstance.get.mockResolvedValueOnce(mockApiResponse);

    let hookResult;
    await act(async () => {
      const { result } = renderHook(() => useOngoingConnects());
      hookResult = result;
    });

    expect(axiosInstance.get).toHaveBeenCalledTimes(1);
    expect(axiosInstance.get).toHaveBeenCalledWith("/connect-requests/ongoing");
    expect(mapConnectRequest).toHaveBeenCalledTimes(3);

    expect(hookResult.current.loading).toBe(false);
    expect(hookResult.current.error).toBeNull();

    // Verify segregation filters are working cleanly
    expect(hookResult.current.ongoing).toHaveLength(2);
    expect(hookResult.current.ongoing[0].id).toBe("1");
    expect(hookResult.current.ongoing[1].id).toBe("3");

    expect(hookResult.current.completed).toHaveLength(1);
    expect(hookResult.current.completed[0].id).toBe("2");

    // Check backward compatibility field mappings
    expect(hookResult.current.connects).toEqual(hookResult.current.ongoing);
  });

  it("should fallback cleanly to empty arrays when the API payload is missing or malformed", async () => {
    const mockApiResponse = { data: { connects: null } };
    axiosInstance.get.mockResolvedValueOnce(mockApiResponse);

    let hookResult;
    await act(async () => {
      const { result } = renderHook(() => useOngoingConnects());
      hookResult = result;
    });

    expect(hookResult.current.loading).toBe(false);
    expect(hookResult.current.ongoing).toEqual([]);
    expect(hookResult.current.completed).toEqual([]);
    expect(mapConnectRequest).not.toHaveBeenCalled();
  });

  it("should capture and display custom error messages returned directly from server responses", async () => {
    const mockError = {
      response: {
        data: {
          message: "Unauthorized token verification exception.",
        },
      },
    };
    axiosInstance.get.mockRejectedValueOnce(mockError);

    let hookResult;
    await act(async () => {
      const { result } = renderHook(() => useOngoingConnects());
      hookResult = result;
    });

    expect(hookResult.current.loading).toBe(false);
    expect(hookResult.current.error).toBe(
      "Unauthorized token verification exception.",
    );
    expect(hookResult.current.ongoing).toEqual([]);
  });

  it("should fallback to generic fallback text when network errors occur without explicit messages", async () => {
    axiosInstance.get.mockRejectedValueOnce(new Error("Network Failure"));

    let hookResult;
    await act(async () => {
      const { result } = renderHook(() => useOngoingConnects());
      hookResult = result;
    });

    expect(hookResult.current.loading).toBe(false);
    expect(hookResult.current.error).toBe("Failed to load connects.");
  });

  it("should re-fetch active connections and reset status variables when refetch is manually triggered", async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: { connects: [] } });

    let hookResult;
    await act(async () => {
      const { result } = renderHook(() => useOngoingConnects());
      hookResult = result;
    });

    // Setup second response call matrix configuration
    axiosInstance.get.mockResolvedValueOnce({
      data: { connects: [{ id: "10", status: "ongoing" }] },
    });

    await act(async () => {
      await hookResult.current.refetch();
    });

    expect(axiosInstance.get).toHaveBeenCalledTimes(2);
    expect(hookResult.current.ongoing).toHaveLength(1);
    expect(hookResult.current.ongoing[0].id).toBe("10");
  });
});
