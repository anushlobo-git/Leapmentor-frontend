/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

/** Common result contract for role-specific dashboard data hooks. */
//LSP

//It defines the shared contract:

// DashboardShell does not need to know whether it received:

// useMenteeDashboard
// or:
// useMentorDashboard

export interface DashboardData {
  user: unknown;
  profile: unknown;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/** A dashboard data hook that can be supplied to the shared dashboard shell. */
export type DashboardDataProvider = () => DashboardData;
