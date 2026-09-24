/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

const PageLoader = () => (
  <div
    className="min-h-screen flex items-center justify-center"
    style={{ background: "#f0f2f7" }}
  >
    <div className="flex flex-col items-center gap-3">
      <div className="w-9 h-9 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
      <p
        className="text-xs text-slate-400"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        Loading...
      </p>
    </div>
  </div>
);

export default PageLoader;
