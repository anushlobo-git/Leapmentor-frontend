/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

/**
 * Format a number as a fixed 2-decimal, thousands-separated string.
 * e.g. formatDecimal(1234.5) -> "1,234.50"
 */

//n can be both number or the string so we have to use the union types

type Input = number | string | null  | undefined ;
export const formatDecimal = (n : Input  ) =>
  Number(n || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
