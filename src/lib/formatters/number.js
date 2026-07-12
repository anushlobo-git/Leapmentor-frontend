/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

/**
 * Format a number as a fixed 2-decimal, thousands-separated string.
 * e.g. formatDecimal(1234.5) -> "1,234.50"
 */
export const formatDecimal = (n) =>
  Number(n || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
