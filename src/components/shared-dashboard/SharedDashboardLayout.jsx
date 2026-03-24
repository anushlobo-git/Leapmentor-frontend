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
import useSocketToast             from "../../hooks/useSocketToast";

const SharedDashboardLayout = ({ connect, onAllComplete, activeTab, setActiveTab }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useSocketToast();

  const viewerRole = connect?.viewerRole || "mentee";

  return (
    <div style={{
      height: "100vh",          // ← was minHeight; needs to be fixed height so children can fill it
      backgroundColor: "#f8fafc",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",       // ← prevent outer page scroll; each section manages its own
    }}>

      {/* Topbar — fixed height, never shrinks */}
      <SharedTopbar
        viewerRole={viewerRole}
        onMenuToggle={() => setSidebarOpen(true)}
      />

      {/* Body — fills remaining height below topbar */}
      <div style={{ display: "flex", flex: 1, minHeight: 0 /* critical for nested scroll */ }}>

        {/* Sidebar */}
        <SharedSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/*
          Main content
          ─────────────────────────────────────────────────────────
          CHANGES from original:
          1. Removed `maxWidth: "900px"` — this was the root cause of
             the right-side dead whitespace on all tabs including chat.
          2. Changed `overflowY: "auto"` → conditional per tab.
             Non-chat tabs scroll normally. Chat tab must NOT scroll
             here — the chat component manages its own internal scroll.
          3. Added `minHeight: 0` — required so flex children that use
             `flex: 1` can properly constrain their height and scroll.
          4. Chat wrapper uses `height: "100%"` + `display: flex` so
             SharedChatTab's `flex: 1` has a real height to fill.
          ─────────────────────────────────────────────────────────
        */}
        <main style={{
          flex: 1,
          minHeight: 0,        // ← essential: lets children scroll within flex
          minWidth: 0,         // ← prevents horizontal overflow from long content
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",  // ← each tab manages its own scroll
        }}>

          {/* Home */}
          <div style={{
            display: activeTab === "home" ? "block" : "none",
            height: "100%", overflowY: "auto",
            padding: "24px 32px",
          }}>
            <SharedHomeTab connect={connect} onTabChange={setActiveTab} />
          </div>

          {/* Chat — always mounted so socket stays alive
              No padding here — chat has its own internal spacing
              height: 100% + display flex lets SharedChatTab fill fully */}
          <div style={{
            display: activeTab === "chat" ? "flex" : "none",
            flexDirection: "column",
            height: "100%",    // ← fills the main area completely
            padding: "24px 32px", // ← equal breathing room on all sides
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

          {/* Report */}
          <div style={{
            display: activeTab === "report" ? "block" : "none",
            height: "100%", overflowY: "auto",
            padding: "24px 32px",
          }}>
            <SharedReportTab connect={connect} />
          </div>

        </main>
      </div>
    </div>
  );
};

export default SharedDashboardLayout;