/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getEscrowStatus } from "@features/connects/models/escrow.api";
import {
  walletSynced,
  selectWalletBalanceOrNull,
} from "@features/mentee/models/walletSlice";
import type { AppDispatch } from "@store/index";
import logger from "@lib/monitoring/logger";

/**
 * Shared hook for escrow payment logic
 * Handles commission rates and payment calculations. The wallet balance itself lives in
 * walletSlice: the escrow-status response carries a fresh one, so it is synced there and read back.
 */
export const useEscrowPayment = (
  connectId: string | undefined,
  defaultSessionRate = 0,
  defaultCommissionRate = 20,
) => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const dispatch = useDispatch<AppDispatch>();
  // `null` until a balance is known (rendered as "—" by the payment UIs).
  const walletBalance = useSelector(selectWalletBalanceOrNull);
  const [commissionRate, setCommissionRate] = useState(defaultCommissionRate);
  const [remoteSessionRate, setRemoteSessionRate] = useState<number | null>(null);
  const [remoteSessionCount, setRemoteSessionCount] = useState<number | null>(null);

  const sessionRate = remoteSessionRate ?? defaultSessionRate;

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setFetching(true);
        const data = await getEscrowStatus(connectId);
        if (typeof data?.wallet?.balance === "number")
          dispatch(walletSynced({ balance: data.wallet.balance }));
        if (data?.commissionRate != null)
          setCommissionRate(data.commissionRate);
        if (data?.sessionRate != null) setRemoteSessionRate(data.sessionRate);
        if (data?.sessionCount != null)
          setRemoteSessionCount(data.sessionCount);
      } catch (err) {
        logger.warn("⚠️ Could not fetch escrow status:", {
          error: err.response?.data || err.message,
        });
      } finally {
        setFetching(false);
      }
    };

    if (connectId) fetchStatus();
  }, [connectId, dispatch]);

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
