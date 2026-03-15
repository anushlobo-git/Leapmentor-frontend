// src/hooks/useOngoingConnects.js
import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const useOngoingConnects = () => {
  const [ongoing,   setOngoing]   = useState([]);
  const [completed, setCompleted] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  const fetchConnects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/api/connect-requests/ongoing`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const all = res.data.connects || [];

      // ✅ Split into ongoing and completed
      setOngoing(all.filter((c) => c.status === "ongoing"));
      setCompleted(all.filter((c) => c.status === "completed"));
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load connects.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConnects();
  }, [fetchConnects]);

  // ✅ Keep connects for backward compat (ongoing only)
  return {
    connects: ongoing,   // backward compat
    ongoing,
    completed,
    loading,
    error,
    refetch: fetchConnects,
  };
};

export default useOngoingConnects;