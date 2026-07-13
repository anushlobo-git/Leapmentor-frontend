/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/admin/components/wallet/WalletRequestTable.jsx
import PropTypes from "prop-types";
import WalletStatusBadge from "./WalletStatusBadge";
import {
  getInitials,
  getAvatarColor,
  formatDate,
} from "../../pages/walletRequests.utils";

// ── Empty State ───────────────────────────────────────────────
export const EmptyState = ({ label }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-3">
    <div
      className="w-14 h-14 rounded-2xl flex items-center justify-center"
      style={{ background: "#f0f2f7" }}
    >
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#94a3b8"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
      </svg>
    </div>
    <p className="text-sm font-semibold text-slate-500">{label}</p>
  </div>
);

// ── Request Row ───────────────────────────────────────────────
export const RequestRow = ({
  req,
  onApprove,
  onReject,
  actionLoading,
  onViewHistory,
}) => {
  const name = req.mentee?.name || "Unknown";
  const email = req.mentee?.email || "—";
  const { bg, text } = getAvatarColor(name);
  const isLoading = actionLoading === req._id;

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
      <td className="px-5 py-3">
        <div className="flex items-center gap-3">
          {req.mentee?.profilePicture ? (
            <img
              src={req.mentee.profilePicture}
              alt={name}
              className="w-8 h-8 rounded-full object-cover shrink-0"
            />
          ) : (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: bg, color: text }}
            >
              {getInitials(name)}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-800 truncate">
              {name}
            </p>
            <p className="text-[10px] text-slate-400 truncate">{email}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-3">
        <div className="flex items-center gap-1.5">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="#F59E0B" />
            <text
              x="12"
              y="16"
              textAnchor="middle"
              fontSize="7"
              fontWeight="bold"
              fill="#92400E"
              fontFamily="serif"
            >
              LP
            </text>
          </svg>
          <span className="text-xs font-bold text-slate-700">
            {(req.currentBalance ?? 0).toLocaleString()} LP
          </span>
        </div>
      </td>
      <td className="px-5 py-3">
        <span className="text-xs text-slate-500">
          {formatDate(req.createdAt)}
        </span>
      </td>
      <td className="px-5 py-3">
        <WalletStatusBadge status={req.status} />
      </td>
      {/* View History button */}
      <td className="px-5 py-3">
        <button
          type="button"
          onClick={() => onViewHistory(req.mentee)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          History
        </button>
      </td>
      <td className="px-5 py-3">
        {req.status === "pending" ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onApprove(req._id)}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-white transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: isLoading ? "#6b7280" : "#16a34a" }}
            >
              {isLoading ? "Processing…" : "Approve +500 LP"}
            </button>
            <button
              type="button"
              onClick={() => onReject(req._id)}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-white transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: "#dc2626" }}
            >
              Reject
            </button>
          </div>
        ) : (
          <span className="text-[11px] text-slate-400 font-medium italic">
            {req.status === "approved" ? "500 LP added ✓" : "Request rejected"}
          </span>
        )}
      </td>
    </tr>
  );
};

// ── Toast ─────────────────────────────────────────────────────
export const Toast = ({ toast }) => {
  if (!toast) return null;
  const colors = {
    success: { bg: "#d1fae5", border: "#a7f3d0", text: "#065f46" },
    error: { bg: "#fee2e2", border: "#fecaca", text: "#b91c1c" },
  };
  const c = colors[toast.type] || colors.success;
  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold"
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.text,
      }}
    >
      {toast.message}
    </div>
  );
};

EmptyState.propTypes = {
  label: PropTypes.string.isRequired,
};

RequestRow.propTypes = {
  req: PropTypes.shape({
    _id: PropTypes.string,
    mentee: PropTypes.shape({
      name: PropTypes.string,
      email: PropTypes.string,
      profilePicture: PropTypes.string,
    }),
    currentBalance: PropTypes.number,
    createdAt: PropTypes.string,
    status: PropTypes.string,
  }).isRequired,
  onApprove: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
  actionLoading: PropTypes.string,
  onViewHistory: PropTypes.func.isRequired,
};

Toast.propTypes = {
  toast: PropTypes.shape({
    message: PropTypes.string,
    type: PropTypes.oneOf(["success", "error"]),
  }),
};
