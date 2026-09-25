/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/pages/SharedDashboardPage.jsx
import { useEffect } from "react";
import { useLoaderData, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import SharedDashboardLayout from "@features/shared-dashboard/views/SharedDashboardLayout";
import {
  setConnect,
  setActiveTab,
  resetSharedDashboard,
  selectConnect,
} from "@features/shared-dashboard/models/sharedDashboardSlice";
import type { SharedDashboardLoaderData } from "@features/shared-dashboard/models/sharedDashboard.loader";

const VALID_TABS = new Set([
  "overview",
  "chat",
  "goals",
  "notes",
  "addSession",
]);

const SharedDashboardPage = () => {
  // Fetched by sharedDashboardLoader (wired in app/routes.tsx) before render;
  // auth redirects and 403s never reach this component.
  const { connect, error } = useLoaderData() as SharedDashboardLoaderData;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const connectInStore = useSelector(selectConnect);

  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    dispatch(
      setActiveTab(VALID_TABS.has(tabFromUrl as string) ? (tabFromUrl as string) : "overview"),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync URL tab once on mount
  }, [dispatch]);

  // Mirror loader data into Redux (children read it from the slice) and reset
  // on leave. Kept in one effect so StrictMode's mount→cleanup→mount re-sets it.
  useEffect(() => {
    if (connect) dispatch(setConnect(connect));
    return () => {
      dispatch(resetSharedDashboard());
    };
  }, [dispatch, connect]);

  if (!error && !connectInStore) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 rounded-full border-4 border-blue-100 border-t-blue-900 animate-spin" />
          <p className="text-sm text-slate-400 font-medium">Loading session…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-6 py-4">
            <span className="text-red-500">⚠</span>
            <p className="text-sm text-red-600">{error}</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            ← Go back
          </button>
        </div>
      </div>
    );
  }

  return <SharedDashboardLayout />;
};

export default SharedDashboardPage;
