/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/admin/components/payments/TxStatusBadge.tsx
import {
  FONT,
  STATUS_CONFIG,
} from "@features/admin/constants/payments.constants";

interface TransactionStatusConfig {
  color: string;
  dot: string;
  label?: string;
}

export interface TxStatusBadgeProps {
  status?: string;
}

const TxStatusBadge = ({ status }: TxStatusBadgeProps) => {
  const cfg: TransactionStatusConfig =
    (status && STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]) || {
    color: "#64748b",
    dot: "#94a3b8",
    label: status?.toUpperCase(),
  };
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[10px] uppercase"
      style={{
        color: cfg.color,
        fontWeight: 600,
        letterSpacing: "0.05em",
        fontFamily: FONT,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: cfg.dot }}
      />
      {cfg.label}
    </span>
  );
};

export default TxStatusBadge;
