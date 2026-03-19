// src/components/mentor/dashboard/NotificationsTab.jsx
import { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// ── Type Icons (from your version) ───────────────────────────
const TYPE_ICON = {
  connect_request_received: (
    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    </div>
  ),
  connect_request: (
    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    </div>
  ),
  connect_request_accepted: (
    <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </div>
  ),
  connect_request_declined: (
    <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </div>
  ),
  upcoming_session: (
    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    </div>
  ),
  new_message: (
    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    </div>
  ),
  session_completed: (
    <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    </div>
  ),
  new_review: (
    <div className="w-9 h-9 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </div>
  ),
  feedback: (
    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </div>
  ),
};

// ── Static fallback notifications (from team's version) ───────
const INITIAL_NOTIFICATIONS = [
  {
    id: "static-1",
    type: "connect_request",
    read: false,
    time: "2 minutes ago",
    message: (
      <p className="text-sm text-slate-700">
        <span className="font-semibold">Deepika (Mentee)</span> has sent you a connect request.
      </p>
    ),
    actions: [
      { label: "Accept", primary: true },
      { label: "Decline", primary: false },
    ],
  },
  {
    id: "static-2",
    type: "upcoming_session",
    read: false,
    time: "45 minutes ago",
    accent: true,
    message: (
      <p className="text-sm text-slate-700">
        <span className="font-semibold">Upcoming Session:</span> Career Coaching with Chris Johnson today at 3:00 PM.
      </p>
    ),
    actions: [{ label: "Start Session", primary: true }],
  },
  {
    id: "static-3",
    type: "new_message",
    read: false,
    time: "3 hours ago",
    message: (
      <p className="text-sm text-slate-700">
        <span className="font-semibold">New Message:</span> Emma Lee sent you a message about her portfolio.
      </p>
    ),
    actions: [{ label: "Reply", primary: true }],
  },
  {
    id: "static-4",
    type: "session_completed",
    read: false,
    time: "Yesterday",
    message: (
      <p className="text-sm text-slate-700">
        <span className="font-semibold">Session Completed:</span> Your session with Alex Carter has ended. Earnings of{" "}
        <span className="font-semibold text-green-600">$55</span> added to your balance.
      </p>
    ),
    actions: [{ label: "View Earnings", primary: false }],
  },
  {
    id: "static-5",
    type: "feedback",
    read: true,
    time: "2 days ago",
    message: (
      <p className="text-sm text-slate-400">
        <span className="font-semibold">New Review:</span> Jessica Patel left you a 5-star rating after your session.
      </p>
    ),
    actions: [],
  },
];

// ── timeAgo helper (from your version) ───────────────────────
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

// ── Normalize API notification to unified shape ───────────────
// This lets both real API notifications and static ones
// render through the same card component
const normalizeApiNotif = (notif) => ({
  id:      notif._id,
  _id:     notif._id,  // keep for API calls
  type:    notif.type,
  read:    notif.read,
  time:    timeAgo(notif.createdAt),
  accent:  notif.type === "upcoming_session" && !notif.read,
  message: (
    <div>
      <p className="text-sm font-semibold text-slate-700">{notif.title}</p>
      <p className={`text-sm mt-0.5 ${notif.read ? "text-slate-400" : "text-slate-600"}`}>
        {notif.message}
      </p>
    </div>
  ),
  actions: [], // real notifications don't have inline actions
  isApi:   true,
});

const NotificationsTab = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState("");
  const [useStatic,     setUseStatic]     = useState(false);

  const token      = localStorage.getItem("token");
  const authHeader = { Authorization: `Bearer ${token}` };

  // ── Fetch from API (your version) ──────────────────────────
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/notifications`, {
        headers: authHeader,
      });
      console.log("🔔 API Response:", res.data);
      const apiNotifs = (res.data.notifications || []).map(normalizeApiNotif);
      // ✅ Merge: API notifications first, then static ones that aren't duplicated
      setNotifications(apiNotifs);
      setUseStatic(false);
    } catch (err) {
      console.log("❌ Error:", err.response?.status, err.response?.data);
      // ✅ Fallback to static notifications if API fails
      setNotifications(INITIAL_NOTIFICATIONS);
      setUseStatic(true);
      setError("Could not load live notifications. Showing sample data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // ── Mark all read ─────────────────────────────────────────
  const markAllRead = async () => {
    if (!useStatic) {
      await axios.patch(`${BASE_URL}/api/notifications/mark-all-read`, {}, { headers: authHeader });
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // ── Clear all ─────────────────────────────────────────────
  const clearAll = async () => {
    if (!useStatic) {
      await axios.delete(`${BASE_URL}/api/notifications/clear-all`, { headers: authHeader });
    }
    setNotifications([]);
  };

  // ── Mark one read ─────────────────────────────────────────
  const markRead = async (id) => {
    if (!useStatic) {
      await axios.patch(`${BASE_URL}/api/notifications/${id}/read`, {}, { headers: authHeader });
    }
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // ── Delete one ────────────────────────────────────────────
  const deleteOne = async (id) => {
    if (!useStatic) {
      await axios.delete(`${BASE_URL}/api/notifications/${id}`, { headers: authHeader });
    }
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // ── Loading skeleton (your version) ──────────────────────
  if (loading) {
    return (
      <div className="max-w-2xl">
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 px-4 py-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-100 animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-slate-100 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-slate-100 rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Notifications</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Manage your recent activities and requests.
            {unreadCount > 0 && (
              <span className="ml-2 bg-blue-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-900 hover:text-blue-700 transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Mark all as read
          </button>
          <div className="w-px h-4 bg-slate-200" />
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-red-500 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            </svg>
            Clear all
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 text-sm bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-4">
          <span>⚠</span> {error}
        </div>
      )}

      {/* Empty state */}
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-500">No notifications</p>
          <p className="text-xs text-slate-400">You're all caught up!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => markRead(notif.id)}
              className={`relative bg-white rounded-2xl border px-4 py-4 flex items-start gap-3 cursor-pointer transition-all duration-150 hover:shadow-md ${
                notif.read
                  ? "border-slate-100"
                  : notif.accent
                  ? "border-l-4 border-l-blue-500 border-slate-100"
                  : "border-slate-200"
              }`}
            >
              {/* Unread dot */}
              {!notif.read && !notif.accent && (
                <span className="absolute top-4 right-10 w-2 h-2 rounded-full bg-blue-500" />
              )}

              {/* Icon */}
              {TYPE_ICON[notif.type] || TYPE_ICON["new_message"]}

              {/* Content */}
              <div className="flex-1 min-w-0">
                {notif.message}
                <p className="text-xs text-slate-400 mt-1">{notif.time}</p>

                {/* ✅ Action buttons (from team's version) */}
                {notif.actions && notif.actions.length > 0 && (
                  <div className="flex gap-2 mt-2.5">
                    {notif.actions.map((action) => (
                      <button
                        key={action.label}
                        onClick={(e) => e.stopPropagation()}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                          action.primary
                            ? "bg-blue-900 text-white hover:bg-blue-700"
                            : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Delete button */}
              <button
                onClick={(e) => { e.stopPropagation(); deleteOne(notif.id); }}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors shrink-0"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                </svg>
              </button>
            </div>
          ))}

          {/* Load older */}
          <button className="w-full py-3 text-xs font-semibold text-blue-900 hover:text-blue-700 transition-colors">
            Load older notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationsTab;