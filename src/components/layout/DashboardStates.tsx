/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import type { LoadingConfig } from "@components/layout/DashboardShell.types";

export const DashboardLoadingState = ({
  spinnerBorderClass,
  message,
  textClass,
  textStyle,
}: LoadingConfig) => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="flex flex-col items-center gap-3">
      <div
        className={`w-9 h-9 rounded-full border-4 border-blue-100 ${spinnerBorderClass} animate-spin`}
      />
      <p className={textClass} style={textStyle}>
        {message}
      </p>
    </div>
  </div>
);

export const DashboardErrorState = ({ error }: { error: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-6 py-4">
      <span className="text-red-500">⚠</span>
      <p className="text-sm text-red-600">{error}</p>
    </div>
  </div>
);

export const DashboardTabSkeleton = () => (
  <div className="w-full flex flex-col gap-4 animate-pulse pt-2">
    <div className="h-7 w-48 bg-slate-200 rounded-xl" />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="bg-white rounded-2xl border border-slate-100 p-5 h-24"
        />
      ))}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="bg-white rounded-2xl border border-slate-100 p-5 h-48" />
      <div className="bg-white rounded-2xl border border-slate-100 p-5 h-48" />
    </div>
  </div>
);
