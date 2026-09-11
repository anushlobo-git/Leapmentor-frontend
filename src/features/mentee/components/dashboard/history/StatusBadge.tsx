/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/components/mentee/dashboard/history/StatusBadge.jsx
import { STATUS_STYLES } from "@features/mentee/components/dashboard/history/constants";

interface StatusBadgeProps {
  status: string | number;
}

const StatusBadge = ({ status }: StatusBadgeProps) => (
  <span className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded-full capitalize w-fit ${STATUS_STYLES[status as keyof typeof STATUS_STYLES]}`}>
    {status}
  </span>
);

export default StatusBadge;
