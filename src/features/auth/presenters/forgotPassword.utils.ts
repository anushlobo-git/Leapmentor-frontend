/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// Utilities for ForgotPassword page component
// Imports centralized password validation from shared lib

import {
  getPasswordValidation,
  getPasswordStrength,
} from "@lib/validation/passwordValidation";

// ── Steps: 1 = enter email, 2 = enter OTP, 3 = new password ──
export const STEPS = { EMAIL: 1, OTP: 2, PASSWORD: 3 };

// Re-export centralized password validation for backward compatibility
export const validatePassword = (password) => {
  return getPasswordValidation(password);
};

export const getStrength = (passed) => {
  return getPasswordStrength(passed);
};

// Used for the 3-dot step progress indicator. Extracted out of a nested
// ternary in the JSX (Sonar: "Extract this nested ternary operation into an
// independent statement").
export const getStepDotClass = (dotStep, currentStep) => {
  if (dotStep === currentStep) return "w-6 h-2.5 bg-blue-900";
  if (dotStep < currentStep) return "w-2.5 h-2.5 bg-blue-300";
  return "w-2.5 h-2.5 bg-slate-200";
};
