/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// Common message state management utilities for auth forms
// Used across RegisterForm, LoginForm, ForgotPassword, etc.

/**
 * Initial message state
 */
export const INITIAL_MESSAGE_STATE = { type: "", text: "" };

/**
 * Message types
 */
export const MESSAGE_TYPES = {
  ERROR: "error",
  SUCCESS: "success",
  INFO: "info",
  WARNING: "warning",
};

/**
 * Create error message
 */
export const createErrorMessage = (text) => ({
  type: MESSAGE_TYPES.ERROR,
  text,
});

/**
 * Create success message
 */
export const createSuccessMessage = (text) => ({
  type: MESSAGE_TYPES.SUCCESS,
  text,
});

/**
 * Create info message
 */
export const createInfoMessage = (text) => ({
  type: MESSAGE_TYPES.INFO,
  text,
});

/**
 * Clear message
 */
export const clearMessage = () => INITIAL_MESSAGE_STATE;

/**
 * Common auth error messages
 */
export const AUTH_ERROR_MESSAGES = {
  INVALID_CREDENTIALS: "Invalid email or password. Please try again.",
  EMAIL_NOT_VERIFIED: "Please verify your email first.",
  EMAIL_ALREADY_REGISTERED:
    "This email is already registered. Please login instead.",
  TERMS_NOT_ACCEPTED: "Please accept the terms and conditions to continue.",
  ROLE_MISSING: "Something went wrong — please refresh and try again.",
  MENTOR_NO_RATE: "Mentor has not set a session rate.",
  INSUFFICIENT_TOKENS: (needed) => `Need ${needed} more tokens.`,
  PAYMENT_FAILED: "Payment failed. Please try again.",
  NETWORK_ERROR: "Network error. Please check your connection and try again.",
};

/**
 * Common success messages
 */
export const AUTH_SUCCESS_MESSAGES = {
  SIGNUP_SUCCESSFUL: "Signup successful! Redirecting…",
  LOGIN_SUCCESSFUL: "Login successful! Redirecting…",
  EMAIL_VERIFIED: "Email verified successfully!",
  PASSWORD_RESET: "Password reset successfully. Redirecting to login…",
  OTP_SENT: "OTP sent to your email.",
};
