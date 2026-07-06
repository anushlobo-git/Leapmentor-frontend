/**
 * @file httpStatus.js
 * @description Single source of truth for HTTP status codes used across the frontend.
 * Import from this module instead of hardcoding raw numeric literals in comparison logic.
 *
 * @example
 * import { HTTP_STATUS } from '@/constants/httpStatus';
 * if (err?.response?.status === HTTP_STATUS.UNAUTHORIZED) { ... }
 */

/**
 * Frozen map of named HTTP status codes.
 *
 * @property {number} OK            - 200 Request succeeded.
 * @property {number} CREATED       - 201 Resource successfully created.
 * @property {number} NO_CONTENT    - 204 Success with no response body.
 * @property {number} BAD_REQUEST   - 400 Malformed request or validation failure.
 * @property {number} UNAUTHORIZED  - 401 Authentication required or token expired.
 * @property {number} FORBIDDEN     - 403 Authenticated but not permitted to access.
 * @property {number} NOT_FOUND     - 404 Requested resource does not exist.
 * @property {number} CONFLICT      - 409 State conflict (e.g. duplicate pending request).
 * @property {number} UNPROCESSABLE - 422 Semantically invalid request body.
 */
export const HTTP_STATUS = Object.freeze({
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
});

/**
 * Returns true when the status code represents a server-side error (5xx).
 *
 * @param {number} status - The HTTP response status code.
 * @returns {boolean}
 *
 * @example
 * if (isServerError(status)) { Sentry.captureException(error); }
 */
export const isServerError = (status) => status >= 500;
