/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/mentee/components/dashboard/history/RequestHistoryTab.jsx
import logger from "@lib/logger";
import Loader from "@components/common/Loader";
import ErrorBanner from "@components/common/ErrorBanner";
import FilterTabs from "@components/common/FilterTabs";
import useSocketEvent from "@lib/hooks/useSocketEvent";
import useRequestHistory from "@features/mentee/hooks/useRequestHistory";
import { TABS } from "@features/mentee/components/dashboard/history/constants";
import HistoryTable from "@features/mentee/components/dashboard/history/HistoryTable";
import DetailDrawer from "@features/mentee/components/dashboard/history/DetailDrawer";

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

  useSocketEvent(
    () => ({
      events: {
        request_status_changed: (data) => {
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
        onChange={(tabKey) => {
          setActiveTab(tabKey);
          setSelected(null);
        }}
      />

      {/* Table */}
      <HistoryTable
        requests={filtered}
        selected={selected}
        onSelect={setSelected}
        onDelete={deleteRequest}
      />

      {/* Drawer */}
      <DetailDrawer
        request={selected}
        onClose={() => setSelected(null)}
        onDelete={deleteRequest}
        onUpdateRequest={updateRequest}
      />
    </div>
  );
};

export default RequestHistoryTab;
