import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useOngoingConnects from "./useOngoingConnects";
import { getOngoingConnects } from "@features/connects/models/connects.api";
import { mapConnectRequest } from "@features/connects/models/connectsMapper";

// Mock external axios instance and data mappers
vi.mock("@features/connects/models/connects.api", () => ({
  getOngoingConnects: vi.fn(),
}));

vi.mock("@features/connects/models/connectsMapper", () => ({
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

    getOngoingConnects.mockResolvedValueOnce(mockApiResponse);

    let hookResult;
    await act(async () => {
      const { result } = renderHook(() => useOngoingConnects());
      hookResult = result;
    });

    expect(getOngoingConnects).toHaveBeenCalledTimes(1);
    expect(getOngoingConnects).toHaveBeenCalledWith();
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
    getOngoingConnects.mockResolvedValueOnce(mockApiResponse);

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
    getOngoingConnects.mockRejectedValueOnce(mockError);

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
    getOngoingConnects.mockRejectedValueOnce(new Error("Network Failure"));

    let hookResult;
    await act(async () => {
      const { result } = renderHook(() => useOngoingConnects());
      hookResult = result;
    });

    expect(hookResult.current.loading).toBe(false);
    expect(hookResult.current.error).toBe("Failed to load connects.");
  });

  it("should re-fetch active connections and reset status variables when refetch is manually triggered", async () => {
    getOngoingConnects.mockResolvedValueOnce({ data: { connects: [] } });

    let hookResult;
    await act(async () => {
      const { result } = renderHook(() => useOngoingConnects());
      hookResult = result;
    });

    // Setup second response call matrix configuration
    getOngoingConnects.mockResolvedValueOnce({
      data: { connects: [{ id: "10", status: "ongoing" }] },
    });

    await act(async () => {
      await hookResult.current.refetch();
    });

    expect(getOngoingConnects).toHaveBeenCalledTimes(2);
    expect(hookResult.current.ongoing).toHaveLength(1);
    expect(hookResult.current.ongoing[0].id).toBe("10");
  });
});
