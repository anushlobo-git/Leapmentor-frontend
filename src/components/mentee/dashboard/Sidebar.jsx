import { useEffect } from "react";
import {
  Home, User, Search, Bell, History,
  Users, Settings, HelpCircle, X
} from "lucide-react";

const NAV_ITEMS = [
  { key: "home", label: "Home", icon: <Home size={16} /> },
  { key: "profile", label: "Profile", icon: <User size={16} /> },
  { key: "findMentors", label: "Find Mentors", icon: <Search size={16} /> },
  { key: "notifications", label: "Notifications", icon: <Bell size={16} /> },
  { key: "history", label: "History", icon: <History size={16} /> },
  { key: "connects", label: "Connects", icon: <Users size={16} /> },
  { key: "settings", label: "Settings", icon: <Settings size={16} /> },
];

const Badge = ({ count }) => {
  if (!count || count === 0) return null;
  return (
    <span className="sidebar-badge">
      {count > 99 ? "99+" : count}
    </span>
  );
};

const CSS = `
  .sidebar-root {
    width: 228px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    background: linear-gradient(160deg, #eef4ff 0%, #f5f0ff 45%, #edfdf8 100%);
    border-right: 1px solid rgba(148,163,184,0.18);
    position: relative;
    overflow: hidden;
  }

  .sidebar-blob-top {
    position: absolute;
    top: -50px; right: -30px;
    width: 160px; height: 160px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%);
    pointer-events: none;
  }

  .sidebar-blob-mid {
    position: absolute;
    top: 40%; left: -30px;
    width: 120px; height: 120px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%);
    pointer-events: none;
  }

  .sidebar-blob-bottom {
    position: absolute;
    bottom: 60px; left: -20px;
    width: 130px; height: 130px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(16,185,129,0.13) 0%, transparent 70%);
    pointer-events: none;
  }

  .sidebar-nav {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 14px 10px 0;
    flex: 1;
  }

  .sidebar-nav-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 12px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 500;
    border: 1px solid transparent;
    cursor: pointer;
    text-align: left;
    width: 100%;
    background: transparent;
    color: #1e293b;
    position: relative;
    transition: background 0.15s, color 0.15s, box-shadow 0.15s;
    letter-spacing: 0;
    white-space: nowrap;
  }

  .sidebar-nav-btn:hover {
    background: rgba(255,255,255,0.72);
    color: #0f172a;
    box-shadow: 0 1px 6px rgba(99,102,241,0.08);
  }

  .sidebar-nav-btn.active {
    background: rgba(255,255,255,0.95);
    color: #1e3a8a;
    font-weight: 700;
    letter-spacing: -0.01em;
    box-shadow: 0 2px 14px rgba(99,102,241,0.18), inset 0 1px 0 rgba(255,255,255,1);
    border-color: rgba(99,102,241,0.18);
    backdrop-filter: blur(10px);
  }

  .sidebar-nav-icon {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    color: #64748b;
    transition: color 0.15s;
  }

  .sidebar-nav-btn:hover .sidebar-nav-icon {
    color: #6366f1;
  }

  .sidebar-nav-btn.active .sidebar-nav-icon {
    color: #4f46e5;
  }

  .sidebar-accent {
    position: absolute;
    left: 0; top: 50%;
    transform: translateY(-50%);
    width: 3px; height: 20px;
    border-radius: 0 4px 4px 0;
    background: linear-gradient(180deg, #818cf8, #4f46e5);
    box-shadow: 0 0 10px rgba(99,102,241,0.55);
  }

  .sidebar-badge {
    margin-left: auto;
    background: linear-gradient(135deg, #f87171, #ef4444);
    color: white;
    font-size: 9px;
    font-weight: 800;
    border-radius: 999px;
    min-width: 17px;
    height: 17px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 5px;
    line-height: 1;
    box-shadow: 0 2px 8px rgba(239,68,68,0.38);
    letter-spacing: 0.02em;
  }

  .sidebar-support {
    padding: 0 10px 28px;
  }

  .sidebar-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(148,163,184,0.25), transparent);
    margin: 10px 10px 12px;
  }

  .sidebar-support-label {
    font-size: 9px;
    font-weight: 800;
    color: #a0aec0;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    padding: 0 12px;
    margin-bottom: 4px;
    display: block;
  }

  /* ── Sticky desktop sidebar ── */
  .mentee-sidebar-desktop {
    display: flex;
    position: sticky;
    top: 0;
    height: 100vh;
    align-self: flex-start;
  }

  .mentee-sidebar-backdrop,
  .mentee-sidebar-drawer { display: none; }

  @media (max-width: 767px) {
    .mentee-sidebar-desktop { display: none !important; }
    .mentee-sidebar-backdrop { display: block; }
    .mentee-sidebar-drawer { display: flex; }
  }
`;

const SidebarContent = ({ activeTab, setActiveTab, onClose, unreadCount }) => (
  <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", position: "relative", zIndex: 1 }}>
    <div>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => { setActiveTab(item.key); onClose?.(); }}
              className={`sidebar-nav-btn${isActive ? " active" : ""}`}
            >
              {isActive && <span className="sidebar-accent" />}
              <span className="sidebar-nav-icon">{item.icon}</span>
              {item.label}
              {item.key === "notifications" && <Badge count={unreadCount} />}
            </button>
          );
        })}
      </nav>
    </div>

    <div className="sidebar-support">
      <div className="sidebar-divider" />
      <span className="sidebar-support-label">Support</span>
      <button
        onClick={() => { setActiveTab("help"); onClose?.(); }}
        className={`sidebar-nav-btn${activeTab === "help" ? " active" : ""}`}
      >
        {activeTab === "help" && <span className="sidebar-accent" />}
        <span className="sidebar-nav-icon"><HelpCircle size={16} /></span>
        Help Center
      </button>
    </div>
  </div>
);

const Sidebar = ({ activeTab, setActiveTab, isOpen, onClose, unreadCount = 0 }) => {
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      <style>{CSS}</style>

      {/* Desktop */}
      <aside className="mentee-sidebar-desktop sidebar-root">
        <div className="sidebar-blob-top" />
        <div className="sidebar-blob-mid" />
        <div className="sidebar-blob-bottom" />
        <SidebarContent activeTab={activeTab} setActiveTab={setActiveTab} unreadCount={unreadCount} />
      </aside>

      {/* Mobile backdrop */}
      <div
        className="mentee-sidebar-backdrop"
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          backgroundColor: "rgba(15,23,42,0.45)",
          backdropFilter: "blur(4px)",
          zIndex: 30,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 0.3s ease",
        }}
      />

      {/* Mobile drawer */}
      <aside
        className="mentee-sidebar-drawer sidebar-root"
        style={{
          position: "fixed",
          top: 0, left: 0,
          height: "100%",
          width: "232px",
          zIndex: 40,
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.2)",
          flexDirection: "column",
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className="sidebar-blob-top" />
        <div className="sidebar-blob-mid" />
        <div className="sidebar-blob-bottom" />

        {/* Close button */}
        <div style={{ display: "flex", justifyContent: "flex-end", padding: "12px 16px 0", flexShrink: 0 }}>
          <button
            onClick={onClose}
            style={{
              padding: "6px", borderRadius: "8px", border: "none",
              background: "rgba(148,163,184,0.15)", cursor: "pointer",
              color: "#64748b", display: "flex", alignItems: "center",
            }}
          >
            <X size={16} />
          </button>
        </div>

        <SidebarContent activeTab={activeTab} setActiveTab={setActiveTab} onClose={onClose} unreadCount={unreadCount} />
      </aside>
    </>
  );
};

export default Sidebar;