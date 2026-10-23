/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// Shared helpers for reading an error inside a `catch (err)` block.
//
// Under `strict`, the variable in `catch (err)` is `unknown`, so `err?.message`
// and `err?.response?.data?.message` don't compile. Instead of repeating an
// `as AxiosError<...>` cast in every slice/hook, cast once here.
import type { AxiosError } from "axios";

/** Shape of the JSON error body the backend sends back ({ message: "..." }). */
interface ApiErrorBody {
  message?: string;
}

/**
 * The backend's error message (`err.response.data.message`), or `fallback`
 * when the request never got a response or the body has no message.
 * Never throws, whatever was thrown (Error, AxiosError, string, null...).
 */
export const getApiErrorMessage = (err: unknown, fallback: string): string =>
  (err as AxiosError<ApiErrorBody> | null | undefined)?.response?.data?.message ||
  fallback;

/**
 * The thrown error's own `message` (e.g. "Network Error", "timeout of 15000ms
 * exceeded") — for logging. `undefined` when there isn't one.
 */
export const getErrorMessage = (err: unknown): string | undefined =>
  (err as { message?: string } | null | undefined)?.message;
