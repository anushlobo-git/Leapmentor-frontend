// src/components/shared-dashboard/SharedDashboardLayout.jsx
import { useState } from "react";
import SharedTopbar               from "./SharedTopbar";
import SharedSidebar              from "./SharedSidebar";
import SharedHomeTab              from "./tabs/SharedHomeTab";
import SharedChatTab              from "./tabs/SharedChatTab";
import SharedGoalsTab             from "./tabs/SharedGoalsTab";
import SharedNotesTab             from "./tabs/SharedNotesTab";
import SharedReportTab            from "./tabs/SharedReportTab";
import SharedAdditionalSessionTab from "./tabs/SharedAdditionalSessionTab";
import useSocketToast             from "../../hooks/useSocketToast"; // ✅ added

const SharedDashboardLayout = ({ connect, onAllComplete, activeTab, setActiveTab }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ✅ Creates window.__leapSocket so useSessions can receive real-time slot updates
  // Also handles toast notifications while user is in shared dashboard
  useSocketToast();

  const viewerRole = connect?.viewerRole || "mentee";

  return (
    <div style={{
      minHeight: "100vh", backgroundColor: "#f8fafc",
      display: "flex", flexDirection: "column",
    }}>

      {/* Topbar */}
      <SharedTopbar
        viewerRole={viewerRole}
        onMenuToggle={() => setSidebarOpen(true)}
      />

      {/* Body */}
      <div style={{ display: "flex", flex: 1 }}>

        {/* Sidebar */}
        <SharedSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main content */}
        <main style={{
          flex: 1, padding: "24px 32px",
          overflowY: "auto", maxWidth: "900px",
        }}>

          {/* Home */}
          <div style={{ display: activeTab === "home" ? "block" : "none" }}>
            <SharedHomeTab connect={connect} onTabChange={setActiveTab} />
          </div>

          {/* Chat — always mounted so socket stays alive */}
          <div style={{ display: activeTab === "chat" ? "flex" : "none", flexDirection: "column", height: "100%" }}>
            <SharedChatTab connect={connect} />
          </div>

          {/* Goals */}
          <div style={{ display: activeTab === "goals" ? "block" : "none" }}>
            <SharedGoalsTab
              connect={connect}
              onAllComplete={onAllComplete}
            />
          </div>

          {/* Notes */}
          <div style={{ display: activeTab === "notes" ? "block" : "none" }}>
            <SharedNotesTab connect={connect} />
          </div>

          {/* Add Session */}
          <div style={{ display: activeTab === "addSession" ? "block" : "none" }}>
            <SharedAdditionalSessionTab connect={connect} onTabChange={setActiveTab} />
          </div>

          {/* Report */}
          <div style={{ display: activeTab === "report" ? "block" : "none" }}>
            <SharedReportTab connect={connect} />
          </div>

        </main>
      </div>
    </div>
  );
};

export default SharedDashboardLayout;