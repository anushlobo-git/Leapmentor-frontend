// src/components/admin/AdminSupportMessages.jsx
import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const STATUS_STYLES = {
  open:     { background: "#fef9c3", color: "#854d0e", label: "Open" },
  resolved: { background: "#dcfce7", color: "#166534", label: "Resolved" },
};

export default function AdminSupportMessages() {
  const [messages, setMessages]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [filter, setFilter]       = useState("all");   // all | open | resolved
  const [expanded, setExpanded]   = useState(null);

  const token = localStorage.getItem("adminToken");

  const fetchMessages = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/support/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load messages");
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMessages(); }, []);

  const markResolved = async (id) => {
    try {
      await fetch(`${API_BASE}/api/support/messages/${id}/resolve`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages((prev) =>
        prev.map((m) => m._id === id ? { ...m, status: "resolved" } : m)
      );
    } catch {
      alert("Failed to update status");
    }
  };

  const filtered = messages.filter((m) => filter === "all" || m.status === filter);

  const openCount     = messages.filter((m) => m.status === "open").length;
  const resolvedCount = messages.filter((m) => m.status === "resolved").length;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: "0 0 4px" }}>Support Messages</h1>
        <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>Messages sent by mentors and mentees from the Help Center.</p>
      </div>

      {/* Stat pills */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { label: "Total", count: messages.length, bg: "#f1f5f9", color: "#334155" },
          { label: "Open", count: openCount, bg: "#fef9c3", color: "#854d0e" },
          { label: "Resolved", count: resolvedCount, bg: "#dcfce7", color: "#166534" },
        ].map((s) => (
          <div key={s.label} style={{ padding: "10px 20px", borderRadius: 12, background: s.bg, display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.count}</span>
            <span style={{ fontSize: 13, color: s.color, fontWeight: 500 }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["all", "open", "resolved"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "6px 18px", borderRadius: 20, fontSize: 13, fontWeight: 500,
            cursor: "pointer", border: "1.5px solid",
            borderColor: filter === f ? "#2563eb" : "#e2e8f0",
            background: filter === f ? "#2563eb" : "#fff",
            color: filter === f ? "#fff" : "#64748b",
            textTransform: "capitalize", transition: "all 0.15s",
          }}>
            {f}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>⏳</div>
          <p>Loading messages...</p>
        </div>
      ) : error ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#ef4444" }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>⚠️</div>
          <p>{error}</p>
          <button onClick={fetchMessages} style={{ marginTop: 12, padding: "8px 20px", borderRadius: 8, background: "#2563eb", color: "#fff", border: "none", cursor: "pointer", fontSize: 14 }}>
            Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
          <p>No {filter !== "all" ? filter : ""} messages yet.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((msg) => {
            const isOpen   = expanded === msg._id;
            const statusSt = STATUS_STYLES[msg.status] || STATUS_STYLES.open;
            return (
              <div key={msg._id} style={{
                background: "#fff", borderRadius: 14,
                border: `1.5px solid ${isOpen ? "#bfdbfe" : "#e2e8f0"}`,
                overflow: "hidden", transition: "border-color 0.2s",
              }}>
                {/* Row */}
                <div
                  onClick={() => setExpanded(isOpen ? null : msg._id)}
                  style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", cursor: "pointer" }}
                >
                  {/* Role badge */}
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, flexShrink: 0,
                    background: msg.role === "mentor" ? "#fef3c7" : "#eef2ff",
                    color: msg.role === "mentor" ? "#b45309" : "#4f46e5",
                    textTransform: "capitalize",
                  }}>
                    {msg.role || "user"}
                  </span>

                  {/* Subject + email */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {msg.subject}
                    </p>
                    <p style={{ margin: 0, fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{msg.email}</p>
                  </div>

                  {/* Date */}
                  <span style={{ fontSize: 12, color: "#94a3b8", flexShrink: 0 }}>
                    {new Date(msg.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>

                  {/* Status */}
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, flexShrink: 0, background: statusSt.background, color: statusSt.color }}>
                    {statusSt.label}
                  </span>

                  {/* Chevron */}
                  <span style={{ color: "#94a3b8", fontSize: 14, transition: "transform 0.2s", display: "inline-block", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
                </div>

                {/* Expanded message */}
                {isOpen && (
                  <div style={{ padding: "0 20px 20px", borderTop: "1px solid #f1f5f9" }}>
                    <p style={{ marginTop: 14, fontSize: 14, color: "#475569", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{msg.message}</p>
                    {msg.status === "open" && (
                      <button
                        onClick={() => markResolved(msg._id)}
                        style={{ marginTop: 14, padding: "8px 18px", borderRadius: 8, background: "#16a34a", color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 }}
                      >
                        ✓ Mark as Resolved
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}