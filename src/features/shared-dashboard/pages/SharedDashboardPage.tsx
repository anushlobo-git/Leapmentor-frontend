/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/pages/SharedDashboardPage.jsx
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getConnectDetail } from "@features/shared-dashboard/api/shared-dashboard.api";
import SharedDashboardLayout from "@features/shared-dashboard/components/SharedDashboardLayout";
import {
  setConnect,
  setActiveTab,
  resetSharedDashboard,
} from "@features/shared-dashboard/store/sharedDashboardSlice";
import { HTTP_STATUS } from "@lib/httpStatus";
import { selectIsAuthenticated } from "@features/auth/store/authSlice";

const VALID_TABS = new Set([
  "overview",
  "chat",
  "goals",
  "notes",
  "addSession",
]);

const SharedDashboardPage = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { connectRequestId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    dispatch(
      setActiveTab(VALID_TABS.has(tabFromUrl) ? tabFromUrl : "overview"),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync URL tab once on mount
  }, [dispatch]);

  useEffect(() => {
    return () => {
      dispatch(resetSharedDashboard());
    };
  }, [dispatch]);

  const fetchConnect = useCallback(async () => {
    try {
      if (!isAuthenticated) {
        navigate("/login");
        return;
      }
      const res = await getConnectDetail(connectRequestId);
      dispatch(setConnect(res.data.connect));
    } catch (err) {
      const status = err?.response?.status;
      if (status === HTTP_STATUS.UNAUTHORIZED) return navigate("/login");
      if (status === HTTP_STATUS.FORBIDDEN) return navigate(-1);
      setError(err?.response?.data?.message || "Failed to load session.");
    } finally {
      setLoading(false);
    }
  }, [connectRequestId, navigate, dispatch, isAuthenticated]);

  useEffect(() => {
    fetchConnect();
  }, [fetchConnect]);

  if (loading) {
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
