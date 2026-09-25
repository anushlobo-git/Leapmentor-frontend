/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/hooks/useRequestHistory.js
import { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import logger from "@lib/monitoring/logger";
import { mapConnectRequest } from "@features/connects/models/connectsMapper";
import {
  fetchMenteeRequests,
  deleteMenteeRequest,
  patchMenteeRequest,
  selectMenteeRequestList,
} from "@features/connects/models/connectRequestsSlice";
import type { AppDispatch } from "@store/index";
/**
 * Custom hook for request history.
 * Requests come from connectRequestsSlice (shared with the mentee home tab);
 * only the tab filter and the selected row are local UI state.
 * @returns {Object} Hook state and handlers for the caller.
 */

const useRequestHistory = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, status, loadedOnce, error: fetchError } = useSelector(selectMenteeRequestList);
  const requests = useMemo(() => items.map(mapConnectRequest), [items]);
  const loading = status === "loading";
  const initialLoad = !loadedOnce; // first load only — background refetches never block the UI
  const error = fetchError ?? "";
  const [activeTab, setActiveTab] = useState("all");
  const [selected, setSelected] = useState<any>(null);

  // ── Fetch all requests ──────────────────────────────────────
  const fetchRequests = useCallback(() => dispatch(fetchMenteeRequests()), [dispatch]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // ── Delete / cancel a request ───────────────────────────────
  const deleteRequest = useCallback(
    async (id: string) => {
      try {
        await dispatch(deleteMenteeRequest(id)).unwrap();
        setSelected((prev: any) => (prev?._id === id ? null : prev));
      } catch (err: any) {
        logger.error("Delete error:", { error: err?.response?.data?.message || err.message });
      }
    },
    [dispatch],
  );

  // ── Update a single request in place ───────────────────────
  const updateRequest = useCallback(
    (id: string, patch: Record<string, unknown>) => {
      dispatch(patchMenteeRequest({ id, patch }));
      setSelected((prev: any) => (prev?._id === id ? { ...prev, ...patch } : prev));
    },
    [dispatch],
  );

  // ── Filtered list ───────────────────────────────────────────
  const filtered = activeTab === "all"
    ? requests
    : requests.filter((r) => r.status === activeTab);

  // ── Tab counts ──────────────────────────────────────────────
  const counts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    accepted: requests.filter((r) => r.status === "accepted").length,
    ongoing: requests.filter((r) => r.status === "ongoing").length,
    completed: requests.filter((r) => r.status === "completed").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
    referred: requests.filter((r) => r.status === "referred").length,
  };

  return {
    requests,
    filtered,
    counts,
    loading: loading && initialLoad, // spinner only on first load, not background refetches
    error,
    activeTab,
    setActiveTab,
    selected,
    setSelected,
    deleteRequest,
    updateRequest,
    fetchRequests, // ✅ exposed for real-time refetch via socket
  };
};

export default useRequestHistory;
