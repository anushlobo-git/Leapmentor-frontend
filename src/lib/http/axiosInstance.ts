/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/lib/axiosInstance.ts
//
// Single shared HTTP client for the ENTIRE app — mentor, mentee, and admin
// requests all go through this one axios instance. Previously admin traffic
// had its own axios.create() (adminAxiosInstance.ts) with a parallel copy of
// this same interceptor logic. That meant every new role introduced another
// hand-rolled client. Instead, this file is "domain aware": it picks the
// right base URL, auth strategy, refresh endpoint, and redirect target from
// the request URL, via the AUTH_DOMAINS map below. Adding a new role later
// means adding one entry to that map — never another axios instance.
import axios from "axios";
import { clearAuthRole } from "@lib/http/cookies";
import * as Sentry from "@sentry/react";
import { v4 as uuidv4 } from "uuid";
import logger from "@lib/monitoring/logger";
import { toast } from "sonner";
import { unwrapApiResponse } from "@lib/http/apiResponse";
import { HTTP_STATUS, isServerError, isRateLimited } from "@lib/http/httpStatus";

let _store = null;
/**
 * Injects the Redux store so the axios interceptor can read the current
 * session (access token / role) and dispatch auth updates during refresh.
 * @param {import('@reduxjs/toolkit').EnhancedStore} store - App Redux store instance.
 * @returns {void}
 */
export const injectStore = (store) => {
  _store = store;
};

// ─── AUTH DOMAINS ────────────────────────────────────────────────────────────
// Every request is classified into exactly one domain based on its URL.
// The domain decides: which base URL to hit, whether to attach a Bearer
// token, where the silent-refresh endpoint lives, and where to redirect on
// an unrecoverable 401. This is the one place role-specific auth behavior
// lives — everything else in this file is domain-agnostic.
const DEFAULT_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
// Admin routes are served by the same versioned API unless a deployment
// explicitly provides a separate admin origin/base path.
const ADMIN_BASE_URL =
  import.meta.env.VITE_ADMIN_API_BASE_URL || DEFAULT_BASE_URL;

const AUTH_DOMAINS = {
  admin: {
    name: "admin",
    //if the passed url as admin or starts with the admin then this matches gives true
    matches: (url) => !!url && url.startsWith("/admin"),
    baseURL: ADMIN_BASE_URL,
    usesBearer: false, // admin session lives entirely in an HttpOnly cookie
    loginUrl: "/admin/auth/login",
    refreshUrl: "/admin/auth/refresh",
    redirectUrl: "/admin/login",
  },
  default: {
    name: "default",
    matches: () => true, // fallback — mentor/mentee (and anything unclassified)
    baseURL: DEFAULT_BASE_URL,
    usesBearer: true,
    loginUrl: "/auth/login",
    refreshUrl: "/auth/refresh",
    redirectUrl: "/login",
  },
};
//here the admin api calls gives a object called adminConfig={authDomain : "admin"} so if it exists in the
//config then it will return the admin Domain else its domain is default for user
//axiosInstance.get("/admin/stats",adminConfig)
const resolveDomain = (config) => {
  // Check the config and see which domain to use
  // Prefer an explicit domain. URL matching remains a safe default for the
  // conventional /admin/* routes, but some admin endpoints intentionally
  // share an unprefixed path with user-facing endpoints.
  if (config?.authDomain === "admin") return AUTH_DOMAINS.admin;
  if (config?.authDomain === "default") return AUTH_DOMAINS.default;
  return AUTH_DOMAINS.admin.matches(config?.url)
    ? AUTH_DOMAINS.admin
    : AUTH_DOMAINS.default;
};
//it gives a function object that can be used to make requests to the api

const axiosInstance = axios.create({
  baseURL: DEFAULT_BASE_URL,
    //sends cookies with the request
  withCredentials: true,
  timeout: 15000, // 15s default; override per-call for slow endpoints (e.g. exports)
});

// ─── REQUEST INTERCEPTOR ─────────────────────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
        //for all the requests, we need to know which domain to use
    const domain = resolveDomain(config);
        //attach base url for it
    config.baseURL = domain.baseURL;

    if (domain.usesBearer) {
      const accessToken = _store?.getState().auth.accessToken;
      if (accessToken) {
        config.headers["Authorization"] = `Bearer ${accessToken}`;
      }
    }

    const correlationId = uuidv4();
    config.headers["X-Correlation-ID"] = correlationId;
    config.metadata = { correlationId, startTime: Date.now() };

    logger.info(domain.name === "admin" ? "Admin API Request" : "API Request", {
      method: config.method?.toUpperCase(),
      url: config.url,
      correlationId,
    });

    return config;
  },
  (error) => {
    logger.error("Request setup failed", { error: error.message });
    throw error;
  },
);
//this variable holds true for the domain if a request is running the refresh endpoint
//if default domain request is running then default :true else vise versa
// ─── RESPONSE INTERCEPTOR ────────────────────────────────────────────────────
// Refresh-in-flight state is tracked per domain so a stuck admin refresh
// can never block or get confused with a concurrent mentor/mentee refresh.
const isRefreshing = { admin: false, default: false };
//this object stores the promises that needs to be run later for replacing the token
//so example requestA is running refresh then requestB and requestC with the expired token will be here
/**
 failedQueue.default = [
  { resolve: resolveB, reject: rejectB },
  { resolve: resolveC, reject: rejectC },]
 */
//now if the first request gets the token then the next function gets called with the new token so eliminating
//concurrent calls
const failedQueue = { admin: [], default: [] };

const processQueue = (domainName, error, token = null) => {
  failedQueue[domainName].forEach((prom) => {
    if (error) prom.reject(error);//if there is a error then it rejects the pending request in the
    //object failedQueue

    else prom.resolve(token);//when this is called the isRefreshableRequest.then is called
    //so the elements in the failedQueue all the request such as A and B pending once
    //which was paused to .then will be called
  });
  failedQueue[domainName] = [];
};

const isRefreshableRequest = (domain, status, originalRequest) =>
  status === HTTP_STATUS.UNAUTHORIZED &&
  !originalRequest?._retry &&
  originalRequest?.url !== domain.refreshUrl &&
  originalRequest?.url !== domain.loginUrl;

axiosInstance.interceptors.response.use(
  //interceptors get response object if the server call is successful
  //else the object is error i have the information is in
  //study/auth/axios/axiosInterceptor.md about the response and error object
  (response) => {
    if (
      response.data &&
      typeof response.data === "object" &&
      !(response.data instanceof Blob)
    ) {
      response.data = unwrapApiResponse(response.data);
    }

    const domain = resolveDomain(response.config);
    const { correlationId, startTime } = response.config.metadata || {};
    logger.info(domain.name === "admin" ? "Admin API Response" : "API Response", {
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
        //u get the config of the request that was sent which got an error
    const originalRequest = error?.config;
        //is it admin or default
    const domain = resolveDomain(originalRequest);
        //status code is it 500 or 401 etc
    const status = error?.response?.status;
    const url = error?.config?.url;
    const { correlationId } = error?.config?.metadata || {};
    const message = error?.response?.data?.message || error.message;
    const isSkipped = originalRequest?._skipAuthRedirect;
    const logPrefix = domain.name === "admin" ? "Admin " : "";

    // 1. Network error / timeout
    if (!error.response) {
      const isTimeout = error.code === "ECONNABORTED";
      logger.error(
        isTimeout
          ? `${logPrefix}API Request Timeout`
          : `${logPrefix}API Network Failure — Server unreachable or CORS rejection`,
        { url, correlationId, message, stack: error.stack },
      );
      // NOTE: preserves each domain's original toast behavior exactly.
      // Mentor/mentee only ever toasted on a genuine timeout; admin toasted
      // on any network failure. Unifying these into one shared "always
      // toast" behavior would be a real UX change, not just a refactor, so
      // it's kept domain-specific here rather than homogenized.
      if (isTimeout) {
        toast.error("This is taking longer than expected. Please try again.");
      } else if (domain.name === "admin") {
        toast.error("Network error. Please check your connection.");
      }
      throw error;
    }

    // 2. UNAUTHORIZED — try silent refresh first, redirect only if refresh fails
    // isRefreshAbleRequest(domain, 401, requestA) returns true
    // (it's a 401, not retried yet, not the login/refresh URL).
    if (isRefreshableRequest(domain, status, originalRequest)) {
      //if a request already is refreshing then the next if is true so this pending promise goes and sits
      //in the failedQueue for next call so that multiple request doesn't call the refresh together
      //one refresh calls can be used for getting the token and then give the token to all the promise
      //pending request and check if it works
      if (isRefreshing[domain.name]) {
        return new Promise((resolve, reject) => {
          failedQueue[domain.name].push({ resolve, reject });
        })
        //here the requests are paused and then stored in failedQueue this runs after the refresh is run
          //and it gets the token for the first request in the failedQueue and for the rest request this function is called
          .then((token) => {
            if (domain.usesBearer && token) {
              originalRequest.headers["Authorization"] = `Bearer ${token}`;
            }
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            throw err;
          });
      }

      originalRequest._retry = true;
      isRefreshing[domain.name] = true;
      //refresh calls in here
      try {
        if (domain.usesBearer) {
          // FIX: lazy-import authSlice actions here to avoid circular dependency
          const { setUser } = await import("@features/auth/models/authSlice");

          const { data } = await axiosInstance.post(domain.refreshUrl);
          const newAccessToken = data?.accessToken;

          _store.dispatch(
            setUser({
              user: _store.getState().auth.user,
              accessToken: newAccessToken,
            }),
          );
          //this runs all the waiting and pending request with the new token received
          processQueue(domain.name, null, newAccessToken);
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        } else {
          // Admin: refresh endpoint just extends the HttpOnly cookie — no
          // token comes back to the client, and nothing to store.
          await axiosInstance.post(domain.refreshUrl, null, {
            _skipAuthRedirect: true,
          });
          processQueue(domain.name, null);
        }

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(domain.name, refreshError, null);

        logger.warn(`${logPrefix}Refresh token expired — redirecting to login`, {
          correlationId,
        });

        if (domain.usesBearer) {
          const { logout } = await import("@features/auth/models/authSlice");
          _store.dispatch(logout());
          clearAuthRole();
        } else {
          const { setAdminSession } = await import("@features/auth/models/authSlice");
          _store?.dispatch(setAdminSession(null));
        }

        if (!isSkipped) {
          globalThis.location.href = domain.redirectUrl;
        }
        throw refreshError;
      } finally {
        isRefreshing[domain.name] = false;
      }
    }

    // 3. FORBIDDEN / still-unauthorized after the checks above — blocked or expired session
    if (
      status === HTTP_STATUS.FORBIDDEN &&
      (message?.includes("blocked") || domain.name === "admin")
    ) {
      logger.warn(`${logPrefix}Blocked or unauthorized session terminated`, {
        url,
        correlationId,
      });

      if (domain.usesBearer) {
        const { logout } = await import("@features/auth/models/authSlice");
        _store.dispatch(logout());
        clearAuthRole();
        if (!isSkipped) {
          globalThis.location.href = `${domain.redirectUrl}?reason=blocked`;
        }
      } else {
        const { setAdminSession } = await import("@features/auth/models/authSlice");
        _store?.dispatch(setAdminSession(null));
        if (!isSkipped) {
          globalThis.location.href = domain.redirectUrl;
        }
      }
      throw error;
    }

    // 3.5 — Rate limited
    if (isRateLimited(status)) {
      logger.warn(`${logPrefix}API rate limit hit`, { url, correlationId });
      toast.error(
        "You're making requests too quickly. Please wait a moment and try again.",
      );
      throw error;
    }

    // 4. 5xx — server crash
    if (isServerError(status)) {
      logger.error(`${logPrefix}Server internal error response`, {
        status,
        url,
        correlationId,
        message,
      });
      Sentry.captureException(error, {
        extra: { url, status, correlationId, message, domain: domain.name },
      });
      toast.error("Something went wrong. Please try again.");
      throw error;
    }

    // 5. 400, 404, 422 etc.
    logger.warn(`${logPrefix}API Client Validation Error`, {
      status,
      url,
      correlationId,
      message,
    });
    throw error;
  },
);

export default axiosInstance;
