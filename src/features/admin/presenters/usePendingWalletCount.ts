/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

/**
 * usePendingWalletCount.ts
Owns:
Pending wallet-request API call
Pending count state
API failure handling
 */

import { useEffect, useState } from "react";
import { getPendingLeapRequestsCount } from "@features/admin/models/admin.api";

/** Loads the pending wallet-request count used by the admin navigation badge. */
const usePendingWalletCount = () => {
  const [pendingWalletCount, setPendingWalletCount] = useState(0);

  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const res = await getPendingLeapRequestsCount();
        setPendingWalletCount(res.data.count ?? 0);
      } catch {
        // The navigation can safely render without a badge.
      }
    };

    fetchPendingCount();
  }, []);

  return pendingWalletCount;
};

export default usePendingWalletCount;
