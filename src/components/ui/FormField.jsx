/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/components/ui/FormField.jsx
// A single, reusable text-input/textarea with consistent styling and a
// focus/blur border-color transition. Previously this exact style block +
// onFocus/onBlur pair was copy-pasted per screen (HelpCenter, LeapBuddy,
// and several admin pages) — centralizing it here means one change updates
// every consumer instead of N near-identical inline style objects.

import PropTypes from "prop-types";

export const FIELD_BASE_STYLE = {
  padding: "11px 14px",
  borderRadius: 10,
  border: "1.5px solid #e2e8f0",
  fontSize: 14,
  outline: "none",
  color: "#0f172a",
  fontFamily: "inherit",
};

const DEFAULT_BORDER_COLOR = "#e2e8f0";

export default function FormField({
  as = "input",
  style,
  focusColor = "#4f46e5",
  ...rest
}) {
  const Tag = as;
  return (
    <Tag
      {...rest}
      style={{ ...FIELD_BASE_STYLE, ...style }}
      onFocus={(e) => {
        e.target.style.borderColor = focusColor;
      }}
      onBlur={(e) => {
        e.target.style.borderColor = DEFAULT_BORDER_COLOR;
      }}
    />
  );
}

FormField.propTypes = {
  as: PropTypes.elementType,
  style: PropTypes.object,
  focusColor: PropTypes.string,
};
