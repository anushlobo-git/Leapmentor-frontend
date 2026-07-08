/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import axios from "axios";
import * as Sentry from "@sentry/react";
import { toast } from "sonner";
import logger from "./logger";
import { v4 as uuidv4 } from "uuid";
import { unwrapApiResponse } from "./apiResponse";
import { HTTP_STATUS, isServerError } from "../constants/httpStatus";

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

    // 2. UNAUTHORIZED / FORBIDDEN — skip redirect for silent auth probes (e.g. /auth/me on mount)
    if (
      status === HTTP_STATUS.UNAUTHORIZED ||
      status === HTTP_STATUS.FORBIDDEN
    ) {
      const isSkipped = error.config?._skipAuthRedirect;

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
