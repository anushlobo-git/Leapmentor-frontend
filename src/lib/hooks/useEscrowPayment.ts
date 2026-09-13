/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { useState, useEffect } from "react";
import { getEscrowStatus } from "@features/connects/models/escrow.api";
import logger from "@lib/logger";

/**
 * Shared hook for escrow payment logic
 * Handles wallet balance fetching, commission rates, and payment calculations
 */
export const useEscrowPayment = (
  connectId: string | undefined,
  defaultSessionRate = 0,
  defaultCommissionRate = 20,
) => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [commissionRate, setCommissionRate] = useState(defaultCommissionRate);
  const [remoteSessionRate, setRemoteSessionRate] = useState<number | null>(null);
  const [remoteSessionCount, setRemoteSessionCount] = useState<number | null>(null);

  const sessionRate = remoteSessionRate ?? defaultSessionRate;

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setFetching(true);
        const data = await getEscrowStatus(connectId);
        setWalletBalance(data?.wallet?.balance ?? null);
        if (data?.commissionRate != null)
          setCommissionRate(data.commissionRate);
        if (data?.sessionRate != null) setRemoteSessionRate(data.sessionRate);
        if (data?.sessionCount != null)
          setRemoteSessionCount(data.sessionCount);
      } catch (err: any) {
        logger.warn("⚠️ Could not fetch escrow status:", {
          error: err.response?.data || err.message,
        });
      } finally {
        setFetching(false);
      }
    };

    if (connectId) fetchStatus();
  }, [connectId]);

  return {
    loading,
    setLoading,
    fetching,
    error,
    setError,
    walletBalance,
    commissionRate,
    sessionRate,
    remoteSessionCount,
  };
};
