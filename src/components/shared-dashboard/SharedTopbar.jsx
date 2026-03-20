// src/components/shared-dashboard/SharedTopbar.jsx
import { useNavigate } from "react-router-dom";

const SharedTopbar = ({ viewerRole, onMenuToggle }) => {
  const navigate = useNavigate();

  const backPath = viewerRole === "mentor"
    ? "/dashboard/mentor"
    : "/dashboard/mentee";

  return (
    <header style={{
      height: "56px",
      backgroundColor: "white",
      borderBottom: "1px solid #f1f5f9",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 24px",
      position: "sticky",
      top: 0,
      zIndex: 20,
      flexShrink: 0,
    }}>

      {/* Left — hamburger (mobile) + logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>

        {/* Mobile hamburger */}
        <button
          onClick={onMenuToggle}
          style={{
            display: "none",
            padding: "6px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "transparent",
            cursor: "pointer",
            color: "#64748b",
          }}
          className="shared-hamburger"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <img
            src="/images/logo.png"
            alt="Leapmentor logo"
            className="h-8 w-auto"
          />
          <span style={{ fontSize: "15px", fontWeight: "700", color: "#1e293b" }}>
            Leapmentor
          </span>
        </div>

        {/* Session label */}
        <div style={{
          display: "flex", alignItems: "center", gap: "6px",
          padding: "3px 10px", borderRadius: "999px",
          backgroundColor: "#eff6ff", border: "1px solid #bfdbfe",
        }}>
          <span style={{
            width: "6px", height: "6px", borderRadius: "50%",
            backgroundColor: "#22c55e",
            display: "inline-block",
            animation: "pulse 2s infinite",
          }} />
          <span style={{ fontSize: "11px", fontWeight: "600", color: "#1d4ed8" }}>
            Shared Session
          </span>
        </div>
      </div>

      {/* Right — back button */}
      <button
        onClick={() => navigate(backPath)}
        style={{
          display: "flex", alignItems: "center", gap: "6px",
          padding: "7px 14px", borderRadius: "10px",
          border: "1px solid #e2e8f0",
          backgroundColor: "white", cursor: "pointer",
          fontSize: "12px", fontWeight: "600", color: "#475569",
          transition: "all 0.15s",
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "white"}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Back to Dashboard
      </button>

      <style>{`
        @media (max-width: 767px) {
          .shared-hamburger { display: flex !important; }
        }
      `}</style>
    </header>
  );
};

export default SharedTopbar;