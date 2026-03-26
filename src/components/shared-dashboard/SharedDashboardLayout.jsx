// src/components/shared-dashboard/SharedDashboardLayout.jsx
import { useState } from "react";
import SharedTopbar from "./SharedTopbar";
import SharedSidebar from "./SharedSidebar";
import SharedHomeTab from "./tabs/SharedHomeTab";
import SharedChatTab from "./tabs/SharedChatTab";
import SharedGoalsTab from "./tabs/SharedGoalsTab";
import SharedNotesTab from "./tabs/SharedNotesTab";
import SharedReportTab from "./tabs/SharedReportTab";
import SharedAdditionalSessionTab from "./tabs/SharedAdditionalSessionTab";
import useSocketToast from "../../hooks/useSocketToast";

const SharedDashboardLayout = ({ connect, onAllComplete, activeTab: activeTabProp, setActiveTab }) => {
  const activeTab = activeTabProp || "overview";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reportRefreshKey, setReportRefreshKey] = useState(0); // 👈 ADDED

  useSocketToast();

  const viewerRole = connect?.viewerRole || "mentee";

  // 👇 ADDED: wrap onAllComplete to also bump the report refresh key
  const handleAllComplete = () => {
    setReportRefreshKey(k => k + 1);
    onAllComplete?.();
  };

  return (
    <div style={{
      height: "100vh",
      backgroundColor: "#f8fafc",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}>

      {/* Topbar — fixed height, never shrinks */}
      <SharedTopbar
        viewerRole={viewerRole}
        onMenuToggle={() => setSidebarOpen(true)}
      />

      {/* Body — fills remaining height below topbar */}
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>

        {/* Sidebar */}
        <SharedSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
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
            <SharedHomeTab connect={connect} onTabChange={setActiveTab} />
          </div>

          {/* Chat — always mounted so socket stays alive */}
          <div style={{
            display: activeTab === "chat" ? "flex" : "none",
            flexDirection: "column",
            height: "100%",
            padding: "24px 32px",
            boxSizing: "border-box",
          }}>
            <SharedChatTab connect={connect} />
          </div>

          {/* Goals */}
          <div style={{
            display: activeTab === "goals" ? "block" : "none",
            height: "100%", overflowY: "auto",
            padding: "24px 32px",
          }}>
            <SharedGoalsTab
              connect={connect}
              onAllComplete={handleAllComplete}  // 👈 CHANGED: use wrapped handler
            />
          </div>

          {/* Notes */}
          <div style={{
            display: activeTab === "notes" ? "block" : "none",
            height: "100%", overflowY: "auto",
            padding: "24px 32px",
          }}>
            <SharedNotesTab connect={connect} />
          </div>

          {/* Add Session */}
          <div style={{
            display: activeTab === "addSession" ? "block" : "none",
            height: "100%", overflowY: "auto",
            padding: "24px 32px",
          }}>
            <SharedAdditionalSessionTab connect={connect} onTabChange={setActiveTab} />
          </div>

          {/* Report */}
          <div style={{
            display: activeTab === "report" ? "block" : "none",
            height: "100%", overflowY: "auto",
            padding: "24px 32px",
          }}>
            <SharedReportTab
              connect={connect}
              reportRefreshKey={reportRefreshKey}  // 👈 ADDED
            />
          </div>

        </main>
      </div>
    </div>
  );
};

export default SharedDashboardLayout;