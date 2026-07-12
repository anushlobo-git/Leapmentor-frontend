/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import PropTypes from "prop-types";

export const TokenIcon = ({ size = 13 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v12M9 9h4.5a2.5 2.5 0 0 1 0 5H9" />
  </svg>
);

export const LockIcon = ({ size = 13 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

TokenIcon.propTypes = { size: PropTypes.number };
LockIcon.propTypes = { size: PropTypes.number };
