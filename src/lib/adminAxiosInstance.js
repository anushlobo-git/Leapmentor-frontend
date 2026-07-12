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
    throw error;
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

const redirectToAdminLogin = (isSkipped) => {
  if (!isSkipped) {
    globalThis.location.href = "/admin/login";
  }
};

const isRefreshableRequest = (status, originalRequest, url) =>
  status === HTTP_STATUS.UNAUTHORIZED &&
  !originalRequest?._retry &&
  url !== "/admin/auth/refresh" &&
  url !== "/admin/auth/login";

const handleNetworkError = (error, { url, correlationId, message }) => {
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
  throw error;
};

const handleAdminError = async (error, context) => {
  const { status, url, correlationId, message, originalRequest, isSkipped } = context;

  if (!error.response) {
    handleNetworkError(error, { url, correlationId, message });
  }

  if (isRefreshableRequest(status, originalRequest, url)) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(() => adminAxiosInstance(originalRequest));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
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

      redirectToAdminLogin(isSkipped);
      throw refreshError;
    } finally {
      isRefreshing = false;
    }
  }

  if (status === HTTP_STATUS.FORBIDDEN || status === HTTP_STATUS.UNAUTHORIZED) {
    logger.warn("Admin session expired or unauthorized", {
      url,
      status,
      correlationId,
      skipped: isSkipped,
    });

    redirectToAdminLogin(isSkipped);
    throw error;
  }

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
    throw error;
  }

  logger.warn("Admin API Client Error", {
    status,
    url,
    correlationId,
    message,
  });

  throw error;
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

    return handleAdminError(error, {
      status,
      url,
      correlationId,
      message,
      originalRequest,
      isSkipped,
    });
  },
);

export default adminAxiosInstance;
