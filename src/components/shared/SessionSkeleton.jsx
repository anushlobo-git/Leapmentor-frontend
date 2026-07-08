/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import PropTypes from "prop-types";

const SessionSkeleton = ({ size }) => {
  const isCompact = size === "compact";
  return (
    <div className={`bg-white rounded-2xl border border-slate-100 ${isCompact ? "px-3 py-2.5" : "px-4 py-3.5"} flex items-center gap-3 shadow-sm animate-pulse`}>
      <div className={`${isCompact ? "w-9 h-11" : "w-11 h-14"} rounded-xl bg-slate-200 shrink-0`} />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 bg-slate-200 rounded w-3/5" />
        <div className="h-2.5 bg-slate-100 rounded w-2/5" />
      </div>
      {!isCompact && <div className="h-8 w-24 bg-slate-200 rounded-lg" />}
    </div>
  );
};

SessionSkeleton.propTypes = { size: PropTypes.oneOf(["default", "compact"]) };
SessionSkeleton.defaultProps = { size: "default" };

export default SessionSkeleton;
