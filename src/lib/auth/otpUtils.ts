/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// Common OTP input handling utilities for auth flows
// Used in VerifyEmail, ForgotPassword, and other OTP-based auth pages

/**
 * Handle OTP input change - only allows digits
 * @param {string} idPrefix - DOM id prefix for the OTP boxes (default "otp").
 *   Pass a distinct prefix (e.g. "votp") when a page needs unique DOM ids.
 */
export const handleOtpChange = (
  value: string,
  index: number,
  otpArray: string[],
  setOtpArray: (value: string[]) => void,
  idPrefix: string = "otp",
) => {
  if (!/^\d?$/.test(value)) return;
  const newOtp = [...otpArray];
  newOtp[index] = value;
  setOtpArray(newOtp);

  // Auto-focus next box
  if (value && index < 5) {
    document.getElementById(`${idPrefix}-${index + 1}`)?.focus();
  }
};

/**
 * Handle backspace in OTP input
 */
export const handleOtpKeyDown = (
  event: React.KeyboardEvent<HTMLInputElement>,
  index: number,
  otpArray: string[],
  idPrefix: string = "otp",
) => {
  if (event.key === "Backspace" && !otpArray[index] && index > 0) {
    document.getElementById(`${idPrefix}-${index - 1}`)?.focus();
  }
};

/**
 * Handle paste event in OTP input
 */
export const handleOtpPaste = (
  event: React.ClipboardEvent<HTMLElement>,
  _otpArray: string[],
  setOtpArray: (value: string[]) => void,
  idPrefix: string = "otp",
) => {
  const pastedData = event.clipboardData
    .getData("text")
    .replace(/\D/g, "")
    .slice(0, 6);

  if (pastedData.length === 6) {
    setOtpArray(pastedData.split(""));
    document.getElementById(`${idPrefix}-5`)?.focus();
  }

  event.preventDefault();
};

/**
 * Convert OTP array to string
 */
export const getOtpString = (otpArray: string[]) => otpArray.join("");

/**
 * Reset OTP array
 */
export const resetOtp = () => ["", "", "", "", "", ""];

/**
 * Get OTP input styling classes
 */
export const getOtpInputClasses = () =>
  "w-10 h-10 text-center text-lg font-semibold border-2 border-slate-200 rounded-lg focus:border-blue-900 focus:ring-2 focus:ring-blue-100 outline-none transition-all";
import type React from "react";
