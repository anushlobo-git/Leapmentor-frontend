/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/components/shared-dashboard/SharedDashboardLayout.jsx
import { useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import SharedTopbar from "@features/shared-dashboard/components/SharedTopbar";
import SharedSidebar from "@features/shared-dashboard/components/SharedSidebar";
import SharedHomeTab from "@features/shared-dashboard/components/tabs/SharedHomeTab";
import SharedChatTab from "@features/shared-dashboard/components/tabs/SharedChatTab";
import SharedGoalsTab from "@features/shared-dashboard/components/tabs/SharedGoalsTab";
import SharedNotesTab from "@features/shared-dashboard/components/tabs/SharedNotesTab";
import SharedAdditionalSessionTab from "@features/shared-dashboard/components/tabs/SharedAdditionalSessionTab";
import useSocketToast from "@features/notifications/hooks/useSocketToast";
import {
  setActiveTab,
  selectActiveTab,
  selectViewerRole,
} from "@features/shared-dashboard/store/sharedDashboardSlice";

const SharedDashboardLayout = () => {
  const dispatch = useDispatch();
  const [, setSearchParams] = useSearchParams();
  const activeTab = useSelector(selectActiveTab) || "overview";
  const viewerRole = useSelector(selectViewerRole);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useSocketToast();

  const handleSetActiveTab = useCallback((tab) => {
    dispatch(setActiveTab(tab));
    setSearchParams({ tab }, { replace: true });
  }, [dispatch, setSearchParams]);

  const backPath = viewerRole === "mentor"
    ? "/dashboard/mentor"
    : "/dashboard/mentee";

  return (
    <div style={{
      height: "100vh",
      backgroundColor: "#f8fafc",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}>

      {/* Topbar */}
      <SharedTopbar
        viewerRole={viewerRole}
        onMenuToggle={() => setSidebarOpen(true)}
        onLogoClick={() => navigate(backPath)}  // ✅ added
      />

      {/* Body */}
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>

        {/* Sidebar */}
        <SharedSidebar
          activeTab={activeTab}
          setActiveTab={handleSetActiveTab}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          viewerRole={viewerRole}
        />

        <main style={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}>

          {/* Home */}
          <div style={{
            display: activeTab === "overview" ? "block" : "none",
            height: "100%", overflowY: "auto",
            padding: "24px 32px",
          }}>
            <SharedHomeTab />
          </div>

          {/* Chat — always mounted so socket stays alive */}
          <div style={{
            display: activeTab === "chat" ? "flex" : "none",
            flexDirection: "column",
            height: "100%",
            padding: "24px 32px",
            boxSizing: "border-box",
          }}>
            <SharedChatTab />
          </div>

          {/* Goals */}
          <div style={{
            display: activeTab === "goals" ? "block" : "none",
            height: "100%", overflowY: "auto",
            padding: "24px 32px",
          }}>
            <SharedGoalsTab />
          </div>

          {/* Notes */}
          <div style={{
            display: activeTab === "notes" ? "block" : "none",
            height: "100%", overflowY: "auto",
            padding: "24px 32px",
          }}>
            <SharedNotesTab />
          </div>

          {/* Add Session */}
          <div style={{
            display: activeTab === "addSession" ? "block" : "none",
            height: "100%", overflowY: "auto",
            padding: "24px 32px",
          }}>
            <SharedAdditionalSessionTab />
          </div>

        </main>
      </div>
    </div>
  );
};

export default SharedDashboardLayout;
