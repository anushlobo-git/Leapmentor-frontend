/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

/**
 * Unwraps the standard backend API envelope into a flatter payload for callers.
 * `{ success, data, message }` becomes `{ ...data, success, message }`.
 * @param {unknown} body - Raw axios response body.
 * @returns {unknown} Either the original payload or the flattened envelope.
 */
export const unwrapApiResponse = (body) => {
  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body) ||
    body instanceof Blob ||
    body.success === undefined
  ) {
    return body;
  }

  const payload = body.data;
  let flattened = {};

  if (payload === undefined) {
    flattened = {};
  } else if (
    payload !== null &&
    typeof payload === "object" &&
    !Array.isArray(payload)
  ) {
    flattened = payload;
  } else {
    flattened = { data: payload };
  }

  return {
    ...flattened,
    success: body.success,
    message: body.message,
  };
};
