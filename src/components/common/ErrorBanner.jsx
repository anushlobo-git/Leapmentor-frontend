/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/components/common/ErrorBanner.jsx
import PropTypes from "prop-types";

const SIZE_CLASSES = {
  sm: "text-xs",
  md: "text-sm",
};

const ErrorBanner = ({ message, size = "md", className = "" }) => {
  if (!message) return null;

  return (
    <div
      className={`flex items-center gap-2 ${SIZE_CLASSES[size]} bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 ${className}`}
    >
      <span>⚠</span> {message}
    </div>
  );
};

ErrorBanner.propTypes = {
  message: PropTypes.string,
  size: PropTypes.oneOf(["sm", "md"]),
  className: PropTypes.string,
};

export default ErrorBanner;
