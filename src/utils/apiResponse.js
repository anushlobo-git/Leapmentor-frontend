/**
 * Unwrap the standard backend API envelope into a flat payload for callers.
 * { success, data, message } → { ...data, success, message }
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
  const flattened =
    payload !== null && typeof payload === "object" && !Array.isArray(payload)
      ? payload
      : payload !== undefined
        ? { data: payload }
        : {};

  return {
    ...flattened,
    success: body.success,
    message: body.message,
  };
};
