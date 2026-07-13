/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import { unwrapApiResponse } from "./apiResponse";

describe("apiResponse", () => {
  describe("unwrapApiResponse", () => {
    it("should return original body when body is null", () => {
      const result = unwrapApiResponse(null);
      expect(result).toBe(null);
    });

    it("should return original body when body is undefined", () => {
      const result = unwrapApiResponse(undefined);
      expect(result).toBe(undefined);
    });

    it("should return original body when body is not an object", () => {
      const result = unwrapApiResponse("string");
      expect(result).toBe("string");
    });

    it("should return original body when body is a number", () => {
      const result = unwrapApiResponse(123);
      expect(result).toBe(123);
    });

    it("should return original body when body is an array", () => {
      const array = [1, 2, 3];
      const result = unwrapApiResponse(array);
      expect(result).toBe(array);
    });

    it("should return original body when body is a Blob", () => {
      const blob = new Blob(["test"]);
      const result = unwrapApiResponse(blob);
      expect(result).toBe(blob);
    });

    it("should return original body when success property is undefined", () => {
      const body = { data: { test: "value" } };
      const result = unwrapApiResponse(body);
      expect(result).toBe(body);
    });

    it("should flatten when data is an object", () => {
      const body = {
        success: true,
        message: "Success",
        data: { id: 1, name: "test" },
      };
      const result = unwrapApiResponse(body);
      expect(result).toEqual({
        id: 1,
        name: "test",
        success: true,
        message: "Success",
      });
    });

    it("should handle empty object when data is undefined", () => {
      const body = {
        success: true,
        message: "Success",
      };
      const result = unwrapApiResponse(body);
      expect(result).toEqual({
        success: true,
        message: "Success",
      });
    });

    it("should wrap data in object when data is null", () => {
      const body = {
        success: true,
        message: "Success",
        data: null,
      };
      const result = unwrapApiResponse(body);
      expect(result).toEqual({
        data: null,
        success: true,
        message: "Success",
      });
    });

    it("should wrap data in object when data is an array", () => {
      const body = {
        success: true,
        message: "Success",
        data: [1, 2, 3],
      };
      const result = unwrapApiResponse(body);
      expect(result).toEqual({
        data: [1, 2, 3],
        success: true,
        message: "Success",
      });
    });

    it("should wrap data in object when data is a string", () => {
      const body = {
        success: true,
        message: "Success",
        data: "string value",
      };
      const result = unwrapApiResponse(body);
      expect(result).toEqual({
        data: "string value",
        success: true,
        message: "Success",
      });
    });

    it("should wrap data in object when data is a number", () => {
      const body = {
        success: true,
        message: "Success",
        data: 123,
      };
      const result = unwrapApiResponse(body);
      expect(result).toEqual({
        data: 123,
        success: true,
        message: "Success",
      });
    });

    it("should handle false success value", () => {
      const body = {
        success: false,
        message: "Error",
        data: { error: "details" },
      };
      const result = unwrapApiResponse(body);
      expect(result).toEqual({
        error: "details",
        success: false,
        message: "Error",
      });
    });

    it("should handle empty message", () => {
      const body = {
        success: true,
        message: "",
        data: { id: 1 },
      };
      const result = unwrapApiResponse(body);
      expect(result).toEqual({
        id: 1,
        success: true,
        message: "",
      });
    });
  });
});
