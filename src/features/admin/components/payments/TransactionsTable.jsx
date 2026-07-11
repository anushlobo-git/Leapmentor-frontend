/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/admin/components/payments/TransactionsTable.jsx
import PropTypes from "prop-types";
import Avatar from "@features/admin/components/payments/Avatar";
import TypeBadge from "@features/admin/components/payments/TypeBadge";
import TxStatusBadge from "@features/admin/components/payments/TxStatusBadge";
import {
  FONT,
  MONO,
  SKELETON_ROW_IDS,
  SKELETON_COL_IDS,
  SKELETON_COL_WIDTHS,
  TYPE_FILTERS,
  TABLE_COLUMNS,
} from "@features/admin/constants/payments.constants";

// ── SonarQube fix #1: "Extract this nested ternary operation into an
// independent statement." The original code nested a ternary inside a
// ternary directly in JSX (loading ? … : transactions.length === 0 ? … : …).
// It's pulled out into a plain function with early returns instead. ──
const renderTableBody = ({ loading, transactions }) => {
  if (loading) {
    return SKELETON_ROW_IDS.map((rowId) => (
      <tr key={rowId} style={{ borderBottom: "1px solid #f1f5f9" }}>
        {SKELETON_COL_IDS.map((colId, j) => (
          <td key={colId} className="px-5 py-4">
            <div
              className="h-4 rounded-lg animate-pulse"
              style={{ background: "#f1f5f9", width: SKELETON_COL_WIDTHS[j] }}
            />
          </td>
        ))}
      </tr>
    ));
  }

  if (transactions.length === 0) {
    return (
      <tr>
        <td colSpan={6} className="text-center py-16 text-sm text-slate-400">
          No transactions found.
        </td>
      </tr>
    );
  }

  return transactions.map((tx) => (
    <tr
      key={tx.id}
      className="transition-colors"
      style={{ borderBottom: "1px solid #f1f5f9" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#fafbfc")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <td className="px-5 py-4">
        <span
          className="text-xs font-100 text-slate-800"
          style={{ fontFamily: MONO, fontWeight: 500 }}
        >
          {tx.txId}
        </span>
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-2.5">
          <Avatar name={tx.user?.name} />
          <div>
            <p
              className="text-xs font-600 text-slate-900 leading-none"
              style={{ fontWeight: 600 }}
            >
              {tx.user?.name}
            </p>
            <p
              className="text-[10px] text-slate-600 mt-0.5"
              style={{ fontFamily: MONO }}
            >
              {tx.user?.email}
            </p>
          </div>
        </div>
      </td>
      <td className="px-5 py-4">
        <span
          className="text-xs font-500 text-slate-800"
          style={{ fontFamily: MONO, fontWeight: 500 }}
        >
          {tx.amount?.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      </td>
      <td className="px-5 py-4">
        <TypeBadge type={tx.type} />
      </td>
      <td className="px-5 py-4">
        <span className="text-xs text-slate-800" style={{ fontFamily: MONO }}>
          {tx.date}
        </span>
      </td>
      <td className="px-5 py-4">
        <TxStatusBadge status={tx.status} />
      </td>
    </tr>
  ));
};

// ── SonarQube fix #2: "Unnecessarily cloning an array." The original code
// did `[...new Array(n)]` which builds an array then immediately clones it
// via spread just to map over it. `Array.from({ length: n }, mapper)`
// builds the final array directly, with no intermediate clone. ──
const getPageNumbers = (totalPages) =>
  Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1);

const TransactionsTable = ({
  transactions,
  loading,
  pagination,
  search,
  typeFilter,
  onSearchChange,
  onTypeFilterChange,
  onPageChange,
}) => {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "#ffffff", border: "1px solid #e8eaf0" }}
    >
      <div
        className="px-6 py-4 border-b space-y-3"
        style={{ borderColor: "#e8eaf0" }}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p
              className="text-sm font-700 text-slate-800"
              style={{ fontWeight: 700, fontFamily: FONT }}
            >
              Transaction History
            </p>
            <p className="text-xs text-slate-600 mt-0.5">
              {pagination.totalCount} total transactions
            </p>
          </div>

          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2"
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search user..."
              className="pl-8 pr-3 py-1.5 rounded-xl text-xs outline-none transition-all"
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                width: 200,
                fontFamily: FONT,
                color: "#334155",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#93c5fd")}
              onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
            />
          </div>
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {TYPE_FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => onTypeFilterChange(key)}
              className="px-3 py-1.5 rounded-xl text-xs font-600 transition-all"
              style={{
                fontWeight: 600,
                fontFamily: FONT,
                background: typeFilter === key ? "#2563eb" : "#f1f5f9",
                color: typeFilter === key ? "white" : "#475569",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full" style={{ fontFamily: FONT }}>
          <thead>
            <tr
              style={{
                background: "#f1f5f9",
                borderBottom: "2px solid #e2e8f0",
              }}
            >
              {TABLE_COLUMNS.map((h) => (
                <th
                  key={h}
                  className="text-left px-5 py-3 text-[10px] uppercase tracking-widest"
                  style={{
                    color: "#334155",
                    fontWeight: 800,
                    letterSpacing: "0.12em",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{renderTableBody({ loading, transactions })}</tbody>
        </table>
      </div>

      <div
        className="flex items-center justify-between px-6 py-4 border-t"
        style={{ borderColor: "#e8eaf0" }}
      >
        <p className="text-xs text-slate-600" style={{ fontFamily: MONO }}>
          Showing {transactions.length} of {pagination.totalCount} transactions
        </p>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onPageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage <= 1}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-xs font-600 transition-all disabled:opacity-30"
            style={{ background: "#f1f5f9", color: "#475569" }}
          >
            ‹
          </button>
          {getPageNumbers(pagination.totalPages).map((p) => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-xs font-600 transition-all"
              style={{
                fontWeight: 600,
                background:
                  pagination.currentPage === p ? "#2563eb" : "#f1f5f9",
                color: pagination.currentPage === p ? "white" : "#475569",
              }}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => onPageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage >= pagination.totalPages}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-xs font-600 transition-all disabled:opacity-30"
            style={{ background: "#f1f5f9", color: "#475569" }}
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
};

TransactionsTable.propTypes = {
  transactions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      txId: PropTypes.string,
      user: PropTypes.shape({
        name: PropTypes.string,
        email: PropTypes.string,
      }),
      amount: PropTypes.number,
      type: PropTypes.string,
      date: PropTypes.string,
      status: PropTypes.string,
    }),
  ).isRequired,
  loading: PropTypes.bool.isRequired,
  pagination: PropTypes.shape({
    totalCount: PropTypes.number,
    currentPage: PropTypes.number,
    totalPages: PropTypes.number,
  }).isRequired,
  search: PropTypes.string.isRequired,
  typeFilter: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  onTypeFilterChange: PropTypes.func.isRequired,
  onPageChange: PropTypes.func.isRequired,
};

export default TransactionsTable;
