/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { resetDashboardUser } from "@features/profile/models/dashboardUserSlice";
import { resetNotifications } from "@features/notifications/models/notificationsSlice";
import { resetConnectRequests } from "@features/connects/models/connectRequestsSlice";
import { resetWallet } from "@features/mentee/models/walletSlice";
import type { AppDispatch } from "@store/index";

/** Clears shared dashboard data when a dashboard session is unmounted. */
const useDashboardCleanup = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(
    () => () => {
      dispatch(resetDashboardUser());
      dispatch(resetNotifications());
      dispatch(resetConnectRequests());
      dispatch(resetWallet());
    },
    [dispatch],
  );
};

export default useDashboardCleanup;
