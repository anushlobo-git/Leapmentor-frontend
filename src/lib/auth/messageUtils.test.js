/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import {
  INITIAL_MESSAGE_STATE,
  MESSAGE_TYPES,
  createErrorMessage,
  createSuccessMessage,
  createInfoMessage,
  clearMessage,
  AUTH_ERROR_MESSAGES,
  AUTH_SUCCESS_MESSAGES,
} from "./messageUtils";

describe("messageUtils", () => {
  describe("INITIAL_MESSAGE_STATE", () => {
    it("should have empty type and text", () => {
      expect(INITIAL_MESSAGE_STATE).toEqual({ type: "", text: "" });
    });
  });

  describe("MESSAGE_TYPES", () => {
    it("should have correct message types", () => {
      expect(MESSAGE_TYPES).toEqual({
        ERROR: "error",
        SUCCESS: "success",
        INFO: "info",
        WARNING: "warning",
      });
    });
  });

  describe("createErrorMessage", () => {
    it("should create error message with correct type", () => {
      const result = createErrorMessage("Test error");
      expect(result).toEqual({
        type: MESSAGE_TYPES.ERROR,
        text: "Test error",
      });
    });

    it("should handle empty text", () => {
      const result = createErrorMessage("");
      expect(result).toEqual({
        type: MESSAGE_TYPES.ERROR,
        text: "",
      });
    });
  });

  describe("createSuccessMessage", () => {
    it("should create success message with correct type", () => {
      const result = createSuccessMessage("Test success");
      expect(result).toEqual({
        type: MESSAGE_TYPES.SUCCESS,
        text: "Test success",
      });
    });

    it("should handle empty text", () => {
      const result = createSuccessMessage("");
      expect(result).toEqual({
        type: MESSAGE_TYPES.SUCCESS,
        text: "",
      });
    });
  });

  describe("createInfoMessage", () => {
    it("should create info message with correct type", () => {
      const result = createInfoMessage("Test info");
      expect(result).toEqual({
        type: MESSAGE_TYPES.INFO,
        text: "Test info",
      });
    });

    it("should handle empty text", () => {
      const result = createInfoMessage("");
      expect(result).toEqual({
        type: MESSAGE_TYPES.INFO,
        text: "",
      });
    });
  });

  describe("clearMessage", () => {
    it("should return initial message state", () => {
      const result = clearMessage();
      expect(result).toEqual(INITIAL_MESSAGE_STATE);
    });
  });

  describe("AUTH_ERROR_MESSAGES", () => {
    it("should have all error message constants", () => {
      expect(AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS).toBe(
        "Invalid email or password. Please try again."
      );
      expect(AUTH_ERROR_MESSAGES.EMAIL_NOT_VERIFIED).toBe(
        "Please verify your email first."
      );
      expect(AUTH_ERROR_MESSAGES.EMAIL_ALREADY_REGISTERED).toBe(
        "This email is already registered. Please login instead."
      );
      expect(AUTH_ERROR_MESSAGES.TERMS_NOT_ACCEPTED).toBe(
        "Please accept the terms and conditions to continue."
      );
      expect(AUTH_ERROR_MESSAGES.ROLE_MISSING).toBe(
        "Something went wrong — please refresh and try again."
      );
      expect(AUTH_ERROR_MESSAGES.MENTOR_NO_RATE).toBe(
        "Mentor has not set a session rate."
      );
      expect(AUTH_ERROR_MESSAGES.PAYMENT_FAILED).toBe(
        "Payment failed. Please try again."
      );
      expect(AUTH_ERROR_MESSAGES.NETWORK_ERROR).toBe(
        "Network error. Please check your connection and try again."
      );
    });

    it("should have INSUFFICIENT_TOKENS as a function", () => {
      expect(typeof AUTH_ERROR_MESSAGES.INSUFFICIENT_TOKENS).toBe("function");
      expect(AUTH_ERROR_MESSAGES.INSUFFICIENT_TOKENS(10)).toBe(
        "Need 10 more tokens."
      );
    });
  });

  describe("AUTH_SUCCESS_MESSAGES", () => {
    it("should have all success message constants", () => {
      expect(AUTH_SUCCESS_MESSAGES.SIGNUP_SUCCESSFUL).toBe(
        "Signup successful! Redirecting…"
      );
      expect(AUTH_SUCCESS_MESSAGES.LOGIN_SUCCESSFUL).toBe(
        "Login successful! Redirecting…"
      );
      expect(AUTH_SUCCESS_MESSAGES.EMAIL_VERIFIED).toBe(
        "Email verified successfully!"
      );
      expect(AUTH_SUCCESS_MESSAGES.PASSWORD_RESET).toBe(
        "Password reset successfully. Redirecting to login…"
      );
      expect(AUTH_SUCCESS_MESSAGES.OTP_SENT).toBe("OTP sent to your email.");
    });
  });
});
