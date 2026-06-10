import axios from "axios";
import { clearAuthRole } from "./cookies";
import * as Sentry from "@sentry/react";
import { v4 as uuidv4 } from "uuid";
import logger from "./logger";
import { toast } from "sonner";

let _store = null;
export const injectStore = (store) => {
  _store = store;
};

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1",
  withCredentials: true,
});

// ─── REQUEST INTERCEPTOR ─────────────────────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = _store?.getState().auth.accessToken;

    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }

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
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => {
    const { correlationId, startTime } = response.config.metadata || {};
    logger.info("API Response", {
      status: response.status,
      url: response.config.url,
      durationMs: startTime ? Date.now() - startTime : null,
      correlationId,
      contentLength:
        response.headers["content-length"] ??
        JSON.stringify(response.data).length ??
        null,
    });
    return response;
  },

  async (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url;
    const { correlationId } = error?.config?.metadata || {};
    const message = error?.response?.data?.message || error.message;
    const originalRequest = error?.config;

    // 1. Network error
    if (!error.response) {
      logger.error(
        "API Network Failure — Server unreachable or CORS rejection",
        {
          url,
          correlationId,
          message,
          stack: error.stack,
        },
      );
      return Promise.reject(error);
    }

    // 2. 401 — try silent refresh first, redirect only if refresh fails
    if (status === 401 && !originalRequest._retry && url !== "/auth/refresh") {
      if (isRefreshing) {
        // Queue the request until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // FIX: lazy-import authSlice actions here to avoid circular dependency
        const { setUser } = await import("../store/slices/authSlice");

        const { data } = await axiosInstance.post("/auth/refresh");
        const newAccessToken = data.accessToken;

        // FIX: use _store (not undefined `store`) throughout
        _store.dispatch(
          setUser({
            user: _store.getState().auth.user,
            accessToken: newAccessToken,
          }),
        );

        processQueue(null, newAccessToken);
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        // FIX: removed the erroneous second /auth/refresh call that was here
        // Refresh failed — clear everything and redirect
        const { logout } = await import("../store/slices/authSlice");
        _store.dispatch(logout());
        clearAuthRole();
        logger.warn("Refresh token expired — redirecting to login", {
          correlationId,
        });
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // 3. 403 — blocked user
    // FIX: replaced require() (CommonJS) with _store — we already have the reference
    if (status === 403 && message?.includes("blocked")) {
      const { logout } = await import("../store/slices/authSlice");
      _store.dispatch(logout());
      clearAuthRole();
      logger.warn("Blocked user terminated", { url, correlationId });
      window.location.href = "/login?reason=blocked";
      return Promise.reject(error);
    }

    // 4. 5xx — server crash
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

    // 5. 400, 404, 422 etc.
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
