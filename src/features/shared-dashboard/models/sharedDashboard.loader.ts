/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { redirect, type LoaderFunctionArgs, type ShouldRevalidateFunction } from "react-router-dom";
import store from "@store/index";
import { selectIsAuthenticated } from "@features/auth/models/authSlice";
import { getConnectDetail } from "@features/shared-dashboard/models/shared-dashboard.api";
import { HTTP_STATUS } from "@lib/http/httpStatus";

export interface SharedDashboardLoaderData {
  connect: any | null;
  error: string | null;
}

/**
 * Fetches the connect for /shared-dashboard/:connectRequestId before the page renders.
 * Loaders aren't components, so auth is read straight from the store.
 *  - not signed in / 401  → redirect to /login (was navigate("/login"))
 *  - 403                  → thrown 403 Response, shown by RouteErrorBoundary
 *                           (a loader can't navigate(-1) like the old effect did)
 *  - anything else        → returned as `error`, the page keeps its inline error UI
 * The loader does NOT write to Redux; the page mirrors `connect` into the slice
 * so the slice stays the single read path for the dashboard's child components.
 */
export const sharedDashboardLoader = async ({
  params,
}: LoaderFunctionArgs): Promise<SharedDashboardLoaderData> => {
  if (!selectIsAuthenticated(store.getState())) throw redirect("/login");

  try {
    const res = await getConnectDetail(params.connectRequestId);
    return { connect: res.data.connect, error: null };
  } catch (err: any) {
    const status = err?.response?.status;
    if (status === HTTP_STATUS.UNAUTHORIZED) throw redirect("/login");
    if (status === HTTP_STATUS.FORBIDDEN) {
      throw new Response("Forbidden", { status: HTTP_STATUS.FORBIDDEN });
    }
    return {
      connect: null,
      error: err?.response?.data?.message || "Failed to load session.",
    };
  }
};

/** Only refetch when the connect id changes — not on `?tab=` changes or
 * after unrelated navigations/submissions (the default would refetch). */
export const shouldRevalidateSharedDashboard: ShouldRevalidateFunction = ({
  currentParams,
  nextParams,
}) => currentParams.connectRequestId !== nextParams.connectRequestId;
