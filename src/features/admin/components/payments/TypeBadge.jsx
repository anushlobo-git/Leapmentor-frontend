/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/admin/components/payments/TypeBadge.jsx
import PropTypes from "prop-types";
import {
  FONT,
  TYPE_CONFIG,
} from "@features/admin/constants/payments.constants";

const TypeBadge = ({ type }) => {
  const cfg = TYPE_CONFIG[type] || {
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

TypeBadge.propTypes = {
  type: PropTypes.string,
};

export default TypeBadge;
