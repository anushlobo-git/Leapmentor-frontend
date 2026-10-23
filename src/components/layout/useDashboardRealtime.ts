/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import useUnreadCount from "@features/notifications/presenters/useUnreadCount";
import useSocketToast from "@features/notifications/presenters/useSocketToast";

/** Coordinates live dashboard updates with notification badge state. */
const useDashboardRealtime = (refetch: () => Promise<void>) => {
  const { unreadCount, clearBadge, incrementBadge } = useUnreadCount();
  const onRequestChanged = refetch ? () => refetch() : undefined;

  useSocketToast(onRequestChanged, incrementBadge);

  return { unreadCount, clearBadge };
};

export default useDashboardRealtime;
