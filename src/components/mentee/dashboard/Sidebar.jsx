import { useEffect } from "react";

const NAV_ITEMS = [
  { key: "home", label: "Home", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { key: "profile", label: "Profile", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  { key: "findMentors", label: "Find Mentors", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
  { key: "notifications", label: "Notifications", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> },
  { key: "history", label: "History", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="12 8 12 12 14 14"/><path d="M3.05 11a9 9 0 1 0 .5-4.5"/><polyline points="3 3 3 9 9 9"/></svg> },
  { key: "connects", label: "Connects", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { key: "settings", label: "Settings", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
];

// ✅ NEW — Badge component
const Badge = ({ count }) => {
  if (!count || count === 0) return null;
  return (
    <span style={{
      marginLeft: "auto",
      backgroundColor: "#ef4444",
      color: "white",
      fontSize: "10px",
      fontWeight: "700",
      borderRadius: "999px",
      minWidth: "18px",
      height: "18px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "0 5px",
      lineHeight: 1,
    }}>
      {count > 99 ? "99+" : count}
    </span>
  );
};

// ✅ Added unreadCount prop
const SidebarContent = ({ activeTab, setActiveTab, onClose, unreadCount }) => (
  <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
    <nav style={{ display: "flex", flexDirection: "column", gap: "2px", padding: "16px 12px 0" }}>
      {NAV_ITEMS.map((item) => {
        const isActive = activeTab === item.key;
        return (
          <button
            key={item.key}
            onClick={() => { setActiveTab(item.key); onClose?.(); }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 12px",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: isActive ? "600" : "500",
              border: "none",
              cursor: "pointer",
              textAlign: "left",
              width: "100%",
              backgroundColor: isActive ? "#eff6ff" : "transparent",
              color: isActive ? "#1e3a8a" : "#64748b",
              transition: "all 0.15s",
            }}
          >
            <span style={{ color: isActive ? "#1e3a8a" : "#94a3b8", display: "flex", alignItems: "center" }}>
              {item.icon}
            </span>
            {item.label}
            {/* ✅ NEW — show badge on notifications */}
            {item.key === "notifications" && <Badge count={unreadCount} />}
          </button>
        );
      })}
    </nav>

    <div style={{ padding: "0 12px 32px" }}>
      <p style={{ fontSize: "10px", fontWeight: "600", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", padding: "0 12px", marginBottom: "4px" }}>
        Support
      </p>
      {/* ✅ CHANGED: onClick added, active highlight added */}
      <button
        onClick={() => { setActiveTab("help"); onClose?.(); }}
        style={{
          display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px",
          borderRadius: "12px", fontSize: "14px", border: "none", cursor: "pointer",
          width: "100%",
          backgroundColor: activeTab === "help" ? "#eff6ff" : "transparent",
          color: activeTab === "help" ? "#1e3a8a" : "#64748b",
          fontWeight: activeTab === "help" ? "600" : "500",
          transition: "all 0.15s",
        }}
      >
        <span style={{ color: activeTab === "help" ? "#1e3a8a" : "#94a3b8", display: "flex", alignItems: "center" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </span>
        Help Center
      </button>
    </div>
  </div>
);

// ✅ Added unreadCount prop
const Sidebar = ({ activeTab, setActiveTab, isOpen, onClose, unreadCount = 0 }) => {
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      {/* CSS — zero Tailwind dependency */}
      <style>{`
        .sidebar-desktop { display: flex; }
        .sidebar-backdrop { display: none; }
        .sidebar-drawer   { display: none; }

        @media (max-width: 767px) {
          .sidebar-desktop  { display: none !important; }
          .sidebar-backdrop { display: block; }
          .sidebar-drawer   { display: flex; }
        }
      `}</style>

      {/* ── Desktop: always-visible sidebar ── */}
      <aside
        className="sidebar-desktop"
        style={{
          width: "176px",
          flexShrink: 0,
          backgroundColor: "white",
          borderRight: "1px solid #f1f5f9",
          minHeight: "100vh",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <SidebarContent activeTab={activeTab} setActiveTab={setActiveTab} unreadCount={unreadCount} />
      </aside>

      {/* ── Mobile: backdrop ── */}
      <div
        className="sidebar-backdrop"
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.45)",
          zIndex: 30,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 0.3s ease",
        }}
      />

      {/* ── Mobile: slide-in drawer ── */}
      <aside
        className="sidebar-drawer"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100%",
          width: "224px",
          backgroundColor: "white",
          zIndex: 40,
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
          flexDirection: "column",
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s ease-in-out",
        }}
      >
        {/* Drawer header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", height: "56px", borderBottom: "1px solid #f1f5f9", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "8px", backgroundColor: "#1e3a8a", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <span style={{ fontSize: "14px", fontWeight: "700", color: "#1e293b" }}>Leapmentor</span>
          </div>
          <button
            onClick={onClose}
            style={{ padding: "6px", borderRadius: "8px", border: "none", backgroundColor: "transparent", cursor: "pointer", color: "#94a3b8" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <SidebarContent activeTab={activeTab} setActiveTab={setActiveTab} onClose={onClose} unreadCount={unreadCount} />
      </aside>
    </>
  );
};

export default Sidebar;