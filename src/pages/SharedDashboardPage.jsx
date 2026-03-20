// src/pages/SharedDashboardPage.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import SharedDashboardLayout from "../components/shared-dashboard/SharedDashboardLayout";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const SharedDashboardPage = () => {
  const { connectRequestId } = useParams();
  const navigate             = useNavigate();

  const [connect, setConnect] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // ✅ Track active tab here so it survives connect refetches
  const [activeTab, setActiveTab] = useState("home");

  const fetchConnect = useCallback(async () => {
    try {
      // ✅ Don't show loading spinner on refetch — only on first load
      const token = localStorage.getItem("token");
      if (!token) { navigate("/login"); return; }
      const res = await axios.get(
        `${BASE_URL}/api/connect-requests/${connectRequestId}/detail`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setConnect(res.data.connect);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) return navigate("/login");
      if (status === 403) return navigate(-1);
      setError(err?.response?.data?.message || "Failed to load session.");
    } finally {
      setLoading(false);
    }
  }, [connectRequestId, navigate]);

  useEffect(() => { fetchConnect(); }, [fetchConnect]);

  // ✅ onAllComplete — refetch connect but DON'T reset the tab
  const handleAllComplete = useCallback(() => {
    console.log("🎉 All sessions complete — refetching connect...");
    fetchConnect(); // ✅ updates connect.status to "completed" without resetting activeTab
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

  return (
    <SharedDashboardLayout
      connect={connect}
      onAllComplete={handleAllComplete}
      activeTab={activeTab}        // ✅ pass tab state down
      setActiveTab={setActiveTab}  // ✅ pass setter down
    />
  );
};

export default SharedDashboardPage;