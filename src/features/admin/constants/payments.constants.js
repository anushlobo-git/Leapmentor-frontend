/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/admin/constants/payments.constants.js

export const FONT = "'DM Sans', sans-serif";
export const MONO = "'DM Mono', monospace";

// Stable identifiers + widths for the loading skeleton
// (avoids array index as key, avoids unnecessary array cloning)
export const SKELETON_ROW_IDS = [
  "sk-row-1",
  "sk-row-2",
  "sk-row-3",
  "sk-row-4",
  "sk-row-5",
];
export const SKELETON_COL_IDS = [
  "sk-col-1",
  "sk-col-2",
  "sk-col-3",
  "sk-col-4",
  "sk-col-5",
  "sk-col-6",
];
export const SKELETON_COL_WIDTHS = [100, 130, 70, 70, 70, 70];

export const TYPE_CONFIG = {
  credit: {
    bg: "#f0fdf4",
    color: "#059669",
    border: "#bbf7d0",
    label: "Commission",
  },
  escrow_hold: {
    bg: "#eff6ff",
    color: "#2563eb",
    border: "#bfdbfe",
    label: "Escrow",
  },
  escrow_release: {
    bg: "#f5f3ff",
    color: "#7c3aed",
    border: "#ddd6fe",
    label: "Released",
  },
  escrow_refund: {
    bg: "#fef2f2",
    color: "#dc2626",
    border: "#fecaca",
    label: "Refund",
  },
  commission_deduct: {
    bg: "#f0fdf4",
    color: "#059669",
    border: "#bbf7d0",
    label: "Commission",
  },
  mentor_payout: {
    bg: "#f5f3ff",
    color: "#7c3aed",
    border: "#ddd6fe",
    label: "Received",
  },
  debit: {
    bg: "#fef2f2",
    color: "#dc2626",
    border: "#fecaca",
    label: "Payout",
  },
};

export const STATUS_CONFIG = {
  completed: { color: "#059669", dot: "#22c55e", label: "COMPLETED" },
  pending: { color: "#d97706", dot: "#f59e0b", label: "PENDING" },
  refunded: { color: "#dc2626", dot: "#ef4444", label: "REFUNDED" },
};

export const TYPE_FILTERS = [
  { key: "", label: "All" },
  { key: "commission_deduct", label: "Commission" },
  { key: "mentor_payout", label: "Received" },
  { key: "debit", label: "Payout" },
  { key: "escrow_hold", label: "Escrow Hold" },
  { key: "escrow_refund", label: "Refund" },
];

export const TABLE_COLUMNS = [
  "TRANSACTION ID",
  "USER",
  "AMOUNT",
  "TYPE",
  "DATE",
  "STATUS",
];
