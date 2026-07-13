import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useConnectRequest from "./useConnectRequest";
import axiosInstance from "@lib/axiosInstance";

// ── Mock Axios Instance Module ──────────────────────────────────────────────
vi.mock("@lib/axiosInstance", () => ({
  default: {
    post: vi.fn(),
  },
}));

describe("useConnectRequest", () => {
  const mockPayload = {
    mentorId: "mentor-123",
    message: "Hello Mentor!",
    selectedSlots: ["2026-07-15T10:00:00Z"],
    sessionRate: 50,
    sessionCount: 2,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Initial State Verification ─────────────────────────────────────────────
  it("should initialize with pristine default state values", () => {
    const { result } = renderHook(() => useConnectRequest());

    expect(result.current.sending).toBe(false);
    expect(result.current.success).toBe(false);
    expect(result.current.error).toBe("");
  });

  // ── Validation Branches Coverage ───────────────────────────────────────────
  it("should fail validation and set error when selectedSlots parameter is missing", async () => {
    const { result } = renderHook(() => useConnectRequest());
    let successResponse;

    await act(async () => {
      successResponse = await result.current.sendRequest({
        ...mockPayload,
        selectedSlots: undefined,
      });
    });

    expect(successResponse).toBe(false);
    expect(result.current.error).toBe(
      "Please select at least one available slot before sending.",
    );
    expect(axiosInstance.post).not.toHaveBeenCalled();
  });

  it("should fail validation and set error when selectedSlots parameter is empty", async () => {
    const { result } = renderHook(() => useConnectRequest());
    let successResponse;

    await act(async () => {
      successResponse = await result.current.sendRequest({
        ...mockPayload,
        selectedSlots: [],
      });
    });

    expect(successResponse).toBe(false);
    expect(result.current.error).toBe(
      "Please select at least one available slot before sending.",
    );
    expect(axiosInstance.post).not.toHaveBeenCalled();
  });

  // ── Successful Execution Pipeline ─────────────────────────────────────────
  it("should post data successfully and cycle state attributes correctly", async () => {
    axiosInstance.post.mockResolvedValueOnce({ data: { success: true } });
    const { result } = renderHook(() => useConnectRequest());
    let successResponse;

    await act(async () => {
      successResponse = await result.current.sendRequest(mockPayload);
    });

    expect(successResponse).toBe(true);
    expect(result.current.sending).toBe(false);
    expect(result.current.success).toBe(true);
    expect(result.current.error).toBe("");
    expect(axiosInstance.post).toHaveBeenCalledWith(
      "/connect-requests",
      mockPayload,
    );
  });

  // ── Error Boundary Branches Coverage ────────────────────────────────────────
  it("should handle custom backend api error responses smoothly", async () => {
    const mockApiError = {
      response: {
        data: {
          message: "Wallet balance insufficient.",
        },
      },
    };
    axiosInstance.post.mockRejectedValueOnce(mockApiError);
    const { result } = renderHook(() => useConnectRequest());
    let successResponse;

    await act(async () => {
      successResponse = await result.current.sendRequest(mockPayload);
    });

    expect(successResponse).toBe(false);
    expect(result.current.sending).toBe(false);
    expect(result.current.success).toBe(false);
    expect(result.current.error).toBe("Wallet balance insufficient.");
  });

  it("should handle structural client execution throw messages gracefully", async () => {
    const mockClientError = new Error("Local operational blowout");
    axiosInstance.post.mockRejectedValueOnce(mockClientError);
    const { result } = renderHook(() => useConnectRequest());
    let successResponse;

    await act(async () => {
      successResponse = await result.current.sendRequest(mockPayload);
    });

    expect(successResponse).toBe(false);
    expect(result.current.error).toBe("Local operational blowout");
  });

  it("should fall back to fallback message string when error object details are empty", async () => {
    axiosInstance.post.mockRejectedValueOnce({});
    const { result } = renderHook(() => useConnectRequest());
    let successResponse;

    await act(async () => {
      successResponse = await result.current.sendRequest(mockPayload);
    });

    expect(successResponse).toBe(false);
    expect(result.current.error).toBe("Failed to send request.");
  });

  // ── Synchronous Concurrent Call Interceptor Guard Coverage ──────────────────
  it("should block synchronous concurrent runtime executions via internal in-flight reference guards", async () => {
    let resolvePromise;
    const delayedPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    axiosInstance.post.mockReturnValueOnce(delayedPromise);

    const { result } = renderHook(() => useConnectRequest());
    let callOneResponse;
    let callTwoResponse;

    await act(async () => {
      // Trigger first execution block to lock reference guards
      const p1 = result.current.sendRequest(mockPayload).then((res) => {
        callOneResponse = res;
      });

      // Trigger instantaneous concurrent call during lock phase
      callTwoResponse = await result.current.sendRequest(mockPayload);

      // Resolve locked promise payload to complete the hook loop lifecycle
      resolvePromise({ data: { success: true } });
      await p1;
    });

    expect(callTwoResponse).toBe(false); // blocked cleanly by ref guard
    expect(callOneResponse).toBe(true); // resolves properly
  });

  // ── State Reset Functional Actions Coverage ───────────────────────────────
  it("should wipe structural states completely upon invoking reset handler routines", async () => {
    axiosInstance.post.mockResolvedValueOnce({ data: { success: true } });
    const { result } = renderHook(() => useConnectRequest());

    await act(async () => {
      await result.current.sendRequest(mockPayload);
    });

    expect(result.current.success).toBe(true);

    act(() => {
      result.current.reset();
    });

    expect(result.current.sending).toBe(false);
    expect(result.current.success).toBe(false);
    expect(result.current.error).toBe("");
  });
});
