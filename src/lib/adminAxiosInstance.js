/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import axios from "axios";
import * as Sentry from "@sentry/react";
import { toast } from "sonner";
import logger from "@lib/logger";
import { v4 as uuidv4 } from "uuid";
import { unwrapApiResponse } from "@lib/apiResponse";
import { HTTP_STATUS, isServerError } from "@lib/httpStatus";

const adminAxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
  withCredentials: true,
  timeout: 15000, // 15s default; override per-call for slow endpoints (e.g. exports)
});

// ── REQUEST INTERCEPTOR ───────────────────────────────────────
adminAxiosInstance.interceptors.request.use(
  (config) => {
    const correlationId = uuidv4();
    config.headers["X-Correlation-ID"] = correlationId;
    config.metadata = { correlationId, startTime: Date.now() };

    logger.info("Admin API Request", {
      method: config.method?.toUpperCase(),
      url: config.url,
      correlationId,
    });

    return config;
  },
  (error) => {
    logger.error("Admin request setup failed", {
      error: error.message,
    });
    return Promise.reject(error);
  },
);

// ── RESPONSE INTERCEPTOR ──────────────────────────────────────

// Tracks an in-flight silent refresh so concurrent 401s don't each fire their
// own POST /admin/auth/refresh — they queue and share the same outcome.
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve();
  });
  failedQueue = [];
};

adminAxiosInstance.interceptors.response.use(
  (response) => {
    if (
      response.data &&
      typeof response.data === "object" &&
      !(response.data instanceof Blob)
    ) {
      response.data = unwrapApiResponse(response.data);
    }

    const { correlationId, startTime } = response.config.metadata || {};
    logger.info("Admin API Response", {
      status: response.status,
      url: response.config.url,
      durationMs: startTime ? Date.now() - startTime : null,
      correlationId,
    });

    return response;
  },

  async (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url;
    const { correlationId } = error?.config?.metadata || {};
    const message = error?.response?.data?.message || error.message;
    const originalRequest = error?.config;
    const isSkipped = originalRequest?._skipAuthRedirect;

    // 1. Network error / timeout — server unreachable
    if (!error.response) {
      const isTimeout = error.code === "ECONNABORTED";
      logger.error(
        isTimeout ? "Admin API Request Timeout" : "Admin API Network Failure",
        {
          url,
          correlationId,
          message,
          stack: error.stack,
        },
      );
      toast.error(
        isTimeout
          ? "This is taking longer than expected. Please try again."
          : "Network error. Please check your connection.",
      );
      return Promise.reject(error);
    }

    // 2. UNAUTHORIZED — the short-lived adminToken expired. Try one silent
    // refresh (rotates the HttpOnly adminToken via the adminRefreshToken
    // cookie) before giving up and sending the admin back to /admin/login.
    if (
      status === HTTP_STATUS.UNAUTHORIZED &&
      !originalRequest._retry &&
      url !== "/admin/auth/refresh" &&
      url !== "/admin/auth/login"
    ) {
      if (isRefreshing) {
        // A refresh is already in flight — queue this request behind it
        // instead of firing a second, redundant refresh call.
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => adminAxiosInstance(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Cookie-based: the server rotates the HttpOnly adminToken cookie in
        // its Set-Cookie response header, so there's no token to store here.
        //
        // _skipAuthRedirect is set on THIS request deliberately: if this
        // refresh call itself 401s, it re-enters this very interceptor as
        // its own error. Without the flag, the FORBIDDEN/UNAUTHORIZED branch
        // below would see an "unskipped" request and redirect immediately —
        // before the outer catch below ever gets a chance to check whether
        // the *original* request (e.g. the silent /admin/auth/me mount
        // probe) wanted the redirect skipped. The redirect decision must be
        // made exactly once, by the outer catch, based on the original
        // request's flag — not by this nested request's own failure.
        await adminAxiosInstance.post("/admin/auth/refresh", null, {
          _skipAuthRedirect: true,
        });

        processQueue(null);
        return adminAxiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);

        logger.warn("Admin refresh token expired or invalid", {
          url,
          correlationId,
          skipped: isSkipped,
        });

        // Respect the ORIGINAL request's _skipAuthRedirect (e.g. the
        // /admin/auth/me probe on mount) so a first-time visitor with no
        // session isn't bounced in a redirect loop.
        if (!isSkipped) {
          globalThis.location.href = "/admin/login";
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // 2.5 FORBIDDEN — authenticated but lacking permission, or refresh itself
    // came back 401/403 (invalid/expired refresh token, or the nested
    // refresh call from section 2 above, which is tagged _skipAuthRedirect
    // so it lands here without redirecting on its own). No point retrying;
    // send the admin to log in again — unless this request asked to be
    // skipped.
    if (
      status === HTTP_STATUS.FORBIDDEN ||
      status === HTTP_STATUS.UNAUTHORIZED
    ) {
      logger.warn("Admin session expired or unauthorized", {
        url,
        status,
        correlationId,
        skipped: isSkipped,
      });

      if (!isSkipped) {
        globalThis.location.href = "/admin/login";
      }

      return Promise.reject(error);
    }

    // 3. 5xx — server crash
    if (isServerError(status)) {
      logger.error("Admin API Server Error", {
        status,
        url,
        correlationId,
        message,
      });
      Sentry.captureException(error, {
        extra: { url, status, correlationId, message, context: "admin" },
      });
      toast.error("Something went wrong. Please try again.");
      return Promise.reject(error);
    }

    // 4. 4xx — client errors (400, 404, 422 etc.)
    logger.warn("Admin API Client Error", {
      status,
      url,
      correlationId,
      message,
    });

    return Promise.reject(error);
  },
);

export default adminAxiosInstance;
