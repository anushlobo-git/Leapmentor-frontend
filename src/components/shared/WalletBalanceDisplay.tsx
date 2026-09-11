/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

interface WalletBalanceDisplayProps {
  fetching?: boolean;
  walletBalance?: number | null;
  insufficient?: boolean;
}

/**
 * Reusable component for displaying wallet balance in payment modals
 */
const WalletBalanceDisplay = ({ fetching, walletBalance, insufficient }: WalletBalanceDisplayProps) => {
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

export default WalletBalanceDisplay;
