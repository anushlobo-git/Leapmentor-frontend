/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { useState, useEffect, useCallback } from "react";
import { getIncomingRequests } from "@features/mentor/models/mentor.api";
import logger from "@lib/logger";
import useSocketEvent from "@lib/hooks/useSocketEvent";
import type { RequestCardRequest } from "@features/mentor/views/dashboard/requests/RequestCard";

export const useRequestsTabPresenter = () => {
  const [requests, setRequests] = useState<RequestCardRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<RequestCardRequest | null>(null);

  const fetchRequests = useCallback(async () => {
    logger.info("Fetching incoming mentor requests");
    try {
      setLoading(true);
      const res = await getIncomingRequests();
      setRequests(res.data.requests || []);
    } catch (err: any) {
      logger.warn("Failed to fetch incoming mentor requests", {
        error: err?.message,
      });
      setError(err?.response?.data?.message || "Failed to load requests.");
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, []);

  useSocketEvent(
    () => ({
      events: {
        request_status_changed: (data: any) => {
          logger.info("Request status changed socket event received", {
            data,
          });
          fetchRequests();
        },
      },
    }),
    [fetchRequests],
    "Request socket",
  );

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleUpdate = (id: string, newStatus: string) => {
    setRequests((prev) =>
      prev.map((r: any) =>
        r._id === id
          ? { ...r, status: newStatus, respondedAt: new Date().toISOString() }
          : r,
      ),
    );
  };

  const filtered =
    activeTab === "all"
      ? requests
      : requests.filter((r: any) => r.status === activeTab);

  const counts = {
    all: requests.length,
    pending: requests.filter((r: any) => r.status === "pending").length,
    accepted: requests.filter((r: any) => r.status === "accepted").length,
    rejected: requests.filter((r: any) => r.status === "rejected").length,
    referred: requests.filter((r: any) => r.status === "referred").length,
    ongoing: requests.filter((r: any) => r.status === "ongoing").length,
    completed: requests.filter((r: any) => r.status === "completed").length,
  };

  const selectRequest = (r: RequestCardRequest) => setSelectedRequest(r);
  const clearSelectedRequest = () => setSelectedRequest(null);

  return {
    requests,
    loading,
    initialLoad,
    error,
    activeTab,
    setActiveTab,
    selectedRequest,
    selectRequest,
    clearSelectedRequest,
    handleUpdate,
    filtered,
    counts,
  };
};
