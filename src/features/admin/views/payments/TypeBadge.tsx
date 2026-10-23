/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/admin/components/payments/TypeBadge.tsx
import {
  FONT,
  TYPE_CONFIG,
} from "@features/admin/models/payments.constants";

interface TransactionTypeConfig {
  bg: string;
  color: string;
  border: string;
  label?: string | null;
}

export interface TypeBadgeProps {
  type?: string | null;
}

const TypeBadge = ({ type }: TypeBadgeProps) => {
  const cfg: TransactionTypeConfig =
    (type && TYPE_CONFIG[type as keyof typeof TYPE_CONFIG]) || {
    bg: "#f8fafc",
    color: "#64748b",
    border: "#e2e8f0",
    label: type,
  };
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-700 uppercase tracking-wide"
      style={{
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        fontWeight: 700,
        letterSpacing: "0.06em",
        fontFamily: FONT,
      }}
    >
      {cfg.label}
    </span>
  );
};

export default TypeBadge;
