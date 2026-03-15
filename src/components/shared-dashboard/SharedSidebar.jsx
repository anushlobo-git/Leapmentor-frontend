// src/components/shared-dashboard/SharedSidebar.jsx
import { useEffect } from "react";

const NAV_ITEMS = [
  {
    key: "home", label: "Home",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    key: "chat", label: "Chat",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  {
    key: "goals", label: "Goals",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <circle cx="12" cy="12" r="6"/>
        <circle cx="12" cy="12" r="2"/>
      </svg>
    ),
  },
  {
    key: "notes", label: "Notes", // ✅ new
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
      </svg>
    ),
  },
  {
    key: "report", label: "Report",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
  },
];

const SidebarContent = ({ activeTab, setActiveTab, onClose }) => (
  <nav style={{ display: "flex", flexDirection: "column", gap: "2px", padding: "16px 12px 0" }}>
    {NAV_ITEMS.map((item) => {
      const isActive = activeTab === item.key;
      return (
        <button
          key={item.key}
          onClick={() => { setActiveTab(item.key); onClose?.(); }}
          style={{
            display: "flex", alignItems: "center", gap: "12px",
            padding: "10px 12px", borderRadius: "12px",
            fontSize: "14px", fontWeight: isActive ? "600" : "500",
            border: "none", cursor: "pointer", textAlign: "left", width: "100%",
            backgroundColor: isActive ? "#eff6ff" : "transparent",
            color: isActive ? "#1e3a8a" : "#64748b",
            transition: "all 0.15s",
          }}
        >
          <span style={{ color: isActive ? "#1e3a8a" : "#94a3b8", display: "flex", alignItems: "center" }}>
            {item.icon}
          </span>
          {item.label}
        </button>
      );
    })}
  </nav>
);

const SharedSidebar = ({ activeTab, setActiveTab, isOpen, onClose }) => {
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      <style>{`
        .shared-sidebar-desktop  { display: flex; }
        .shared-sidebar-backdrop { display: none; }
        .shared-sidebar-drawer   { display: none; }
        @media (max-width: 767px) {
          .shared-sidebar-desktop  { display: none !important; }
          .shared-sidebar-backdrop { display: block; }
          .shared-sidebar-drawer   { display: flex; }
        }
      `}</style>

      {/* Desktop */}
      <aside className="shared-sidebar-desktop" style={{
        width: "176px", flexShrink: 0,
        backgroundColor: "white", borderRight: "1px solid #f1f5f9",
        minHeight: "100%", flexDirection: "column",
      }}>
        <SidebarContent activeTab={activeTab} setActiveTab={setActiveTab} />
      </aside>

      {/* Mobile backdrop */}
      <div className="shared-sidebar-backdrop" onClick={onClose} style={{
        position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.45)",
        zIndex: 30, opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? "auto" : "none", transition: "opacity 0.3s ease",
      }} />

      {/* Mobile drawer */}
      <aside className="shared-sidebar-drawer" style={{
        position: "fixed", top: 0, left: 0, height: "100%", width: "224px",
        backgroundColor: "white", zIndex: 40,
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
        flexDirection: "column",
        transform: isOpen ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.3s ease-in-out",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 16px", height: "56px",
          borderBottom: "1px solid #f1f5f9", flexShrink: 0,
        }}>
          <span style={{ fontSize: "14px", fontWeight: "700", color: "#1e293b" }}>Session Menu</span>
          <button onClick={onClose} style={{
            padding: "6px", borderRadius: "8px", border: "none",
            backgroundColor: "transparent", cursor: "pointer", color: "#94a3b8",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <SidebarContent activeTab={activeTab} setActiveTab={setActiveTab} onClose={onClose} />
      </aside>
    </>
  );
};

export default SharedSidebar;