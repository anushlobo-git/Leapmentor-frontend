import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, waitFor } from "@testing-library/react";

// ── 1. Hoist Mock Initialization to Avoid Reference Execution Errors ─────
const { mockAdminAxiosInstance } = vi.hoisted(() => {
  const mock = vi.fn(() => Promise.resolve({ data: "mock-retry-payload" }));
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
  return { mockAdminAxiosInstance: mock };
});

vi.mock("axios", () => ({
  default: {
    create: () => mockAdminAxiosInstance,
  },
}));

// Mock supporting utility modules
vi.mock("uuid", () => ({
  v4: () => "mocked-admin-correlation-uuid",
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

vi.mock("@lib/apiResponse", () => ({
  unwrapApiResponse: vi.fn((data) => ({ ...data, unwrapped: true })),
}));

vi.mock("@lib/httpStatus", () => ({
  HTTP_STATUS: {
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
  },
  isServerError: vi.fn(),
}));

// Import target module under test after hoisting declarations
import adminAxiosInstance from "./adminAxiosInstance";
import logger from "@lib/logger";
import { toast } from "sonner";
import * as Sentry from "@sentry/react";
import { unwrapApiResponse } from "@lib/apiResponse";
import { isServerError } from "@lib/httpStatus";

describe("Admin Axios Interceptors Instance Engine", () => {
  const originalLocation = globalThis.location;

  beforeEach(() => {
    vi.clearAllMocks();

    // Insulate window location variables across mutable runtime testing frames
    delete globalThis.location;
    globalThis.location = { href: "" };
  });

  afterEach(() => {
    globalThis.location = originalLocation;
  });

  // ── Request Interceptor Metrics Suite ────────────────────────────────────
  describe("Request Interceptor Isolation Paths", () => {
    it("should inject X-Correlation-ID and capture trace metadata properties", () => {
      const initialConfig = { headers: {} };
      const finalizedConfig =
        mockAdminAxiosInstance.requestFulfilled(initialConfig);

      expect(finalizedConfig.headers["X-Correlation-ID"]).toBe(
        "mocked-admin-correlation-uuid",
      );
      expect(finalizedConfig.metadata.correlationId).toBe(
        "mocked-admin-correlation-uuid",
      );
      expect(finalizedConfig.metadata.startTime).toBeDefined();
      expect(logger.info).toHaveBeenCalledWith(
        "Admin API Request",
        expect.any(Object),
      );
    });

    it("should process and rethrow request configuration failures inside logger streams", () => {
      const traceError = new Error(
        "Faulty proxy configuration template parsed",
      );

      expect(() =>
        mockAdminAxiosInstance.requestRejected(traceError),
      ).toThrowError(traceError);
      expect(logger.error).toHaveBeenCalledWith("Admin request setup failed", {
        error: traceError.message,
      });
    });
  });

  // ── Response Interceptor Success Metrics Suite ───────────────────────────
  describe("Response Interceptor Fulfilled Success Paths", () => {
    it("should unwrap payload data bodies if structures resolve as standard objects", () => {
      const mockResponse = {
        data: { payload: "raw-admin-dataset" },
        config: {
          url: "/admin/metrics",
          metadata: { correlationId: "uid-2", startTime: Date.now() },
        },
        status: 200,
      };

      const result = mockAdminAxiosInstance.responseFulfilled(mockResponse);

      expect(unwrapApiResponse).toHaveBeenCalledWith({
        payload: "raw-admin-dataset",
      });
      expect(result.data.unwrapped).toBe(true);
      expect(logger.info).toHaveBeenCalledWith(
        "Admin API Response",
        expect.any(Object),
      );
    });

    it("should leave the payload unaltered if returned resource resolves to a Blob container", () => {
      const diagnosticBlob = new Blob(["log-dump"], { type: "text/plain" });
      const mockResponse = {
        data: diagnosticBlob,
        config: { url: "/admin/logs/download", metadata: {} },
        status: 200,
      };

      const result = mockAdminAxiosInstance.responseFulfilled(mockResponse);

      expect(unwrapApiResponse).not.toHaveBeenCalled();
      expect(result.data).toBe(diagnosticBlob);
    });
  });

  // ── Response Interceptor Error Rejections & Recovery Suite ────────────────
  describe("Response Interceptor Rejections & Recovery Channels", () => {
    it("should toast timeout specific descriptors when error codes identify as ECONNABORTED", async () => {
      const timeoutError = {
        code: "ECONNABORTED",
        message: "timeout limit hit",
        config: { url: "/admin/slow-query", metadata: {} },
      };

      await expect(
        mockAdminAxiosInstance.responseRejected(timeoutError),
      ).rejects.toEqual(timeoutError);
      expect(logger.error).toHaveBeenCalledWith(
        "Admin API Request Timeout",
        expect.any(Object),
      );
      expect(toast.error).toHaveBeenCalledWith(
        "This is taking longer than expected. Please try again.",
      );
    });

    it("should fallback to generic network warning toasts when hardware connections crash", async () => {
      const physicalDisconnectError = {
        message: "Network Error",
        config: { url: "/admin/stats", metadata: {} },
      };

      await expect(
        mockAdminAxiosInstance.responseRejected(physicalDisconnectError),
      ).rejects.toEqual(physicalDisconnectError);
      expect(logger.error).toHaveBeenCalledWith(
        "Admin API Network Failure",
        expect.any(Object),
      );
      expect(toast.error).toHaveBeenCalledWith(
        "Network error. Please check your connection.",
      );
    });

    it("should marshal duplicate concurrent 401 streams smoothly to execute a single admin refresh call", async () => {
      let resolveRefreshPromise;
      const deferredRefreshPromise = new Promise((res) => {
        resolveRefreshPromise = res;
      });

      mockAdminAxiosInstance.post.mockReturnValueOnce(deferredRefreshPromise);

      const errRequest1 = {
        response: { status: 401 },
        config: { url: "/admin/users", headers: {}, metadata: {} },
      };
      const errRequest2 = {
        response: { status: 401 },
        config: { url: "/admin/roles", headers: {}, metadata: {} },
      };

      const retryPromise1 =
        mockAdminAxiosInstance.responseRejected(errRequest1);
      const retryPromise2 =
        mockAdminAxiosInstance.responseRejected(errRequest2);

      await waitFor(() =>
        expect(mockAdminAxiosInstance.post).toHaveBeenCalledTimes(1),
      );
      expect(mockAdminAxiosInstance.post).toHaveBeenCalledWith(
        "/admin/auth/refresh",
        null,
        { _skipAuthRedirect: true },
      );

      await act(async () => {
        resolveRefreshPromise({ data: "refreshed-session-ack" });
      });

      const responseBody1 = await retryPromise1;
      const responseBody2 = await retryPromise2;

      expect(responseBody1.data).toBe("mock-retry-payload");
      expect(responseBody2.data).toBe("mock-retry-payload");
    });

    it("should bounce structural windows onto admin login locations when silent refresh pipelines fail", async () => {
      mockAdminAxiosInstance.post.mockRejectedValueOnce(
        new Error("Admin session storage lease missing"),
      );

      const authError = {
        response: { status: 401 },
        config: { url: "/admin/audit-logs", headers: {}, metadata: {} },
      };

      await expect(
        mockAdminAxiosInstance.responseRejected(authError),
      ).rejects.toThrow();
      expect(globalThis.location.href).toBe("/admin/login");
    });

    it("should terminate redirect triggers if requests specify the _skipAuthRedirect flag configuration", async () => {
      mockAdminAxiosInstance.post.mockRejectedValueOnce(
        new Error("Internal refresh routine abort"),
      );

      const skippedAuthError = {
        response: { status: 401 },
        config: {
          url: "/admin/auth/refresh",
          headers: {},
          metadata: {},
          _skipAuthRedirect: true,
        },
      };

      await expect(
        mockAdminAxiosInstance.responseRejected(skippedAuthError),
      ).rejects.toThrow();
      expect(globalThis.location.href).toBe(""); // Redirection omitted completely
    });

    it("should reject automatically and trigger route shifts if status reflects direct 403 Forbidden exceptions", async () => {
      const unrefreshableForbiddenError = {
        response: {
          status: 403,
          data: { message: "Root administrative clearance revoked" },
        },
        config: { url: "/admin/security-override", metadata: {} },
      };

      await expect(
        mockAdminAxiosInstance.responseRejected(unrefreshableForbiddenError),
      ).rejects.toEqual(unrefreshableForbiddenError);
      expect(logger.warn).toHaveBeenCalledWith(
        "Admin session expired or unauthorized",
        expect.any(Object),
      );
      expect(globalThis.location.href).toBe("/admin/login");
    });

    it("should register exceptions within Sentry telemetry maps when catching 5xx server failures", async () => {
      vi.mocked(isServerError).mockReturnValueOnce(true);

      const criticalClusterCrash = {
        response: {
          status: 503,
          data: { message: "Kubernetes Admin API Pod Throttled Exception" },
        },
        config: { url: "/admin/cluster/health", metadata: {} },
      };

      await expect(
        mockAdminAxiosInstance.responseRejected(criticalClusterCrash),
      ).rejects.toEqual(criticalClusterCrash);

      expect(Sentry.captureException).toHaveBeenCalledWith(
        criticalClusterCrash,
        expect.objectContaining({
          extra: expect.objectContaining({ context: "admin", status: 503 }),
        }),
      );
      expect(toast.error).toHaveBeenCalledWith(
        "Something went wrong. Please try again.",
      );
    });

    it("should trace standard warnings and throw unhandled client glitches like 404 or 422 immediately", async () => {
      const clientFormGlitch = {
        response: {
          status: 422,
          data: { message: "Assigned target role uuid mapping input empty" },
        },
        config: { url: "/admin/assign-roles", metadata: {} },
      };

      await expect(
        mockAdminAxiosInstance.responseRejected(clientFormGlitch),
      ).rejects.toEqual(clientFormGlitch);
      expect(logger.warn).toHaveBeenCalledWith(
        "Admin API Client Error",
        expect.any(Object),
      );
    });
  });
});
