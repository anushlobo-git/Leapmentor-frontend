// src/components/mentor/dashboard/MentorHomeTab.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

// ── Helpers ───────────────────────────────────────────────────
const getInitials = (name = "") =>
  name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

const ACCENT_COLORS = ["#3b82f6", "#22c55e", "#a855f7", "#f97316", "#ec4899"];
const getAccent = (idx) => ACCENT_COLORS[idx % ACCENT_COLORS.length];

const formatSlotDate = (slot) => {
  if (!slot?.date) return { dateNum: "—", dateMonth: "—", fullDate: "" };
  const d = new Date(slot.date + "T00:00:00");
  return {
    dateNum:   d.getDate().toString(),
    dateMonth: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    fullDate:  d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
  };
};

const formatTime = (t) => {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hour = parseInt(h);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
};

// ── Session Card ──────────────────────────────────────────────
const SessionCard = ({ request, index, navigate }) => {
  const slot      = request.confirmedSlot || request.selectedSlots?.[0];
  const { dateNum, dateMonth, fullDate } = formatSlotDate(slot);
  const timeStr   = slot ? `${formatTime(slot.startTime)} – ${formatTime(slot.endTime)}` : "Time TBD";
  const menteeName = request.mentee?.name || "Mentee";
  const isOngoing  = request.status === "ongoing";
  const accent     = getAccent(index);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 px-4 py-3.5
      shadow-sm hover:shadow-md transition-all flex items-center gap-4">

      {/* Date block */}
      <div style={{ backgroundColor: accent }}
        className="w-11 h-14 rounded-xl flex flex-col items-center justify-center shrink-0">
        <span className="text-[9px] font-bold text-white tracking-widest">{dateMonth}</span>
        <span className="text-xl font-bold text-white leading-none">{dateNum}</span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-slate-800 truncate">
            {menteeName}
          </p>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0
            ${isOngoing
              ? "bg-blue-50 text-blue-600 border border-blue-100"
              : "bg-emerald-50 text-emerald-600 border border-emerald-100"}`}>
            {isOngoing ? "Ongoing" : "Accepted"}
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5 truncate">
          {timeStr}{fullDate ? ` · ${fullDate}` : ""}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 shrink-0">
        {isOngoing ? (
          <button
            onClick={() => navigate(`/shared-dashboard/${request._id}`)}
            className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5
              rounded-lg font-semibold transition-colors"
          >
            Open Dashboard
          </button>
        ) : (
          <span className="text-xs text-slate-400 border border-slate-200
            px-3 py-1.5 rounded-lg font-medium">
            Awaiting Payment
          </span>
        )}
      </div>
    </div>
  );
};

// ── Session Skeleton ──────────────────────────────────────────
const SessionSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-100 px-4 py-3.5
    flex items-center gap-4 animate-pulse">
    <div className="w-11 h-14 rounded-xl bg-slate-200 shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-3 bg-slate-200 rounded w-2/5" />
      <div className="h-2.5 bg-slate-100 rounded w-3/5" />
    </div>
    <div className="h-8 w-28 bg-slate-200 rounded-lg" />
  </div>
);

// ── Main ──────────────────────────────────────────────────────
const MentorHomeTab = ({ user, profile }) => {
  const navigate     = useNavigate();
  const firstName    = user?.name?.split(" ")[0] || "there";
  const isFirstLogin = user?.isFirstLogin ?? false;

  const [sessions, setSessions] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${BASE_URL}/api/connect-requests/incoming`,
          { headers: authHeader() }
        );
        const all = res.data.requests || [];
        const active = all.filter(
          (r) => r.status === "ongoing" || r.status === "accepted"
        );
        setSessions(active);
      } catch (err) {
        console.error("MentorHomeTab sessions error:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  return (
    <div className="flex flex-col gap-6 max-w-2xl">

      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          {isFirstLogin ? `Welcome, ${firstName}! 👋` : `Welcome back, ${firstName}! 👋`}
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          {loading
            ? "Loading your sessions..."
            : sessions.length > 0
            ? `You have ${sessions.length} active session${sessions.length > 1 ? "s" : ""}.`
            : "No active sessions yet."}
        </p>
      </div>

      {/* Active Sessions */}
      <section>
        <h2 className="text-base font-semibold text-slate-700 mb-3">
          Active Sessions
        </h2>

        <div className="flex flex-col gap-3">
          {loading ? (
            <>
              <SessionSkeleton />
              <SessionSkeleton />
              <SessionSkeleton />
            </>
          ) : sessions.length > 0 ? (
            sessions.map((request, idx) => (
              <SessionCard
                key={request._id}
                request={request}
                index={idx}
                navigate={navigate}
              />
            ))
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-200
              rounded-2xl p-10 text-center flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200
                flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600">No active sessions</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                  Sessions appear here once a mentee completes escrow payment for an accepted request.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

    </div>
  );
};

export default MentorHomeTab;