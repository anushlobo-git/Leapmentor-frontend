/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/components/ui/FormField.jsx
// A single, reusable text-input/textarea with consistent styling and a
// focus/blur border-color transition. Previously this exact style block +
// onFocus/onBlur pair was copy-pasted per screen (HelpCenter, LeapBuddy,
// and several admin pages) — centralizing it here means one change updates
// every consumer instead of N near-identical inline style objects.

import type { ElementType, CSSProperties, FocusEvent } from "react";
import { FIELD_BASE_STYLE } from "./fieldStyles";

const DEFAULT_BORDER_COLOR = "#e2e8f0";

interface FormFieldProps {
  as?: ElementType;
  style?: CSSProperties;
  focusColor?: string;
  [key: string]: unknown;
}

export default function FormField({
  as = "input",
  style,
  focusColor = "#4f46e5",
  ...rest
}: Readonly<FormFieldProps>) {
  const Tag = as;
  return (
    <Tag
      {...rest}
      style={{ ...FIELD_BASE_STYLE, ...style }}
      onFocus={(e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        e.target.style.borderColor = focusColor;
      }}
      onBlur={(e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        e.target.style.borderColor = DEFAULT_BORDER_COLOR;
      }}
    />
  );
}
