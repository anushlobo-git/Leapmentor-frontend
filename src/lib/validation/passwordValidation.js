/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// Centralized password validation and strength utilities
// Used across all auth forms (Register, Login, ForgotPassword, etc.)

const PASSWORD_RULES = [
  { id: "length", label: "At least 8 characters", test: (p) => p.length >= 8 },
  {
    id: "uppercase",
    label: "At least 1 uppercase letter",
    test: (p) => /[A-Z]/.test(p),
  },
  { id: "number", label: "At least 1 number", test: (p) => /\d/.test(p) },
  {
    id: "special",
    label: "At least 1 special character",
    test: (p) => /[^A-Za-z0-9]/.test(p),
  },
];

/**
 * Get password validation result with rules and pass count
 */
export const getPasswordValidation = (password) => {
  const passed = PASSWORD_RULES.filter((r) => r.test(password)).length;
  return {
    rules: PASSWORD_RULES,
    passed,
    total: PASSWORD_RULES.length,
  };
};

/**
 * Get password strength indicator (label, color, width)
 */
export const getPasswordStrength = (passed) => {
  if (passed <= 1) return { label: "Weak", color: "#ef4444", width: "25%" };
  if (passed === 2) return { label: "Fair", color: "#f59e0b", width: "50%" };
  if (passed === 3) return { label: "Good", color: "#3b82f6", width: "75%" };
  return { label: "Strong", color: "#22c55e", width: "100%" };
};

/**
 * Get password rules array for rendering checklist
 */
export const getPasswordRules = () => PASSWORD_RULES;
