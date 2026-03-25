// src/components/shared-dashboard/tabs/SharedAdditionalSessionTab.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import useSessions from "../../../hooks/useSessions";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

const formatTime = (t) => {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12}:${m} ${ampm}`;
};

// ── Date Group Card ───────────────────────────────────────────
const DateGroupCard = ({ group, onSelect, existingSlotDates }) => {
  const [expanded, setExpanded] = useState(false);
  const availableCount = group.slots.filter(
    (s) => !existingSlotDates.some(
      (e) => e.date === group.date && e.startTime === s.startTime && e.endTime === s.endTime
    )
  ).length;

  return (
    <div style={{
      background: "white",
      border: "1.5px solid #e8edf5",
      borderRadius: "18px",
      overflow: "hidden",
      boxShadow: expanded ? "0 8px 32px rgba(37,99,235,0.08)" : "0 2px 8px rgba(0,0,0,0.04)",
      transition: "box-shadow 0.2s ease",
    }}>
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        style={{
          width: "100%", display: "flex", alignItems: "center",
          justifyContent: "space-between", padding: "16px 20px",
          background: "none", border: "none", cursor: "pointer",
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = "#f8faff"}
        onMouseLeave={(e) => e.currentTarget.style.background = "none"}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {/* Date badge */}
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", width: "48px", height: "48px",
            borderRadius: "14px", background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
            boxShadow: "0 4px 12px rgba(37,99,235,0.3)", flexShrink: 0,
          }}>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "rgba(255,255,255,0.8)", lineHeight: 1 }}>
              {new Date(group.date + "T00:00:00").toLocaleDateString("en-US", { month: "short" }).toUpperCase()}
            </span>
            <span style={{ fontSize: "18px", fontWeight: "800", color: "white", lineHeight: 1.1 }}>
              {new Date(group.date + "T00:00:00").getDate()}
            </span>
          </div>
          <div style={{ textAlign: "left" }}>
            <p style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a", margin: 0 }}>
              {group.day}, {new Date(group.date + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric" })}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "3px" }}>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: "4px",
                fontSize: "11px", fontWeight: "600",
                color: availableCount > 0 ? "#16a34a" : "#94a3b8",
                background: availableCount > 0 ? "#f0fdf4" : "#f8fafc",
                border: `1px solid ${availableCount > 0 ? "#bbf7d0" : "#e2e8f0"}`,
                padding: "2px 8px", borderRadius: "999px",
              }}>
                <span style={{
                  width: "5px", height: "5px", borderRadius: "50%",
                  background: availableCount > 0 ? "#22c55e" : "#cbd5e1",
                  display: "inline-block",
                }} />
                {availableCount} slot{availableCount !== 1 ? "s" : ""} free
              </span>
            </div>
          </div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: expanded ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.25s ease", flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {expanded && (
        <div style={{
          borderTop: "1px solid #f1f5f9",
          padding: "12px 16px 16px",
          display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "8px",
        }}>
          {group.slots.map((slot, i) => {
            const isBooked = existingSlotDates.some(
              (e) => e.date === group.date && e.startTime === slot.startTime && e.endTime === slot.endTime
            );
            return (
              <button
                key={i}
                type="button"
                disabled={isBooked}
                onClick={() => !isBooked && onSelect({
                  day: group.day, date: group.date,
                  startTime: slot.startTime, endTime: slot.endTime,
                })}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "flex-start",
                  gap: "4px", padding: "12px 14px", borderRadius: "14px",
                  border: isBooked ? "1.5px solid #f1f5f9" : "1.5px solid #dbeafe",
                  background: isBooked ? "#fafafa" : "linear-gradient(135deg, #eff6ff, #dbeafe)",
                  cursor: isBooked ? "not-allowed" : "pointer",
                  transition: "all 0.15s", textAlign: "left",
                  opacity: isBooked ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isBooked) {
                    e.currentTarget.style.background = "linear-gradient(135deg, #2563eb, #1d4ed8)";
                    e.currentTarget.style.border = "1.5px solid #2563eb";
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(37,99,235,0.25)";
                    e.currentTarget.querySelectorAll("span").forEach(s => {
                      s.style.color = "white";
                    });
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isBooked) {
                    e.currentTarget.style.background = "linear-gradient(135deg, #eff6ff, #dbeafe)";
                    e.currentTarget.style.border = "1.5px solid #dbeafe";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.querySelectorAll("span").forEach((s, idx) => {
                      s.style.color = idx === 0 ? "#1d4ed8" : "#64748b";
                    });
                  }
                }}
              >
                <span style={{ fontSize: "13px", fontWeight: "700", color: isBooked ? "#cbd5e1" : "#1d4ed8", transition: "color 0.15s" }}>
                  {formatTime(slot.startTime)}
                </span>
                <span style={{ fontSize: "11px", fontWeight: "500", color: isBooked ? "#cbd5e1" : "#64748b", transition: "color 0.15s" }}>
                  {isBooked ? "Already booked" : `→ ${formatTime(slot.endTime)}`}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── Confirm Modal ─────────────────────────────────────────────
const ConfirmModal = ({ slot, onConfirm, onCancel, saving }) => {
  const dateLabel = new Date(slot.date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });
  const timeLabel = slot.startTime && slot.endTime
    ? `${formatTime(slot.startTime)} – ${formatTime(slot.endTime)}`
    : "";

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 50,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(15,23,42,0.5)", backdropFilter: "blur(6px)",
      padding: "16px",
    }}>
      <div style={{
        background: "white", borderRadius: "28px",
        boxShadow: "0 32px 80px rgba(0,0,0,0.18)", width: "100%", maxWidth: "380px",
        padding: "28px", display: "flex", flexDirection: "column", gap: "20px",
        animation: "modalIn 0.25s cubic-bezier(0.34,1.56,0.64,1)",
      }}>
        <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.88) translateY(20px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{
            width: "48px", height: "48px", borderRadius: "16px",
            background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 20px rgba(37,99,235,0.3)",
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div>
            <p style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", margin: 0 }}>Confirm Session</p>
            <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0, marginTop: "2px" }}>Adding to your ongoing mentorship</p>
          </div>
        </div>

        {/* Slot preview */}
        <div style={{
          background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
          border: "1.5px solid #bfdbfe", borderRadius: "18px",
          padding: "18px 20px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <span style={{ fontSize: "10px", fontWeight: "700", color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              📅 Date
            </span>
          </div>
          <p style={{ fontSize: "15px", fontWeight: "700", color: "#1e3a8a", margin: 0 }}>{dateLabel}</p>
          {timeLabel && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              marginTop: "8px", background: "white", border: "1px solid #bfdbfe",
              borderRadius: "999px", padding: "4px 12px",
            }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#2563eb" }}>{timeLabel}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button type="button" onClick={onCancel} disabled={saving}
            style={{
              flex: 1, padding: "12px", borderRadius: "14px",
              border: "1.5px solid #e2e8f0", background: "white",
              fontSize: "13px", fontWeight: "600", color: "#64748b",
              cursor: "pointer", transition: "all 0.15s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
            onMouseLeave={(e) => e.currentTarget.style.background = "white"}
          >
            Cancel
          </button>
          <button type="button" onClick={onConfirm} disabled={saving}
            style={{
              flex: 1, padding: "12px", borderRadius: "14px",
              border: "none",
              background: saving ? "#93c5fd" : "linear-gradient(135deg, #2563eb, #1d4ed8)",
              fontSize: "13px", fontWeight: "700", color: "white",
              cursor: saving ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              boxShadow: saving ? "none" : "0 4px 16px rgba(37,99,235,0.35)",
              transition: "all 0.15s",
            }}
          >
            {saving ? (
              <><span style={{ width: "14px", height: "14px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", animation: "spin 0.7s linear infinite", display: "inline-block" }}/> Adding...</>
            ) : (
              <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Confirm</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Success Screen ────────────────────────────────────────────
const SuccessScreen = ({ slot, onDone }) => {
  const dateLabel = new Date(slot.date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "20px", padding: "48px 24px" }}>
      <style>{`@keyframes popIn { from { opacity:0; transform:scale(0.5); } to { opacity:1; transform:scale(1); } } @keyframes spin { to { transform:rotate(360deg); } }`}</style>
      <div style={{
        width: "80px", height: "80px", borderRadius: "50%",
        background: "linear-gradient(135deg, #22c55e, #16a34a)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 12px 32px rgba(34,197,94,0.35)",
        animation: "popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)",
      }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <div>
        <p style={{ fontSize: "22px", fontWeight: "800", color: "#16a34a", margin: 0 }}>Session Added!</p>
        <p style={{ fontSize: "14px", color: "#64748b", marginTop: "6px" }}>{dateLabel}</p>
        <p style={{ fontSize: "13px", fontWeight: "600", color: "#2563eb", marginTop: "4px" }}>
          {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
        </p>
      </div>
      <div style={{
        background: "#f0fdf4", border: "1px solid #bbf7d0",
        borderRadius: "16px", padding: "14px 20px", maxWidth: "300px",
      }}>
        <p style={{ fontSize: "12px", color: "#16a34a", fontWeight: "500", lineHeight: "1.6", margin: 0 }}>
          ✅ The new session has been added to your ongoing mentorship. Both parties can mark it complete when done.
        </p>
      </div>
      <button type="button" onClick={onDone}
        style={{
          padding: "12px 28px", borderRadius: "14px", border: "none",
          background: "linear-gradient(135deg, #0f172a, #1e293b)",
          fontSize: "13px", fontWeight: "700", color: "white",
          cursor: "pointer", boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
          transition: "all 0.15s",
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-1px)"}
        onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
      >
        View in Goals Tab →
      </button>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────
const SharedAdditionalSessionTab = ({ connect, onTabChange }) => {
  const [availability,     setAvailability]     = useState([]);
  const [sessionDurations, setSessionDurations] = useState([30, 60]);
  const [duration,         setDuration]         = useState(60);
  const [availLoading,     setAvailLoading]     = useState(true);
  const [availError,       setAvailError]       = useState("");
  const [selectedSlot,     setSelectedSlot]     = useState(null);
  const [successSlot,      setSuccessSlot]      = useState(null);

  const { slots, saving, addSlot } = useSessions(connect?._id);

  const existingSlotDates = slots.map((s) => ({
    date: s.date, startTime: s.startTime, endTime: s.endTime,
  }));

  const fetchAvailability = async (dur) => {
    if (!connect?._id) return;
    try {
      setAvailLoading(true);
      setAvailError("");
      const res = await axios.get(
        `${BASE_URL}/api/sessions/${connect._id}/mentor-availability?duration=${dur}`,
        { headers: authHeader() }
      );
      setAvailability(res.data.slots || []);
      if (res.data.sessionDurations?.length) setSessionDurations(res.data.sessionDurations);
    } catch (err) {
      setAvailError(err?.response?.data?.message || "Failed to load availability.");
    } finally {
      setAvailLoading(false);
    }
  };

  useEffect(() => { fetchAvailability(duration); }, [connect?._id]);

  const handleDurationChange = (dur) => { setDuration(dur); fetchAvailability(dur); };

  const handleConfirm = async () => {
    if (!selectedSlot) return;
    const result = await addSlot(selectedSlot);
    if (result?.success) { setSuccessSlot(selectedSlot); setSelectedSlot(null); }
  };

  if (!connect?._id) return null;

  const viewerRole  = connect?.viewerRole || "mentee";
  const isMentor    = viewerRole === "mentor";
  const mentorName  = connect?.mentor?.name || "Mentor";
  const isCompleted = connect?.status === "completed";

  if (successSlot) {
    return <SuccessScreen slot={successSlot} onDone={() => { setSuccessSlot(null); onTabChange?.("goals"); }} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <style>{`@keyframes spin { to { transform:rotate(360deg); } } @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }`}</style>

      {/* Header */}
      <div style={{ animation: "fadeUp 0.3s ease" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "14px",
            background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 6px 16px rgba(37,99,235,0.28)",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
              <line x1="12" y1="14" x2="12" y2="20"/>
              <line x1="9" y1="17" x2="15" y2="17"/>
            </svg>
          </div>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", margin: 0 }}>Additional Session</h1>
            <p style={{ fontSize: "13px", color: "#1e3a8a", margin: 0, marginTop: "2px" }}>
              Book another session with your {isMentor ? "mentee" : "mentor"}
            </p>
          </div>
        </div>
      </div>

      {/* Completed warning */}
      {isCompleted && (
        <div style={{
          display: "flex", alignItems: "center", gap: "12px",
          background: "#fffbeb", border: "1.5px solid #fde68a",
          borderRadius: "16px", padding: "14px 18px",
        }}>
          <span style={{ fontSize: "20px" }}>⚠️</span>
          <p style={{ fontSize: "13px", color: "#92400e", fontWeight: "500", margin: 0 }}>
            This session is completed. Additional slots cannot be added.
          </p>
        </div>
      )}

      {!isCompleted && (
        <>
          {/* Info banner */}
          <div style={{
            display: "flex", alignItems: "flex-start", gap: "12px",
            background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
            border: "1.5px solid #bfdbfe", borderRadius: "16px", padding: "14px 18px",
          }}>
            <div style={{
              width: "28px", height: "28px", borderRadius: "8px",
              background: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <p style={{ fontSize: "12px", color: "#1d4ed8", fontWeight: "500", lineHeight: "1.6", margin: 0 }}>
              {isMentor
                ? <>Your availability is shown below. If no slots appear, go to your <strong>Dashboard → Availability tab</strong> to add times first.</>
                : <>Pick a session duration then select a time slot from <strong>{mentorName}'s</strong> schedule.</>
              }
            </p>
          </div>

          {/* Duration picker */}
          <div>
            <p style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px" }}>
              Session Duration
            </p>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {sessionDurations.map((dur) => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => handleDurationChange(dur)}
                  style={{
                    padding: "8px 20px", borderRadius: "12px",
                    border: duration === dur ? "none" : "1.5px solid #e2e8f0",
                    background: duration === dur
                      ? "linear-gradient(135deg, #2563eb, #1d4ed8)"
                      : "white",
                    fontSize: "12px", fontWeight: "700",
                    color: duration === dur ? "white" : "#64748b",
                    cursor: "pointer",
                    boxShadow: duration === dur ? "0 4px 14px rgba(37,99,235,0.3)" : "none",
                    transition: "all 0.2s",
                  }}
                >
                  {dur} min
                </button>
              ))}
            </div>
          </div>

          {/* Availability */}
          {availLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[1,2,3].map((i) => (
                <div key={i} style={{
                  height: "72px", borderRadius: "18px",
                  background: "linear-gradient(90deg, #f1f5f9 25%, #e8edf5 50%, #f1f5f9 75%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.4s infinite",
                }} />
              ))}
              <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
            </div>
          ) : availError ? (
            <div style={{
              display: "flex", alignItems: "center", gap: "10px",
              background: "#fef2f2", border: "1.5px solid #fecaca",
              borderRadius: "14px", padding: "14px 18px",
            }}>
              <span>⚠️</span>
              <p style={{ fontSize: "13px", color: "#dc2626", margin: 0 }}>{availError}</p>
            </div>
          ) : availability.length === 0 ? (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              padding: "56px 24px", textAlign: "center", gap: "16px",
              background: "white", border: "1.5px dashed #e2e8f0", borderRadius: "20px",
            }}>
              <div style={{
                width: "56px", height: "56px", borderRadius: "18px",
                background: "#f8fafc", border: "1.5px solid #e2e8f0",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <div>
                <p style={{ fontSize: "14px", fontWeight: "700", color: "#334155", margin: 0 }}>No slots available</p>
                <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "6px", maxWidth: "260px", lineHeight: "1.6" }}>
                  {isMentor
                    ? "Go to your Dashboard → Availability tab to add time slots."
                    : `${mentorName} hasn't set availability yet, or no ${duration}-min slots are free.`
                  }
                </p>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <p style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>
                {isMentor ? "Your Available Slots" : `${mentorName}'s Available Slots`}
              </p>
              {availability.map((group, i) => (
                <div key={i} style={{ animation: `fadeUp 0.3s ease ${i * 0.05}s both` }}>
                  <DateGroupCard
                    group={group}
                    onSelect={setSelectedSlot}
                    existingSlotDates={existingSlotDates}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {selectedSlot && (
        <ConfirmModal
          slot={selectedSlot}
          onConfirm={handleConfirm}
          onCancel={() => setSelectedSlot(null)}
          saving={saving}
        />
      )}
    </div>
  );
};

export default SharedAdditionalSessionTab;