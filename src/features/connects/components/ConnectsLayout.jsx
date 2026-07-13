/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/connects/components/ConnectsLayout.jsx
import PropTypes from "prop-types";
import Loader from "@components/common/Loader";

// ── Empty state ───────────────────────────────────────────────
const EmptyState = ({ message, subMessage, actionLabel, onAction }) => (
  <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col items-center justify-center py-20 text-center space-y-4">
    <div
      className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200
      flex items-center justify-center text-slate-300"
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    </div>
    <div className="space-y-1">
      <p className="text-sm font-bold text-slate-700">{message}</p>
      {subMessage && (
        <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
          {subMessage}
        </p>
      )}
    </div>
    {actionLabel && onAction && (
      <button
        type="button"
        onClick={onAction}
        className="px-4 py-2 rounded-xl bg-blue-900 text-white text-xs font-bold
          hover:bg-blue-700 transition-all"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

// ── Section divider ───────────────────────────────────────────
const SectionDivider = ({ label, count }) => (
  <div className="flex items-center gap-3 col-span-1 md:col-span-2 lg:col-span-3">
    <div className="flex-1 h-px bg-slate-100" />
    <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest whitespace-nowrap">
      {label} {count > 0 && `(${count})`}
    </span>
    <div className="flex-1 h-px bg-slate-100" />
  </div>
);

// ── Main Layout ───────────────────────────────────────────────
const ConnectsLayout = ({
  title,
  subtitle,
  count, // active count
  loading,
  error,
  emptyState,
  children, // active ConnectCards
  completedChildren, // ✅ completed ConnectCards
  completedCount, // ✅ completed count
}) => {
  const hasCompleted = completedCount > 0;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
          {subtitle && (
            <p className="text-sm text-blue-900 mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* Active count badge */}
        {!loading && count > 0 && (
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full
            bg-blue-50 border border-blue-100 text-blue-900 text-xs font-bold shrink-0"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            {count} Active {count === 1 ? "Session" : "Sessions"}
          </div>
        )}
      </div>

      {/* ── Error ── */}
      {error && (
        <div
          className="flex items-center gap-2 text-sm bg-red-50 border border-red-200
          text-red-600 rounded-xl px-4 py-3"
        >
          <span>⚠</span> {error}
        </div>
      )}

      {/* ── Active grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Loading */}
        {loading && (
          <div className="col-span-1 md:col-span-2 lg:col-span-3">
            <Loader minHeight={200} />
          </div>
        )}

        {/* Empty state — only show if no active AND no completed */}
        {!loading && !error && count === 0 && !hasCompleted && (
          <EmptyState {...emptyState} />
        )}

        {/* Active cards */}
        {!loading && !error && children}

        {/* ── Completed section ── */}
        {!loading && !error && hasCompleted && (
          <>
            <SectionDivider label="Completed Sessions" count={completedCount} />
            {completedChildren}
          </>
        )}
      </div>
    </div>
  );
};

EmptyState.propTypes = {
  message: PropTypes.string.isRequired,
  subMessage: PropTypes.string,
  actionLabel: PropTypes.string,
  onAction: PropTypes.func,
};

SectionDivider.propTypes = {
  label: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
};

ConnectsLayout.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  count: PropTypes.number.isRequired,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  emptyState: PropTypes.shape({
    message: PropTypes.string,
    subMessage: PropTypes.string,
    actionLabel: PropTypes.string,
    onAction: PropTypes.func,
  }),
  children: PropTypes.node,
  completedChildren: PropTypes.node,
  completedCount: PropTypes.number,
};

export default ConnectsLayout;
