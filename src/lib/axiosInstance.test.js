import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, waitFor } from "@testing-library/react";

// ── 1. Hoist Mock Initialization to Avoid Reference Execution Errors ─────
const { mockAxiosInstance } = vi.hoisted(() => {
  const mock = vi.fn();
  mock.interceptors = {
    request: {
      use: vi.fn((fulfilled, rejected) => {
        mock.requestFulfilled = fulfilled;
        mock.requestRejected = rejected;
      }),
    },
    response: {
      use: vi.fn((fulfilled, rejected) => {
        mock.responseFulfilled = fulfilled;
        mock.responseRejected = rejected;
      }),
    },
  };
  mock.post = vi.fn();
  mock.defaults = { headers: {} };
  return { mockAxiosInstance: mock };
});

vi.mock("axios", () => ({
  default: {
    create: () => mockAxiosInstance,
  },
}));

// Mock dynamic import actions from Auth Slice cleanly
const mockSetUser = vi.fn((payload) => ({ type: "auth/setUser", payload }));
const mockLogout = vi.fn(() => ({ type: "auth/logout" }));
vi.mock("@features/auth/store/authSlice", () => ({
  setUser: mockSetUser,
  logout: mockLogout,
}));

// Mock external helper modules
vi.mock("uuid", () => ({
  v4: () => "mocked-correlation-uuid-1111",
}));

vi.mock("@lib/logger", () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

vi.mock("@sentry/react", () => ({
  captureException: vi.fn(),
}));

vi.mock("@lib/cookies", () => ({
  clearAuthRole: vi.fn(),
}));

vi.mock("@lib/apiResponse", () => ({
  unwrapApiResponse: vi.fn((data) => ({ ...data, unwrapped: true })),
}));

vi.mock("@lib/httpStatus", () => ({
  HTTP_STATUS: {
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
  },
  isServerError: vi.fn(),
  isRateLimited: vi.fn(),
}));

// Import target under test after declaring global hoisted module mocks
import axiosInstance, { injectStore } from "./axiosInstance";
import logger from "@lib/logger";
import { toast } from "sonner";
import * as Sentry from "@sentry/react";
import { clearAuthRole } from "@lib/cookies";
import { unwrapApiResponse } from "@lib/apiResponse";
import { isServerError, isRateLimited } from "@lib/httpStatus";

describe("Axios Interceptors Instance Engine", () => {
  let mockStore;
  const originalLocation = globalThis.location;

  beforeEach(() => {
    vi.clearAllMocks();

    // Safely isolate global location mutations
    delete globalThis.location;
    globalThis.location = { href: "" };

    mockStore = {
      getState: vi.fn(() => ({
        auth: {
          accessToken: "initial-token-123",
          user: { id: "user-99", name: "Bruce Wayne" },
        },
      })),
      dispatch: vi.fn(),
    };
    injectStore(mockStore);
  });

  afterEach(() => {
    globalThis.location = originalLocation;
  });

  // ── Request Interceptor Metrics Suite ────────────────────────────────────
  describe("Request Interceptor Path Execution", () => {
    it("should append bearer tokens and correlation id metadata successfully", () => {
      const initialConfig = { headers: {} };
      const finalizedConfig = mockAxiosInstance.requestFulfilled(initialConfig);

      expect(finalizedConfig.headers["Authorization"]).toBe(
        "Bearer initial-token-123",
      );
      expect(finalizedConfig.headers["X-Correlation-ID"]).toBe(
        "mocked-correlation-uuid-1111",
      );
      expect(finalizedConfig.metadata.correlationId).toBe(
        "mocked-correlation-uuid-1111",
      );
      expect(finalizedConfig.metadata.startTime).toBeDefined();
      expect(logger.info).toHaveBeenCalledWith(
        "API Request",
        expect.any(Object),
      );
    });

    it("should proceed without authorization headers if access tokens are missing from state", () => {
      mockStore.getState.mockReturnValueOnce({ auth: { accessToken: null } });
      const initialConfig = { headers: {} };
      const finalizedConfig = mockAxiosInstance.requestFulfilled(initialConfig);

      expect(finalizedConfig.headers["Authorization"]).toBeUndefined();
    });

    it("should catch and log request configuration failure rejections natively", () => {
      const mockError = new Error("Config composition mapping failure");
      expect(() => mockAxiosInstance.requestRejected(mockError)).toThrowError(
        mockError,
      );
      expect(logger.error).toHaveBeenCalledWith("Request setup failed", {
        error: mockError.message,
      });
    });
  });

  // ── Response Interceptor Success Metrics Suite ───────────────────────────
  describe("Response Interceptor Fulfilled Success Paths", () => {
    it("should invoke unwrap algorithms on data payload objects that aren't binary Blobs", () => {
      const mockResponse = {
        data: { payload: "raw-server-data" },
        headers: { "content-length": "45" },
        config: {
          url: "/metrics",
          metadata: { correlationId: "id-1", startTime: Date.now() - 10 },
        },
        status: 200,
      };

      const result = mockAxiosInstance.responseFulfilled(mockResponse);

      // Pass the explicit snapshot form literal to bypass the inline reference mutation evaluation glitch
      expect(unwrapApiResponse).toHaveBeenCalledWith({
        payload: "raw-server-data",
      });
      expect(result.data.unwrapped).toBe(true);
      expect(logger.info).toHaveBeenCalledWith(
        "API Response",
        expect.any(Object),
      );
    });

    it("should bypass unwrapping workflows entirely if data structure is a standard binary Blob resource", () => {
      const blobInstance = new Blob(["content"], { type: "application/pdf" });
      const mockResponse = {
        data: blobInstance,
        headers: {},
        config: { url: "/download", metadata: {} },
        status: 200,
      };

      const result = mockAxiosInstance.responseFulfilled(mockResponse);

      expect(unwrapApiResponse).not.toHaveBeenCalled();
      expect(result.data).toBe(blobInstance);
    });
  });

  // ── Response Interceptor Failure & Silent Refresh Retries Suite ──────────
  describe("Response Interceptor Rejections & Token Recovery Flows", () => {
    it("should toast and logs failure exceptions instantly when network layer timeouts trigger", async () => {
      const timeoutError = {
        code: "ECONNABORTED",
        message: "timeout exceeded",
        config: { url: "/slow-endpoint", metadata: {} },
      };

      await expect(
        mockAxiosInstance.responseRejected(timeoutError),
      ).rejects.toEqual(timeoutError);
      expect(logger.error).toHaveBeenCalledWith(
        "API Request Timeout",
        expect.any(Object),
      );
      expect(toast.error).toHaveBeenCalledWith(
        "This is taking longer than expected. Please try again.",
      );
    });

    it("should route structural network connectivity crashes cleanly without throwing timeout toasts", async () => {
      const genericNetworkError = {
        message: "Network Error connection reset",
        config: { url: "/unreachable", metadata: {} },
      };

      await expect(
        mockAxiosInstance.responseRejected(genericNetworkError),
      ).rejects.toEqual(genericNetworkError);
      expect(logger.error).toHaveBeenCalledWith(
        "API Network Failure — Server unreachable or CORS rejection",
        expect.any(Object),
      );
      expect(toast.error).not.toHaveBeenCalled();
    });

    it("should coordinate parallel 401 streams through a locking queue to execute a single token refresh call", async () => {
      let triggerRefreshPromiseResolve;
      const delayedRefreshPromise = new Promise((res) => {
        triggerRefreshPromiseResolve = res;
      });

      mockAxiosInstance.post.mockReturnValueOnce(delayedRefreshPromise);
      mockAxiosInstance.mockResolvedValue({ data: "successful-retry-payload" });

      const errRequest1 = {
        response: { status: 401 },
        config: { url: "/profile", headers: {}, metadata: {} },
      };
      const errRequest2 = {
        response: { status: 401 },
        config: { url: "/dashboard-stats", headers: {}, metadata: {} },
      };

      const retryPromise1 = mockAxiosInstance.responseRejected(errRequest1);
      const retryPromise2 = mockAxiosInstance.responseRejected(errRequest2);

      // Use a DOM testing utility variant to allow asynchronous microtask import ticks to flush cleanly
      await waitFor(() =>
        expect(mockAxiosInstance.post).toHaveBeenCalledTimes(1),
      );
      expect(mockAxiosInstance.post).toHaveBeenCalledWith("/auth/refresh");

      await act(async () => {
        triggerRefreshPromiseResolve({
          data: { accessToken: "newly-minted-token-xyz" },
        });
      });

      const finalResponse1 = await retryPromise1;
      const finalResponse2 = await retryPromise2;

      expect(mockStore.dispatch).toHaveBeenCalledWith(
        mockSetUser({
          user: { id: "user-99", name: "Bruce Wayne" },
          accessToken: "newly-minted-token-xyz",
        }),
      );
      expect(finalResponse1.data).toBe("successful-retry-payload");
      expect(finalResponse2.data).toBe("successful-retry-payload");
    });

    it("should flush authentication records and bounce sessions to login paths if silent refresh endpoints collapse", async () => {
      mockAxiosInstance.post.mockRejectedValueOnce(
        new Error("Refresh token expired on database cluster"),
      );

      const authError = {
        response: { status: 401 },
        config: { url: "/sensitive-profile", headers: {}, metadata: {} },
      };

      const rejectionPromise = mockAxiosInstance.responseRejected(authError);

      await expect(rejectionPromise).rejects.toThrow();

      expect(mockStore.dispatch).toHaveBeenCalledWith(mockLogout());
      expect(clearAuthRole).toHaveBeenCalled();
      expect(globalThis.location.href).toBe("/login");
    });

    it("should immediately log out and redirect users if forbidden response text includes a blocked clause", async () => {
      const blockedUserError = {
        response: {
          status: 403,
          data: {
            message:
              "This user profile has been permanently blocked by the system administration.",
          },
        },
        config: { url: "/feed", metadata: {} },
      };

      await expect(
        mockAxiosInstance.responseRejected(blockedUserError),
      ).rejects.toEqual(blockedUserError);

      expect(mockStore.dispatch).toHaveBeenCalledWith(mockLogout());
      expect(clearAuthRole).toHaveBeenCalled();
      expect(globalThis.location.href).toBe("/login?reason=blocked");
    });

    it("should push warnings to logs and toast throttling warnings when rate limit indicators match true", async () => {
      vi.mocked(isRateLimited).mockReturnValueOnce(true);

      const rateLimitError = {
        response: { status: 429 },
        config: { url: "/search-query", metadata: {} },
      };

      await expect(
        mockAxiosInstance.responseRejected(rateLimitError),
      ).rejects.toEqual(rateLimitError);

      expect(logger.warn).toHaveBeenCalledWith(
        "API rate limit hit",
        expect.any(Object),
      );
      expect(toast.error).toHaveBeenCalledWith(
        "You're making requests too quickly. Please wait a moment and try again.",
      );
    });

    it("should capture runtime server snapshots via Sentry when encountering standard 5xx status codes", async () => {
      vi.mocked(isServerError).mockReturnValueOnce(true);

      const internalServerError = {
        response: {
          status: 500,
          data: { message: "Internal Database Connection Timeout Exception" },
        },
        config: { url: "/save-progress", metadata: {} },
      };

      await expect(
        mockAxiosInstance.responseRejected(internalServerError),
      ).rejects.toEqual(internalServerError);

      expect(Sentry.captureException).toHaveBeenCalledWith(
        internalServerError,
        expect.any(Object),
      );
      expect(toast.error).toHaveBeenCalledWith(
        "Something went wrong. Please try again.",
      );
    });

    it("should fall through silently to re-throwing standard client validations glitches like 404 or 422", async () => {
      const clientValidationError = {
        response: {
          status: 422,
          data: {
            message: "Invalid payload parameters schema rule validation failed",
          },
        },
        config: { url: "/submit-form", metadata: {} },
      };

      await expect(
        mockAxiosInstance.responseRejected(clientValidationError),
      ).rejects.toEqual(clientValidationError);
      expect(logger.warn).toHaveBeenCalledWith(
        "API Client Validation Error",
        expect.any(Object),
      );
    });
  });
});
