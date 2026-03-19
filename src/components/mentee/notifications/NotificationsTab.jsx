// src/components/mentee/dashboard/NotificationsTab.jsx
import { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const TYPE_ICON = {
  connect_request_accepted: (
    <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    </div>
  ),
  connect_request_declined: (
    <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </div>
  ),
  upcoming_session: (
    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    </div>
  ),
  new_message: (
    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    </div>
  ),
  connect_request_received: (
    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    </div>
  ),
};

const timeAgo = (dateStr) => {
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

const NotificationsTab = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const authHeader = { Authorization: `Bearer ${token}` };

  const fetchNotifications = async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem("token");
    
    // ADD THIS — decode and log the token's user ID
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log("🔍 Token user ID:", payload.id || payload._id || payload.userId);
    
    const res = await axios.get(`${BASE_URL}/api/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotifications(res.data.notifications);
  } catch (err) {
    setError("Failed to load notifications.");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => { fetchNotifications(); }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

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
            Stay updated on your mentorship activity.
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
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Mark all as read
          </button>
          <div className="w-px h-4 bg-slate-200" />
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-red-500 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            </svg>
            Clear all
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-4">
          <span>⚠</span> {error}
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-500">No notifications</p>
          <p className="text-xs text-slate-400">You're all caught up!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((notif) => (
            <div
              key={notif._id}
              onClick={() => markRead(notif._id)}
              className={`relative bg-white rounded-2xl border px-4 py-4 flex items-start gap-3 cursor-pointer transition-all duration-150 hover:shadow-md ${
                notif.read ? "border-slate-100" : "border-slate-200"
              } ${notif.type === "upcoming_session" && !notif.read ? "border-l-4 border-l-blue-500" : ""}
              ${notif.type === "connect_request_accepted" && !notif.read ? "border-l-4 border-l-green-500" : ""}
              ${notif.type === "connect_request_declined" && !notif.read ? "border-l-4 border-l-red-400" : ""}`}
            >
              {!notif.read && !["upcoming_session", "connect_request_accepted", "connect_request_declined"].includes(notif.type) && (
                <span className="absolute top-4 right-10 w-2 h-2 rounded-full bg-blue-500" />
              )}

              {TYPE_ICON[notif.type] || TYPE_ICON["new_message"]}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-700">{notif.title}</p>
                <p className={`text-sm mt-0.5 ${notif.read ? "text-slate-400" : "text-slate-600"}`}>
                  {notif.message}
                </p>
                <p className="text-xs text-slate-400 mt-1">{timeAgo(notif.createdAt)}</p>
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); deleteOne(notif._id); }}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors shrink-0"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                </svg>
              </button>
            </div>
          ))}

          <button className="w-full py-3 text-xs font-semibold text-blue-900 hover:text-blue-700 transition-colors">
            Load older notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationsTab;