// src/components/shared-dashboard/SharedDashboardLayout.jsx
import { useState } from "react";
import SharedTopbar from "./SharedTopbar";
import SharedSidebar from "./SharedSidebar";
import SharedHomeTab from "./tabs/SharedHomeTab";
import SharedChatTab from "./tabs/SharedChatTab";
import SharedGoalsTab from "./tabs/SharedGoalsTab";
import SharedNotesTab from "./tabs/SharedNotesTab";
import SharedAdditionalSessionTab from "./tabs/SharedAdditionalSessionTab";

const SharedDashboardLayout = ({ connect, onAllComplete, activeTab: activeTabProp, setActiveTab }) => {
  const activeTab = activeTabProp || "overview";
  const [sidebarOpen, setSidebarOpen] = useState(false);


  const viewerRole = connect?.viewerRole || "mentee";

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
      />

      {/* Body */}
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>

        {/* Sidebar */}
        <SharedSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
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
              onAllComplete={onAllComplete}
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

        </main>
      </div>
    </div>
  );
};

export default SharedDashboardLayout;