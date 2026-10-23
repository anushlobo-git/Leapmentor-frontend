/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

/**
 * Unwraps the standard backend API envelope into a flatter payload for callers.
 * `{ success, data, message }` becomes `{ ...data, success, message }`.
 * @param {unknown} body - Raw axios response body.
 * @returns {unknown} Either the original payload or the flattened envelope.
 */
type ApiEnvelope = {
  success?: unknown;
  data?: unknown;
  message?: unknown;
};

export const unwrapApiResponse = (body: unknown) => {
  const envelope = body as ApiEnvelope;
  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body) ||
    body instanceof Blob ||
    envelope.success === undefined
  ) {
    return body;
  }

  const payload = envelope.data;
  let flattened: Record<string, unknown> = {};

  if (payload === undefined) {
    flattened = {};
  } else if (
    payload !== null &&
    typeof payload === "object" &&
    !Array.isArray(payload)
  ) {
    flattened = payload as Record<string, unknown>;
  } else {
    flattened = { data: payload };
  }

  return {
    ...flattened,
    success: envelope.success,
    message: envelope.message,
  };
};
