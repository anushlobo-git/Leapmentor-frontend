/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/mentor/components/dashboard/requests/RequestsTab.jsx
import { useState, useEffect, useCallback } from "react";
import { getIncomingRequests } from "@features/mentor/api/mentor.api";
import logger from "@lib/logger";
import Loader from "@components/common/Loader";
import ErrorBanner from "@components/common/ErrorBanner";
import FilterTabs from "@components/common/FilterTabs";
import useSocketEvent from "@lib/hooks/useSocketEvent";
import RequestCard from "@features/mentor/components/dashboard/requests/RequestCard";
import MenteeProfileModal from "@features/mentor/components/dashboard/requests/MenteeProfileModal";
import EmptyState from "@components/common/EmptyState";
import type { RequestCardRequest } from "@features/mentor/components/dashboard/requests/RequestCard";

const TABS = [
  { key: "all", label: "All Requests" },
  { key: "pending", label: "Pending" },
  { key: "accepted", label: "Accepted" },
  { key: "rejected", label: "Rejected" },
  { key: "referred", label: "Referred" },
  { key: "ongoing", label: "Ongoing" },
  { key: "completed", label: "Completed" },
];

// ── Extracted: tab count-badge styling (was a nested ternary) ──
const getTabBadgeClass = (tabKey: string, activeTab: string) => {
  if (activeTab === tabKey) return "bg-blue-900 text-white";
  if (tabKey === "referred") return "bg-violet-100 text-violet-600";
  return "bg-slate-100 text-slate-500";
};

// ── Extracted: empty-state copy per tab (was a triple-nested ternary) ──
const EMPTY_STATE_MESSAGES = {
  pending: "You'll see new requests here when mentees reach out.",
  referred: "Requests you've referred to other mentors will appear here.",
  all: "When mentees send you connect requests, they'll appear here.",
};

const getEmptyStateMessage = (activeTab: string) =>
  EMPTY_STATE_MESSAGES[activeTab] || `No requests have been ${activeTab} yet.`;

const RequestsTab = () => {
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

  if (loading && initialLoad) {
    return <Loader minHeight={300} message="Loading requests..." />;
  }

  const emptyStateTitle =
    activeTab === "all" ? "No requests yet" : `No ${activeTab} requests`;
  const emptyStateMessage = getEmptyStateMessage(activeTab);

  return (
    <>
      <div className="w-full space-y-5">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Mentee Requests
            </h1>
            <p className="text-sm text-blue-900 mt-0.5">
              Manage your incoming and active mentorship connections.
            </p>
          </div>
          {requests.length > 0 && (
            <span className="self-start sm:self-auto text-xs font-bold text-blue-900 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full shrink-0">
              {requests.length} total
            </span>
          )}
        </div>

        <ErrorBanner message={error} />

        {/* ── Tabs ── */}
        <FilterTabs
          tabs={TABS}
          activeTab={activeTab}
          counts={counts}
          onChange={setActiveTab}
          getBadgeClass={getTabBadgeClass}
          scrollable
        />

        {/* ── Cards ── */}
        {filtered.length === 0 ? (
          <EmptyState title={emptyStateTitle} message={emptyStateMessage} />
        ) : (
          // ✅ 1 col mobile → 2 col md+ with min card width enforced
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filtered.map((request: any) => (
              <RequestCard
                key={request._id}
                request={request}
                onViewProfile={(r: RequestCardRequest) => setSelectedRequest(r)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedRequest && (
        <MenteeProfileModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onUpdate={(id: string, status: string) => {
            handleUpdate(id, status);
            setSelectedRequest(null);
          }}
        />
      )}
    </>
  );
};

export default RequestsTab;
