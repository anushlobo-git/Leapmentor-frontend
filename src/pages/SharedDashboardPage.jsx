// src/pages/SharedDashboardPage.jsx
import { useState, useEffect, useCallback } from "react";
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

  const fetchConnect = useCallback(async () => {
    try {
      setLoading(true);
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

  // ✅ Called by useSessions when ALL slots are marked complete by both parties
  // Refetches the connect object so status reflects "completed" everywhere in the UI
  const handleAllComplete = useCallback(() => {
    console.log("🎉 All sessions complete — refetching connect...");
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

  return (
    <SharedDashboardLayout
      connect={connect}
      onAllComplete={handleAllComplete}
    />
  );
};

export default SharedDashboardPage;