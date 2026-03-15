// src/components/shared-dashboard/tabs/SharedGoalsTab.jsx

const SharedGoalsTab = () => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "16px", textAlign: "center" }}>
    <div style={{
      width: "64px", height: "64px", borderRadius: "20px",
      backgroundColor: "#f5f3ff", border: "1px solid #ddd6fe",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
        stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <circle cx="12" cy="12" r="6"/>
        <circle cx="12" cy="12" r="2"/>
      </svg>
    </div>
    <div>
      <p style={{ fontSize: "16px", fontWeight: "700", color: "#1e293b" }}>Goals & Milestones</p>
      <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "4px", maxWidth: "280px", lineHeight: "1.6" }}>
        Set your session goal, break it into milestones, and track progress together. Coming soon.
      </p>
    </div>
    <span style={{
      padding: "4px 12px", borderRadius: "999px",
      backgroundColor: "#f1f5f9", border: "1px solid #e2e8f0",
      fontSize: "11px", fontWeight: "600", color: "#64748b",
    }}>
      Coming Soon
    </span>
  </div>
);

export default SharedGoalsTab;


// src/components/shared-dashboard/tabs/SharedReportTab.jsx

export const SharedReportTab = () => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "16px", textAlign: "center" }}>
    <div style={{
      width: "64px", height: "64px", borderRadius: "20px",
      backgroundColor: "#ecfeff", border: "1px solid #a5f3fc",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
        stroke="#0891b2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    </div>
    <div>
      <p style={{ fontSize: "16px", fontWeight: "700", color: "#1e293b" }}>Report</p>
      <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "4px", maxWidth: "280px", lineHeight: "1.6" }}>
        Submit session feedback, flag issues, or generate a session summary report. Coming soon.
      </p>
    </div>
    <span style={{
      padding: "4px 12px", borderRadius: "999px",
      backgroundColor: "#f1f5f9", border: "1px solid #e2e8f0",
      fontSize: "11px", fontWeight: "600", color: "#64748b",
    }}>
      Coming Soon
    </span>
  </div>
);