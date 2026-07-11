/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/admin/components/wallet/WalletStatusBadge.jsx
import PropTypes from "prop-types";

const STATUS_STYLES = {
  pending: {
    bg: "#fef3c7",
    text: "#92400e",
    border: "#fde68a",
    label: "Pending",
  },
  approved: {
    bg: "#d1fae5",
    text: "#065f46",
    border: "#a7f3d0",
    label: "Approved",
  },
  rejected: {
    bg: "#fee2e2",
    text: "#b91c1c",
    border: "#fecaca",
    label: "Rejected",
  },
  completed: {
    bg: "#dbeafe",
    text: "#1e3a8a",
    border: "#bfdbfe",
    label: "Completed",
  },
  accepted: {
    bg: "#d1fae5",
    text: "#065f46",
    border: "#a7f3d0",
    label: "Accepted",
  },
  cancelled: {
    bg: "#f1f5f9",
    text: "#64748b",
    border: "#e2e8f0",
    label: "Cancelled",
  },
  paid: { bg: "#d1fae5", text: "#065f46", border: "#a7f3d0", label: "Paid" },
  unpaid: {
    bg: "#fef3c7",
    text: "#92400e",
    border: "#fde68a",
    label: "Unpaid",
  },
};

const WalletStatusBadge = ({ status }) => {
  const s = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return (
    <span
      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
      style={{
        background: s.bg,
        color: s.text,
        border: `1px solid ${s.border}`,
      }}
    >
      {s.label}
    </span>
  );
};

WalletStatusBadge.propTypes = {
  status: PropTypes.string,
};

export default WalletStatusBadge;
