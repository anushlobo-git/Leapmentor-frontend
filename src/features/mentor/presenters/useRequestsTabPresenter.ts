/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import logger from "@lib/monitoring/logger";
import useSocketEvent from "@lib/hooks/useSocketEvent";
import {
  fetchMentorRequests,
  patchMentorRequest,
  selectMentorRequestList,
} from "@features/connects/models/connectRequestsSlice";
import type { AppDispatch } from "@store/index";
import type { RequestCardRequest } from "@features/mentor/views/dashboard/requests/RequestCard";

export const useRequestsTabPresenter = () => {
  const dispatch = useDispatch<AppDispatch>();
  // Requests live in connectRequestsSlice (shared with the mentor home tab);
  // only UI state stays local.
  const { items, status, loadedOnce, error: fetchError } = useSelector(selectMentorRequestList);
  const requests = items as RequestCardRequest[];
  const loading = status === "loading";
  const initialLoad = !loadedOnce;
  const error = fetchError ?? "";
  const [activeTab, setActiveTab] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<RequestCardRequest | null>(null);

  const fetchRequests = useCallback(() => {
    logger.info("Fetching incoming mentor requests");
    return dispatch(fetchMentorRequests());
  }, [dispatch]);

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
    dispatch(
      patchMentorRequest({
        id,
        patch: { status: newStatus, respondedAt: new Date().toISOString() },
      }),
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
