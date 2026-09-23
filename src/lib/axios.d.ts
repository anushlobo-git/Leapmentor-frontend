import "axios";

// The interceptors in axiosInstance.ts (the single shared client for
// mentor/mentee/admin traffic) stash a couple of app-specific fields on the
// axios request config for correlation-id logging and to opt individual
// requests out of the 401 redirect handling.
// This augmentation makes those reads/writes type-check without `any`.
declare module "axios" {
  interface AxiosRequestConfig {
    metadata?: {
      correlationId: string;
      startTime: number;
    };
    _skipAuthRedirect?: boolean;
    /** Explicitly select the cookie-based admin auth domain. */
    authDomain?: "admin" | "default";
  }

  interface InternalAxiosRequestConfig {
    metadata?: {
      correlationId: string;
      startTime: number;
    };
    _skipAuthRedirect?: boolean;
    authDomain?: "admin" | "default";
  }
}
