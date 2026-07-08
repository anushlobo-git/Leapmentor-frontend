/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/hooks/useOngoingConnects.js
import { useState, useEffect, useCallback } from "react";
import axiosInstance from "@utils/axiosInstance";
import { mapConnectRequest } from "@mappers/connectsMapper";
/**
 * Custom hook for ongoing connects.
 * @returns {Object} Hook state and handlers for the caller.
 */

const useOngoingConnects = () => {
  const [ongoing,   setOngoing]   = useState([]);
  const [completed, setCompleted] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  const fetchConnects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosInstance.get("/connect-requests/ongoing");
      const all = Array.isArray(res.data.connects) ? res.data.connects.map(mapConnectRequest) : [];

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
