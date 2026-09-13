/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/mentor/components/dashboard/requests/RequestsTab.jsx
import Loader from "@components/common/Loader";
import ErrorBanner from "@components/common/ErrorBanner";
import FilterTabs from "@components/common/FilterTabs";
import RequestCard from "@features/mentor/views/dashboard/requests/RequestCard";
import MenteeProfileModal from "@features/mentor/views/dashboard/requests/MenteeProfileModal";
import EmptyState from "@components/common/EmptyState";
import type { RequestCardRequest } from "@features/mentor/views/dashboard/requests/RequestCard";
import { useRequestsTabPresenter } from "@features/mentor/presenters/useRequestsTabPresenter";

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
  const {
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
  } = useRequestsTabPresenter();

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
                onViewProfile={(r: RequestCardRequest) => selectRequest(r)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedRequest && (
        <MenteeProfileModal
          request={selectedRequest}
          onClose={clearSelectedRequest}
          onUpdate={(id: string, status: string) => {
            handleUpdate(id, status);
            clearSelectedRequest();
          }}
        />
      )}
    </>
  );
};

export default RequestsTab;
