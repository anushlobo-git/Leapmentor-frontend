/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

/**
 * @file httpStatus.js
 * @description Single source of truth for HTTP status codes used across the frontend.
 * Import from this module instead of hardcoding raw numeric literals in comparison logic.
 *
 * @typedef {Object} HttpStatus
 * @property {200} OK                  - Request succeeded.
 * @property {201} CREATED             - Resource created successfully.
 * @property {204} NO_CONTENT          - Request succeeded with no response body.
 * @property {400} BAD_REQUEST         - Malformed or invalid request syntax.
 * @property {401} UNAUTHORIZED        - Authentication required or token invalid.
 * @property {403} FORBIDDEN           - Authenticated but lacking permission.
 * @property {404} NOT_FOUND           - Requested resource does not exist.
 * @property {408} REQUEST_TIMEOUT     - Server timed out waiting for the request.
 * @property {409} CONFLICT            - Request conflicts with current resource state.
 * @property {422} UNPROCESSABLE      - Validation error on a well-formed request.
 * @property {429} TOO_MANY_REQUESTS   - Client has exceeded the rate limit.
 * @property {500} INTERNAL_SERVER_ERROR - Unexpected server-side failure.
 * @property {502} BAD_GATEWAY         - Upstream server returned an invalid response.
 * @property {503} SERVICE_UNAVAILABLE - Server temporarily unavailable or overloaded.
 *
 * @example
 * import { HTTP_STATUS } from '@/constants/httpStatus';
 * if (err?.response?.status === HTTP_STATUS.UNAUTHORIZED) { ... }
 */

export const HTTP_STATUS = Object.freeze({
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
});

/**
 * Returns true when the status code represents a server-side error (5xx).
 */
export const isServerError = (status) => status >= 500;

/**
 * Returns true when the client has been rate-limited (HTTP 429).
 */
export const isRateLimited = (status) => status === HTTP_STATUS.TOO_MANY_REQUESTS;
