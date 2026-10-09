/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

//src/features/connects/views/components/ConnectsLayout.tsx
// Before, this file had two responsibilities:
// 1. Display the connections layout.
// 2. Build the empty-state UI.

//created new file called src/features/connects/views/components/ConnectsEmptyState.tsx

// New responsibilities

// ConnectsLayout

// Now handles only:
// - Page title
// - Subtitle
// - Active count
// - Error message
// - Loading state
// - Active connection cards
// - Completed connection cards

// ConnectsEmptyState

// Now handles only:
// - Empty icon
// - Empty message
// - Optional sub-message
// - Optional action button
// - Empty-state layout

// Before:
// ConnectsLayout = layout + empty UI
// After:
// ConnectsLayout = layout
// ConnectsEmptyState = empty UI

// src/features/connects/components/ConnectsLayout.jsx
import type { ReactNode } from "react";
import Loader from "@components/shared/Loader";
import ConnectsEmptyState, {
  type EmptyStateConfig,
} from "@features/connects/views/components/ConnectsEmptyState";

// ── Section divider ───────────────────────────────────────────
const SectionDivider = ({ label, count }: { label: string; count: number }) => (
  <div className="flex items-center gap-3 col-span-1 md:col-span-2 lg:col-span-3">
    <div className="flex-1 h-px bg-slate-100" />
    <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest whitespace-nowrap">
      {label} {count > 0 && `(${count})`}
    </span>
    <div className="flex-1 h-px bg-slate-100" />
  </div>
);

// ── Main Layout ───────────────────────────────────────────────
interface ConnectsLayoutProps {
  title: string;
  subtitle?: string;
  count: number;
  loading: boolean;
  error?: string;
  emptyState?: EmptyStateConfig;
  children?: ReactNode;
  completedChildren?: ReactNode;
  completedCount?: number;
}

const ConnectsLayout = ({
  title,
  subtitle,
  count, // active count
  loading,
  error,
  emptyState,
  children, // active ConnectCards
  completedChildren, // ✅ completed ConnectCards
  completedCount = 0, // ✅ completed count
}: ConnectsLayoutProps) => {
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
           <ConnectsEmptyState {...emptyState} />
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




export default ConnectsLayout;
