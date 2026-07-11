/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/admin/components/payments/TxStatusBadge.jsx
import PropTypes from "prop-types";
import {
  FONT,
  STATUS_CONFIG,
} from "@features/admin/constants/payments.constants";

const TxStatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || {
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

TxStatusBadge.propTypes = {
  status: PropTypes.string,
};

export default TxStatusBadge;
