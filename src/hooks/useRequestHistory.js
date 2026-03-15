// src/hooks/useRequestHistory.js
import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const getToken = () => localStorage.getItem("token");
const authHeader = () => ({ Authorization: `Bearer ${getToken()}` });

const useRequestHistory = () => {
  const [requests, setRequests]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selected, setSelected]   = useState(null);

  // ── Fetch all requests ──────────────────────────────────────
  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${BASE_URL}/api/connect-requests/my-requests`,
          { headers: authHeader() }
        );
        setRequests(res.data.requests || []);
        console.log("REQUESTS:", res.data.requests); // ← ADD THIS LINE
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load requests.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // ── Delete / cancel a request ───────────────────────────────
  const deleteRequest = useCallback(async (id) => {
    try {
      await axios.delete(
        `${BASE_URL}/api/connect-requests/${id}`,
        { headers: authHeader() }
      );
      setRequests((prev) => prev.filter((r) => r._id !== id));
      setSelected((prev) => (prev?._id === id ? null : prev));
    } catch (err) {
      console.error("Delete error:", err?.response?.data?.message || err.message);
    }
  }, []);

  // ── Update a single request in place ───────────────────────
  // Called after escrow payment so the card updates to "ongoing"
  // without needing a full refetch
  const updateRequest = useCallback((id, patch) => {
    setRequests((prev) =>
      prev.map((r) => (r._id === id ? { ...r, ...patch } : r))
    );
    // Also update selected so the drawer reflects the new state immediately
    setSelected((prev) => (prev?._id === id ? { ...prev, ...patch } : prev));
  }, []);

  // ── Filtered list ───────────────────────────────────────────
  const filtered = activeTab === "all"
    ? requests
    : requests.filter((r) => r.status === activeTab);

  // ── Tab counts ──────────────────────────────────────────────
  const counts = {
    all:       requests.length,
    pending:   requests.filter((r) => r.status === "pending").length,
    accepted:  requests.filter((r) => r.status === "accepted").length,
    ongoing:   requests.filter((r) => r.status === "ongoing").length,
    completed: requests.filter((r) => r.status === "completed").length,
    rejected:  requests.filter((r) => r.status === "rejected").length,
    referred:  requests.filter((r) => r.status === "referred").length,
  };

  return {
    requests,
    filtered,
    counts,
    loading,
    error,
    activeTab,
    setActiveTab,
    selected,
    setSelected,
    deleteRequest,
    updateRequest, 
  };
};

export default useRequestHistory;