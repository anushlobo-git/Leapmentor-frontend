// src/components/mentee/dashboard/NotificationsTab.jsx
import { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// ── Type config (mirrors mentor tab) ─────────────────────────
const TYPE_CONFIG = {
  connect_request_received: { bg: "bg-blue-100",   stroke: "#3b82f6", label: "Connect Request",   tint: "bg-blue-50/60",   border: "border-blue-200"  },
  connect_request:          { bg: "bg-blue-100",   stroke: "#3b82f6", label: "Connect Request",   tint: "bg-blue-50/60",   border: "border-blue-200"  },
  connect_request_accepted: { bg: "bg-green-100",  stroke: "#22c55e", label: "Accepted",          tint: "bg-green-50/60",  border: "border-green-200" },
  connect_request_declined: { bg: "bg-red-100",    stroke: "#ef4444", label: "Declined",          tint: "bg-red-50/40",    border: "border-red-200"   },
  upcoming_session:         { bg: "bg-blue-100",   stroke: "#3b82f6", label: "Upcoming Session",  tint: "bg-blue-50/60",   border: "border-blue-200"  },
  new_message:              { bg: "bg-slate-100",  stroke: "#64748b", label: "New Message",       tint: "bg-slate-50/80",  border: "border-slate-200" },
  session_completed:        { bg: "bg-green-100",  stroke: "#22c55e", label: "Session Completed", tint: "bg-green-50/60",  border: "border-green-200" },
  new_review:               { bg: "bg-yellow-100", stroke: "#f59e0b", label: "New Review",        tint: "bg-yellow-50/60", border: "border-yellow-200"},
  feedback:                 { bg: "bg-slate-100",  stroke: "#94a3b8", label: "Feedback",          tint: "bg-slate-50/80",  border: "border-slate-200" },
};

const TYPE_ICON_PATH = {
  connect_request_received: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
  connect_request:          <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
  connect_request_accepted: <><polyline points="20 6 9 17 4 12"/></>,
  connect_request_declined: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
  upcoming_session:         <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
  new_message:              <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>,
  session_completed:        <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>,
  new_review:               <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>,
  feedback:                 <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>,
};

// ── Stats Card ────────────────────────────────────────────────
const StatCard = ({ icon, label, value, accent }) => (
  <div className={`flex items-center gap-3 bg-white rounded-2xl border px-4 py-3.5 flex-1 min-w-0 ${accent ? "border-blue-200 bg-blue-50/40" : "border-slate-100"}`}>
    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${accent ? "bg-blue-100" : "bg-slate-100"}`}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-xl sm:text-2xl font-bold text-slate-800 leading-none">{value}</p>
      <p className={`text-[10px] sm:text-xs font-semibold mt-1 leading-tight ${accent ? "text-blue-600" : "text-slate-500"}`}>{label}</p>
    </div>
  </div>
);

// ── Avatar helpers ────────────────────────────────────────────
const getInitials = (name = "") => {
  const cleaned = name.replace(/^(New|Upcoming|Session)\s+/i, "").trim();
  return cleaned.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() || "").join("") || "N";
};

const AVATAR_COLORS = [
  "bg-blue-600", "bg-violet-600", "bg-emerald-600",
  "bg-orange-500", "bg-pink-600", "bg-teal-600",
];
const getAvatarColor = (id = "") => {
  const sum = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
};

// ── Time helper ───────────────────────────────────────────────
const timeAgo = (dateStr) => {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins > 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
};

// ── Notification Card ─────────────────────────────────────────
const NotifCard = ({ notif, onMarkRead, onDelete }) => {
  const cfg      = TYPE_CONFIG[notif.type] || TYPE_CONFIG["new_message"];
  const initials = getInitials(notif.senderName || notif.title || "");
  const avatarBg = getAvatarColor(notif._id || "");

  const accentBorder =
    notif.type === "upcoming_session"         ? "border-l-[3px] border-l-blue-500"  :
    notif.type === "connect_request_accepted" ? "border-l-[3px] border-l-green-500" :
    notif.type === "connect_request_declined" ? "border-l-[3px] border-l-red-400"   : "";

  return (
    <div
      onClick={() => !notif.read && onMarkRead(notif._id)}
      className={`relative rounded-2xl border px-3.5 py-3.5 sm:px-5 sm:py-4 flex items-start gap-3 sm:gap-4 transition-all duration-200 hover:shadow-md group
        ${notif.read ? "bg-white border-slate-100 cursor-default" : `${cfg.tint} ${cfg.border} cursor-pointer`}
        ${!notif.read ? accentBorder : ""}
      `}
    >
      {/* Left unread bar */}
      {!notif.read && (
        <div className="absolute left-0 top-5 bottom-5 w-[3px] rounded-r-full bg-blue-500" />
      )}

      {/* Avatar */}
      <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl ${avatarBg} flex items-center justify-center shrink-0 shadow-sm`}>
        <span className="text-xs sm:text-sm font-bold text-white">{initials}</span>
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        {/* Top row: badge + time */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${cfg.bg}`}
              style={{ color: cfg.stroke }}
            >
              {cfg.label}
            </span>
            {!notif.read && (
              <span className="text-[9px] sm:text-[10px] font-bold text-blue-700 bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-full">
                New
              </span>
            )}
          </div>
          <span className="text-[10px] sm:text-xs font-medium text-slate-400 shrink-0 whitespace-nowrap">
            {timeAgo(notif.createdAt)}
          </span>
        </div>

        {/* Title */}
        <p className={`text-sm font-bold leading-snug ${notif.read ? "text-slate-600" : "text-slate-800"}`}>
          {notif.title}
          {notif.senderName && (
            <span className={`font-medium ml-1.5 ${notif.read ? "text-slate-400" : "text-slate-500"}`}>
              · {notif.senderName}
            </span>
          )}
        </p>

        {/* Message body */}
        <p className={`text-xs sm:text-sm mt-1 leading-relaxed line-clamp-2 ${notif.read ? "text-slate-400" : "text-slate-600"}`}>
          {notif.message}
        </p>
      </div>

      {/* Right col: type icon + delete — desktop only */}
      <div className="hidden sm:flex flex-col items-center gap-2 shrink-0">
        <div className={`w-8 h-8 rounded-xl ${cfg.bg} flex items-center justify-center`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={cfg.stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {TYPE_ICON_PATH[notif.type] || TYPE_ICON_PATH["new_message"]}
          </svg>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(notif._id); }}
          title="Delete"
          className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 bg-white border border-slate-200 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all duration-150"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          </svg>
        </button>
      </div>

      {/* Delete — always visible on mobile */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(notif._id); }}
        title="Delete"
        className="sm:hidden w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 bg-white border border-slate-200 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all duration-150 shrink-0 self-start"
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
        </svg>
      </button>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────
const NotificationsTab = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState("");

  const token      = localStorage.getItem("token");
  const authHeader = { Authorization: `Bearer ${token}` };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const t       = localStorage.getItem("token");
      const payload = JSON.parse(atob(t.split(".")[1]));
      console.log("🔍 Token user ID:", payload.id || payload._id || payload.userId);
      const res = await axios.get(`${BASE_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      setNotifications(res.data.notifications || []);
    } catch {
      setError("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const unreadCount   = notifications.filter((n) => !n.read).length;
  const thisWeekCount = notifications.length; // all fetched are recent from API

  const markAllRead = async () => {
    await axios.patch(`${BASE_URL}/api/notifications/mark-all-read`, {}, { headers: authHeader });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = async () => {
    await axios.delete(`${BASE_URL}/api/notifications/clear-all`, { headers: authHeader });
    setNotifications([]);
  };

  const markRead = async (id) => {
    await axios.patch(`${BASE_URL}/api/notifications/${id}/read`, {}, { headers: authHeader });
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
  };

  const deleteOne = async (id) => {
    await axios.delete(`${BASE_URL}/api/notifications/${id}`, { headers: authHeader });
    setNotifications((prev) => prev.filter((n) => n._id !== id));
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 px-4 py-4 sm:px-5 flex items-start gap-3 sm:gap-4">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-slate-100 animate-pulse shrink-0" />
            <div className="flex-1 space-y-2.5 pt-1">
              <div className="h-2.5 bg-slate-100 rounded animate-pulse w-1/4" />
              <div className="h-3.5 bg-slate-100 rounded animate-pulse w-1/2" />
              <div className="h-3 bg-slate-100 rounded animate-pulse w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">

      {/* Header — stacks on mobile */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Notifications</h1>
          <p className="text-sm  text-blue-900 mt-0.5">
            Stay updated on your mentorship activity.
            {unreadCount > 0 && (
              <span className="ml-2 bg-blue-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3 sm:mt-1 shrink-0">
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-xs font-bold text-blue-900 hover:text-blue-700 transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Mark all as read
          </button>
          <div className="w-px h-4 bg-slate-200" />
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-800 hover:text-red-500 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            </svg>
            Clear all
          </button>
        </div>
      </div>

      {/* Stats bar — 1 col on xs, 3 col on sm+ */}
      <div className="grid grid-cols-1 xs:grid-cols-3 sm:grid-cols-3 gap-3 sm:gap-4">
        <StatCard
          label="Total Notifications"
          value={notifications.length}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          }
        />
        <StatCard
          label="Unread"
          value={unreadCount}
          accent={unreadCount > 0}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={unreadCount > 0 ? "#3b82f6" : "#64748b"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          }
        />
        <StatCard
          label="This Week"
          value={thisWeekCount}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          }
        />
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 text-sm bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3">
          <span>⚠</span> {error}
        </div>
      )}

      {/* Empty state */}
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </div>
          <p className="text-sm font-bold text-slate-800">No notifications</p>
          <p className="text-xs text-slate-700">You're all caught up!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((notif) => (
            <NotifCard
              key={notif._id}
              notif={notif}
              onMarkRead={markRead}
              onDelete={deleteOne}
            />
          ))}
          <button className="w-full py-3 text-xs font-bold text-blue-900 hover:text-blue-700 transition-colors">
            Load older notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationsTab;