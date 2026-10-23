/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import { HTTP_STATUS, isServerError, isRateLimited } from "./httpStatus";

describe("httpStatus", () => {
  describe("HTTP_STATUS", () => {
    it("should have all status codes", () => {
      expect(HTTP_STATUS.OK).toBe(200);
      expect(HTTP_STATUS.CREATED).toBe(201);
      expect(HTTP_STATUS.NO_CONTENT).toBe(204);
      expect(HTTP_STATUS.BAD_REQUEST).toBe(400);
      expect(HTTP_STATUS.UNAUTHORIZED).toBe(401);
      expect(HTTP_STATUS.FORBIDDEN).toBe(403);
      expect(HTTP_STATUS.NOT_FOUND).toBe(404);
      expect(HTTP_STATUS.REQUEST_TIMEOUT).toBe(408);
      expect(HTTP_STATUS.CONFLICT).toBe(409);
      expect(HTTP_STATUS.UNPROCESSABLE).toBe(422);
      expect(HTTP_STATUS.TOO_MANY_REQUESTS).toBe(429);
      expect(HTTP_STATUS.INTERNAL_SERVER_ERROR).toBe(500);
      expect(HTTP_STATUS.BAD_GATEWAY).toBe(502);
      expect(HTTP_STATUS.SERVICE_UNAVAILABLE).toBe(503);
    });

    it("should be frozen", () => {
      expect(Object.isFrozen(HTTP_STATUS)).toBe(true);
    });
  });

  describe("isServerError", () => {
    it("should return true for 500", () => {
      expect(isServerError(500)).toBe(true);
    });

    it("should return true for 502", () => {
      expect(isServerError(502)).toBe(true);
    });

    it("should return true for 503", () => {
      expect(isServerError(503)).toBe(true);
    });

    it("should return true for 599", () => {
      expect(isServerError(599)).toBe(true);
    });

    it("should return false for 4xx errors", () => {
      expect(isServerError(400)).toBe(false);
      expect(isServerError(401)).toBe(false);
      expect(isServerError(404)).toBe(false);
    });

    it("should return false for 2xx success", () => {
      expect(isServerError(200)).toBe(false);
      expect(isServerError(201)).toBe(false);
    });

    it("should return false for 0", () => {
      expect(isServerError(0)).toBe(false);
    });

    it("should return false for 499", () => {
      expect(isServerError(499)).toBe(false);
    });
  });

  describe("isRateLimited", () => {
    it("should return true for 429", () => {
      expect(isRateLimited(429)).toBe(true);
    });

    it("should return false for other status codes", () => {
      expect(isRateLimited(400)).toBe(false);
      expect(isRateLimited(401)).toBe(false);
      expect(isRateLimited(500)).toBe(false);
      expect(isRateLimited(200)).toBe(false);
    });

    it("should return false for 0", () => {
      expect(isRateLimited(0)).toBe(false);
    });
  });
});
