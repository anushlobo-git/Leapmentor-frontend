/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// Shared base style for FormField inputs/textareas. Kept in its own module
// (rather than exported from FormField.tsx) so that FormField.tsx exports
// only the component, satisfying react-refresh/only-export-components.
import type { CSSProperties } from "react";

export const FIELD_BASE_STYLE: CSSProperties = {
  padding: "11px 14px",
  borderRadius: 10,
  border: "1.5px solid #e2e8f0",
  fontSize: 14,
  outline: "none",
  color: "#0f172a",
  fontFamily: "inherit",
};
