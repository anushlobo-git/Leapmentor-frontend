// src/utils/axiosInstance.js
import axios from "axios";
import { clearAuthRole } from "./cookies"; // utility to clear role from localStorage on logout
import * as Sentry from "@sentry/react";
import { v4 as uuidv4 } from "uuid";
import logger from "./logger"; // your Logtail wrapper
import { toast } from "sonner"; // or your preferred toast library

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1",
  withCredentials: true, // ✅ sends authToken cookie automatically on every request
});

// ─── REQUEST INTERCEPTOR ─────────────────────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    config.withCredentials = true; // Ensure cookies are sent with every request
    // Attach correlation ID so Logtail + Sentry entries can be linked
    const correlationId = uuidv4();
    config.headers["X-Correlation-ID"] = correlationId;
    config.metadata = { correlationId, startTime: Date.now() };

    logger.info("API Request", {
      method: config.method?.toUpperCase(),
      url: config.url,
      correlationId,
    });

    return config;
  },
  (error) => {
    logger.error("Request setup failed", { error: error.message });
    return Promise.reject(error);
  },
);

// ─── RESPONSE INTERCEPTOR ────────────────────────────────────────────────────
axiosInstance.interceptors.response.use(
  // ✅ Success path
  (response) => {
    const { correlationId, startTime } = response.config.metadata || {};
    logger.info("API Response", {
      status: response.status,
      url: response.config.url,
      durationMs: startTime ? Date.now() - startTime : null,
      correlationId,
    });
    return response;
  },

  // ─── RESPONSE INTERCEPTOR ERROR PATH ─────────────────────────────────────────
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url;
    const { correlationId } = error?.config?.metadata || {};

    // Extract response message, falling back to the raw client-side axios error string
    const message = error?.response?.data?.message || error.message;

    // 1. 🌐 CRITICAL FIX: Handle literal Network Errors (Server down / CORS blocks)
    if (!error.response) {
      logger.error(
        "API Network Failure — Server unreachable or CORS rejection",
        {
          url,
          correlationId,
          message, // Captures "Network Error" or "ERR_CONNECTION_REFUSED"
          stack: error.stack, // Captures the exact client-side code invocation pathway
        },
      );
      return Promise.reject(error);
    }

    // 2. 🔐 401 — Unauthenticated
    if (status === 401) {
      clearAuthRole();
      logger.warn("Unauthenticated request — redirecting to login", {
        url,
        correlationId,
      });
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // 3. 🚫 403 — Blocked user
    if (status === 403 && message?.includes("blocked")) {
      clearAuthRole();
      logger.warn("Blocked user terminated", { url, correlationId });
      window.location.href = "/login?reason=blocked";
      return Promise.reject(error);
    }

    // 4. 💥 5xx — Severe Server Crashes
    if (status >= 500) {
      logger.error("Server internal error response", {
        status,
        url,
        correlationId,
        message,
      });
      Sentry.captureException(error, {
        extra: { url, status, correlationId, message },
      });
      toast.error("Something went wrong. Please try again.");
      return Promise.reject(error);
    }

    // 5. ⚠️ 400, 404, 422, etc. — Corrected Severity Mismatch from INFO to WARN
    logger.warn("API Client Validation Error", {
      status,
      url,
      correlationId,
      message,
    });

    return Promise.reject(error);
  },
);

export default axiosInstance;
