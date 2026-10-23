/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/mentee/components/dashboard/history/RequestHistoryTab.jsx
import logger from "@lib/monitoring/logger";
import Loader from "@components/shared/Loader";
import ErrorBanner from "@components/shared/ErrorBanner";
import FilterTabs from "@components/shared/FilterTabs";
import useSocketEvent from "@lib/hooks/useSocketEvent";
import useRequestHistory from "@features/mentee/presenters/useRequestHistory";
import { TABS } from "@features/mentee/views/dashboard/history/constants";
import HistoryTable from "@features/mentee/views/dashboard/history/HistoryTable";
import DetailDrawer, { type HistoryRequest } from "@features/mentee/views/dashboard/history/DetailDrawer";
import type { MappedConnectRequest } from "@features/connects/models/connectsMapper";

type MappedHistoryRequest = MappedConnectRequest & { _id: string };

const toHistoryRequest = (request: MappedHistoryRequest): HistoryRequest => ({
  ...request,
  mentor: request.mentor
    ? {
        ...request.mentor,
        _id: request.mentor._id ?? undefined,
        email: request.mentor.email ?? undefined,
      }
    : null,
  mentorProfile: request.mentorProfile as HistoryRequest["mentorProfile"],
  referredTo: request.referredTo
    ? {
        ...request.referredTo,
        _id: request.referredTo._id ?? undefined,
        email: request.referredTo.email ?? undefined,
      }
    : null,
  referredToProfile:
    request.referredToProfile as HistoryRequest["referredToProfile"],
  selectedSlots: request.selectedSlots as HistoryRequest["selectedSlots"],
  confirmedSlot: request.confirmedSlot as HistoryRequest["confirmedSlot"],
});

const RequestHistoryTab = () => {
  const {
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
    fetchRequests,
  } = useRequestHistory();

  const historyRequests = filtered.map(toHistoryRequest);
  const selectedHistoryRequest = selected
    ? toHistoryRequest(selected)
    : null;
  const handleSelect = (request: HistoryRequest | null) => {
    setSelected(
      request
        ? filtered.find((item) => item._id === request._id) ?? null
        : null,
    );
  };

  useSocketEvent(
    () => ({
      events: {
        request_status_changed: (data: unknown) => {
          logger.info("Request history socket event received", { data });
          fetchRequests();
        },
      },
    }),
    [fetchRequests],
    "Request history socket",
  );

  if (loading) {
    return <Loader minHeight={300} message="Loading your history..." />;
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Request History</h1>
        <p className="text-sm text-blue-900 mt-0.5">
          Manage and track your mentor outreach and collaboration requests.
        </p>
      </div>

      <ErrorBanner message={error} />

      {/* Filter tabs — full width */}
      <FilterTabs
        tabs={TABS}
        activeTab={activeTab}
        counts={counts}
        onChange={(tabKey: string) => {
          setActiveTab(tabKey);
          setSelected(null);
        }}
      />

      {/* Table */}
      <HistoryTable
        requests={historyRequests}
        selected={selectedHistoryRequest}
        onSelect={handleSelect}
        onDelete={deleteRequest}
      />

      {/* Drawer */}
      <DetailDrawer
        request={selectedHistoryRequest}
        onClose={() => setSelected(null)}
        onDelete={deleteRequest}
        onUpdateRequest={updateRequest}
      />
    </div>
  );
};

export default RequestHistoryTab;
