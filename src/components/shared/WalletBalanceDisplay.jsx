/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import PropTypes from "prop-types";

/**
 * Reusable component for displaying wallet balance in payment modals
 */
const WalletBalanceDisplay = ({ fetching, walletBalance, insufficient }) => {
  if (fetching) {
    return (
      <span className="text-xs text-blue-400 animate-pulse">Loading...</span>
    );
  }

  if (walletBalance === null) {
    return <span className="text-xs text-blue-400">—</span>;
  }

  return (
    <span
      className={`text-xs font-bold ${insufficient ? "text-red-500" : "text-blue-900"}`}
    >
      {walletBalance} tokens
    </span>
  );
};

WalletBalanceDisplay.propTypes = {
  fetching: PropTypes.bool.isRequired,
  walletBalance: PropTypes.number,
  insufficient: PropTypes.bool.isRequired,
};

export default WalletBalanceDisplay;
