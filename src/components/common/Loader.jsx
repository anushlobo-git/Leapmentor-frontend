/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// Single, reusable inline loading spinner — use this instead of
// per-item skeleton placeholders anywhere inside a dashboard tab.
// (For full-page/route-transition loading, keep using FullScreenLoader.)
import PropTypes from "prop-types";

const SIZE_MAP = {
  sm: { box: 20, stroke: 3 },
  md: { box: 32, stroke: 3.5 },
  lg: { box: 40, stroke: 4 },
};

const Loader = ({ size = "md", message, className = "", minHeight }) => {
  const { box, stroke } = SIZE_MAP[size] || SIZE_MAP.md;

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
      style={minHeight ? { minHeight } : undefined}
    >
      <svg
        className="animate-spin"
        width={box}
        height={box}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="20" cy="20" r="16" stroke="#e2e8f0" strokeWidth={stroke} />
        <path
          d="M20 4a16 16 0 0 1 16 16"
          stroke="#1e3a8a"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
      </svg>
      {message && (
        <p className="text-sm font-semibold text-slate-500">{message}</p>
      )}
    </div>
  );
};

Loader.propTypes = {
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  message: PropTypes.string,
  className: PropTypes.string,
  minHeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default Loader;
