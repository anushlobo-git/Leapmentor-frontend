// src/components/shared-dashboard/tabs/SharedHomeTab.jsx

const getInitials = (name = "") =>
  name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

const GRADIENTS = [
  "linear-gradient(135deg, #3b82f6, #1d4ed8)",
  "linear-gradient(135deg, #8b5cf6, #6d28d9)",
  "linear-gradient(135deg, #10b981, #047857)",
  "linear-gradient(135deg, #f59e0b, #b45309)",
  "linear-gradient(135deg, #ef4444, #b91c1c)",
];

const getGradient = (name = "") =>
  GRADIENTS[name.charCodeAt(0) % GRADIENTS.length];

const formatSlot = (slot) => {
  if (!slot) return null;
  const date = new Date(slot.date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });
  const fmt = (t) => {
    const [h, m] = t.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    return `${hour % 12 || 12}:${m} ${ampm}`;
  };
  return `${date} · ${fmt(slot.startTime)} – ${fmt(slot.endTime)}`;
};

const formatDate = (d) => d
  ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  : null;

// ── Person Card ───────────────────────────────────────────────
const PersonCard = ({ name, profile, roleLabel }) => {
  const picture  = profile?.profilePicture || "";
  const role     = profile?.currentRole || "";
  const company  = profile?.company || "";
  const skills   = profile?.skills?.slice(0, 3) || [];

  return (
    <div style={{
      flex: 1, backgroundColor: "white",
      border: "1px solid #e2e8f0", borderRadius: "16px",
      padding: "20px", display: "flex", flexDirection: "column", gap: "12px",
    }}>
      {/* Role label */}
      <p style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {roleLabel}
      </p>

      {/* Avatar + name */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {picture ? (
          <img src={picture} alt={name} style={{
            width: "48px", height: "48px", borderRadius: "14px",
            objectFit: "cover", border: "2px solid #f1f5f9", flexShrink: 0,
          }} />
        ) : (
          <div style={{
            width: "48px", height: "48px", borderRadius: "14px",
            background: getGradient(name), flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontWeight: "700", fontSize: "16px",
          }}>
            {getInitials(name)}
          </div>
        )}
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: "14px", fontWeight: "700", color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {name}
          </p>
          {(role || company) && (
            <p style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {role}{role && company ? " @ " : ""}{company}
            </p>
          )}
        </div>
      </div>

      {/* Skills */}
      {skills.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
          {skills.map((s, i) => (
            <span key={i} style={{
              padding: "2px 8px", borderRadius: "999px",
              backgroundColor: "#f1f5f9", border: "1px solid #e2e8f0",
              fontSize: "10px", fontWeight: "600", color: "#475569",
            }}>
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Info row ──────────────────────────────────────────────────
const InfoRow = ({ icon, label, value, accent }) => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
    <span style={{ color: "#94a3b8", marginTop: "1px", flexShrink: 0 }}>{icon}</span>
    <div style={{ flex: 1 }}>
      <p style={{ fontSize: "10px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </p>
      <p style={{ fontSize: "13px", fontWeight: "600", color: accent || "#1e293b", marginTop: "2px" }}>
        {value}
      </p>
    </div>
  </div>
);

// ── Quick action button ───────────────────────────────────────
const QuickAction = ({ icon, label, onClick, color = "#2563eb" }) => (
  <button
    onClick={onClick}
    style={{
      flex: 1, display: "flex", flexDirection: "column",
      alignItems: "center", gap: "6px",
      padding: "14px 10px", borderRadius: "14px",
      border: "1px solid #e2e8f0", backgroundColor: "white",
      cursor: "pointer", transition: "all 0.15s",
    }}
    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"}
    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "white"}
  >
    <span style={{ color }}>{icon}</span>
    <span style={{ fontSize: "11px", fontWeight: "600", color: "#475569" }}>{label}</span>
  </button>
);

// ── Main ──────────────────────────────────────────────────────
const SharedHomeTab = ({ connect, onTabChange }) => {
  const {
    mentor, mentee,
    mentorProfile, menteeProfile,
    confirmedSlot, totalAmount, paidAt,
  } = connect;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#1e293b" }}>
          Session Overview
        </h1>
        <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "4px" }}>
          Your active mentorship session details and participants.
        </p>
      </div>

      {/* Participants */}
      <div>
        <p style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>
          Participants
        </p>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <PersonCard name={mentor?.name || "Mentor"} profile={mentorProfile} roleLabel="Mentor" />
          <PersonCard name={mentee?.name || "Mentee"} profile={menteeProfile} roleLabel="Mentee" />
        </div>
      </div>

      {/* Session details */}
      <div style={{
        backgroundColor: "white", border: "1px solid #e2e8f0",
        borderRadius: "16px", padding: "20px",
        display: "flex", flexDirection: "column", gap: "16px",
      }}>
        <p style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Session Details
        </p>

        {confirmedSlot && (
          <InfoRow
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            }
            label="Confirmed Session"
            value={formatSlot(confirmedSlot)}
          />
        )}

        {totalAmount != null && (
          <InfoRow
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            }
            label="Tokens in Escrow"
            value={`${totalAmount} tokens secured`}
            accent="#2563eb"
          />
        )}

        {paidAt && (
          <InfoRow
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            }
            label="Session Started"
            value={formatDate(paidAt)}
          />
        )}
      </div>

      {/* Quick actions */}
      <div>
        <p style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>
          Quick Actions
        </p>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <QuickAction
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            }
            label="Open Chat"
            onClick={() => onTabChange("chat")}
            color="#2563eb"
          />
          <QuickAction
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="6"/>
                <circle cx="12" cy="12" r="2"/>
              </svg>
            }
            label="Set Goals"
            onClick={() => onTabChange("goals")}
            color="#7c3aed"
          />
          <QuickAction
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            }
            label="Report"
            onClick={() => onTabChange("report")}
            color="#0891b2"
          />
        </div>
      </div>

    </div>
  );
};

export default SharedHomeTab;