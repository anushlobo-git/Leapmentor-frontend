/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { redirect, type LoaderFunctionArgs, type ShouldRevalidateFunction } from "react-router-dom";
import { getConnectDetail } from "@features/shared-dashboard/models/shared-dashboard.api";
import { HTTP_STATUS } from "@lib/http/httpStatus";

/**
 * Connect/session detail returned by GET /connect-requests/:id/detail.
 * The backend DTO is broad; only the fields the dashboard actually reads are
 * modelled here (the loader is a pass-through, other fields stay untyped).
 */
export interface ConnectDetail {
  _id?: string;
  status?: string;
  viewerRole?: "mentee" | "mentor";
  [key: string]: unknown;
}

export interface SharedDashboardLoaderData {
  connect: ConnectDetail | null;
  error: string | null;
}

type SharedDashboardApiError = {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
};

/**
 * Fetches the connect for /shared-dashboard/:connectRequestId before the page renders.
 * Loaders aren't components, so auth is read straight from the store.
 *  - 401                  → allow Axios silent refresh, then redirect to login
 *                           with the shared-dashboard URL as the return target
 *  - 403                  → thrown 403 Response, shown by RouteErrorBoundary
 *                           (a loader can't navigate(-1) like the old effect did)
 *  - anything else        → returned as `error`, the page keeps its inline error UI
 * The loader does NOT make its own Redux auth decision: Axios owns the shared
 * bearer-token refresh flow. The page mirrors `connect` into the slice so the
 * slice stays the single read path for the dashboard's child components.
 */
export const sharedDashboardLoader = async ({
  params,
  request,
}: LoaderFunctionArgs): Promise<SharedDashboardLoaderData> => {
  try {
    const res = await getConnectDetail(params.connectRequestId!, {
      _skipAuthRedirect: true,
    });
    return { connect: res.data.connect, error: null };
  } catch (err: unknown) {
    const error = err as SharedDashboardApiError;
    const status = error.response?.status;
    if (status === HTTP_STATUS.UNAUTHORIZED) {
      const currentUrl = new URL(request.url);
      const returnTo = `${currentUrl.pathname}${currentUrl.search}`;
      throw redirect(`/login?returnTo=${encodeURIComponent(returnTo)}`);
    }
    if (status === HTTP_STATUS.FORBIDDEN) {
      throw new Response("Forbidden", { status: HTTP_STATUS.FORBIDDEN });
    }
    return {
      connect: null,
      error: error.response?.data?.message || "Failed to load session.",
    };
  }
};

/** Only refetch when the connect id changes — not on `?tab=` changes or
 * after unrelated navigations/submissions (the default would refetch). */
export const shouldRevalidateSharedDashboard: ShouldRevalidateFunction = ({
  currentParams,
  nextParams,
}) => currentParams.connectRequestId !== nextParams.connectRequestId;
