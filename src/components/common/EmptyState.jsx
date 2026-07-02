// src/components/common/EmptyState.jsx
import React from "react";
import PropTypes from "prop-types";

EmptyState.propTypes = {
  icon: PropTypes.node,
  title: PropTypes.string,
  message: PropTypes.string,
  action: PropTypes.node,
};

export default function EmptyState({
  icon,
  title = "No data found",
  message = "There's nothing here yet.",
  action = null,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200">
      <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-slate-50 text-slate-400">
        {icon || (
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-3.86a2 2 0 00-1.664.89l-.812 1.22A2 2 0 0110.07 19H3.93a2 2 0 01-1.664-1.11l-.812-1.22A2 2 0 005.86 13H2"
            />
          </svg>
        )}
      </div>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-xs text-slate-500 max-w-xs">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

