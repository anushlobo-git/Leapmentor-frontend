// src/pages/admin/AdminUserManagement.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import AdminLayout      from "../../components/admin/AdminLayout";
import StatCard         from "../../components/admin/common/StatCard";
import UserGrowthChart  from "../../components/admin/common/UserGrowthChart";

const BASE_URL  = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("adminToken")}` });

// ── Confirm Delete Modal ──────────────────────────────────────
const ConfirmDeleteModal = ({ user, onConfirm, onCancel, deleting }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)" }}>
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
          </svg>
        </div>
        <div>
          <p className="text-sm font-700 text-slate-800" style={{ fontWeight: 700 }}>Delete User Account</p>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            You're about to permanently delete <span className="font-600 text-slate-700" style={{ fontWeight: 600 }}>{user?.name}</span>.
            This will remove their profile and all associated sessions. This cannot be undone.
          </p>
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={onCancel} disabled={deleting}
          className="flex-1 py-2.5 rounded-xl border text-xs font-600 text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-40"
          style={{ border: "1px solid #e2e8f0", fontWeight: 600 }}>
          Cancel
        </button>
        <button onClick={onConfirm} disabled={deleting}
          className="flex-1 py-2.5 rounded-xl text-xs font-600 text-white transition-all disabled:opacity-40 flex items-center justify-center gap-2"
          style={{ background: "#ef4444", fontWeight: 600 }}>
          {deleting
            ? <><span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin"/>Deleting...</>
            : "Yes, Delete"}
        </button>
      </div>
    </div>
  </div>
);

// ── Role Badge ────────────────────────────────────────────────
const RoleBadge = ({ roles }) => {
  const isMentor = roles?.includes("mentor");
  return (
    <span className="px-2.5 py-1 rounded-lg text-[10px] font-700 uppercase tracking-wide"
      style={{
        fontWeight:  700,
        background:  isMentor ? "#eff6ff" : "#f0fdf4",
        color:       isMentor ? "#1d4ed8" : "#15803d",
        letterSpacing: "0.06em",
      }}>
      {isMentor ? "Mentor" : "Mentee"}
    </span>
  );
};

// ── Avatar ────────────────────────────────────────────────────
const Avatar = ({ name, picture }) => {
  if (picture) return <img src={picture} alt={name} className="w-9 h-9 rounded-xl object-cover flex-shrink-0"/>;
  const initials = name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?";
  const colors   = ["#2563eb", "#7c3aed", "#0891b2", "#059669", "#d97706"];
  const color    = colors[initials.charCodeAt(0) % colors.length];
  return (
    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-700 text-white"
      style={{ background: color, fontWeight: 700 }}>
      {initials}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════
const AdminUserManagement = () => {
  const [stats,     setStats]     = useState(null);
  const [users,     setUsers]     = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [search,    setSearch]    = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading,   setLoading]   = useState(true);
  const [toDelete,  setToDelete]  = useState(null);
  const [deleting,  setDeleting]  = useState(false);

  const [toast,     setToast]     = useState(null);
  const [growthData, setGrowthData] = useState([]);
  const searchTimer = useRef(null);

  // ── Show toast ────────────────────────────────────────────
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };
  //-----growth data--------------
  const fetchGrowthData = useCallback(async () => {
  try {
    const res = await axios.get(`${BASE_URL}/admin/user-growth`, { headers: authHeader() });
    setGrowthData(res.data);
  } catch (err) {
    console.error("Failed to fetch growth data", err);
  }
}, []);

useEffect(() => { fetchStats(); fetchUsers(); fetchGrowthData(); }, []);

  // ── Fetch stats ───────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/admin/stats`, { headers: authHeader() });
      setStats(res.data);
    } catch(err) {
      console.error("Error fetching stats",err);
     }
  }, []);

  // ── Fetch users ───────────────────────────────────────────
  const fetchUsers = useCallback(async (page = 1, q = search, role = roleFilter) => {
    try {
      setLoading(true);
      const params = { page, limit: 15 };
      if (q)    params.search = q;
      if (role) params.role   = role;
      const res = await axios.get(`${BASE_URL}/admin/users`, { headers: authHeader(), params });
      console.log("First user:", res.data.users[0]);
      setUsers(res.data.users);
      setPagination(res.data.pagination);
    } catch {
      showToast("Failed to load users.", "error");
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => { fetchStats(); fetchUsers(); }, []);

  // ── Debounced search ──────────────────────────────────────
  const handleSearchChange = (val) => {
    setSearch(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => fetchUsers(1, val, roleFilter), 400);
  };

  const handleRoleFilter = (role) => {
    setRoleFilter(role);
    fetchUsers(1, search, role);
  };

  // ── Delete user ───────────────────────────────────────────
  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await axios.delete(`${BASE_URL}/admin/users/${toDelete._id}`, { headers: authHeader() });
      showToast(`${toDelete.name} has been permanently deleted.`);
      setToDelete(null);
      fetchStats();
      fetchUsers(pagination.page);
    } catch (err) {
      showToast(err?.response?.data?.message || "Delete failed.", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminLayout>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');`}</style>

      {/* ── Toast ─────────────────────────────────────────── */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg text-sm font-600 transition-all"
          style={{
            fontWeight:  600,
            background:  toast.type === "success" ? "#f0fdf4" : "#fef2f2",
            border:      `1px solid ${toast.type === "success" ? "#bbf7d0" : "#fecaca"}`,
            color:       toast.type === "success" ? "#15803d" : "#dc2626",
          }}>
          {toast.type === "success"
            ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          }
          {toast.msg}
        </div>
      )}

      <div className="space-y-6">

        {/* ── Page Header ───────────────────────────────────── */}
       <div>
  <h1 className="text-3xl text-slate-900" style={{ fontWeight: 800, letterSpacing: "-0.02em" }}>User Management</h1>
  <p className="text-sm text-slate-700 mt-1">Manage, verify, and monitor all platform participants.</p>
       </div>

        {/* ── Stat Cards ────────────────────────────────────── */}
<div className="grid grid-cols-3 gap-4">
  <StatCard
    label="Total Users"
    value={stats?.totalUsers}
    sub={`+${stats?.newUsersThisMonth ?? 0} this month`}
    accent="#2563eb"
    icon={
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Back person - filled subtle */}
        <circle cx="15" cy="8" r="3" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M18.5 19.5v-1a4 4 0 0 0-4-4h-0.5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.4"/>
        {/* Front person - fully filled */}
        <circle cx="9" cy="8" r="3.5" fill="currentColor" fillOpacity="0.9" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M2 20v-1.5A5 5 0 0 1 7 13.5h4A5 5 0 0 1 16 19v1" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
        }
       />

      <StatCard
        label="Active Mentors"
    value={stats?.totalMentors}
    sub={`+${stats?.newMentorsThisMonth ?? 0} this month`}
    accent="#7c3aed"
    icon={
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Person */}
        <circle cx="10" cy="7" r="3.5" fill="currentColor" fillOpacity="0.9" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M2.5 20v-1.5A5.5 5.5 0 0 1 8 13h4a5.5 5.5 0 0 1 5.5 5.5V20" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5"/>
        {/* Checkmark badge bottom right */}
        <circle cx="18.5" cy="17.5" r="3.5" fill="currentColor" fillOpacity="0.9" stroke="currentColor" strokeWidth="1.2"/>
        <polyline points="16.8 17.5 18 18.8 20.2 16.2" fill="none" stroke="white" strokeWidth="1.4"/>
      </svg>
        }
      />

       <StatCard
          label="Active Mentees"
    value={stats?.totalMentees}
    sub={`+${stats?.newMenteesThisMonth ?? 0} this month`}
    accent="#059669"
    icon={
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Person */}
        <circle cx="10" cy="7" r="3.5" fill="currentColor" fillOpacity="0.9" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M2.5 20v-1.5A5.5 5.5 0 0 1 8 13h4a5.5 5.5 0 0 1 5.5 5.5V20" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5"/>
        {/* Plus badge bottom right */}
        <circle cx="18.5" cy="17.5" r="3.5" fill="currentColor" fillOpacity="0.9" stroke="currentColor" strokeWidth="1.2"/>
        <line x1="18.5" y1="15.5" x2="18.5" y2="19.5" stroke="white" strokeWidth="1.5"/>
        <line x1="16.5" y1="17.5" x2="20.5" y2="17.5" stroke="white" strokeWidth="1.5"/>
      </svg>
          }
        />
        </div>

        {/* ── Growth Chart ──────────────────────────────────── */}
         <UserGrowthChart data={growthData} />

        {/* ── User List ─────────────────────────────────────── */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "#ffffff", border: "1px solid #e8eaf0" }}>

          {/* Table header / filters */}
          <div className="flex items-center justify-between gap-4 px-6 py-4 border-b" style={{ borderColor: "#e8eaf0" }}>
            <div>
              <p className="text-sm font-700 text-slate-800" style={{ fontWeight: 700 }}>User List</p>
              <p className="text-xs text-slate-600 mt-0.5">{pagination.total} total users</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Role filter pills */}
              <div className="flex gap-1.5">
                {["", "mentor", "mentee"].map((r) => (
                  <button key={r} onClick={() => handleRoleFilter(r)}
                    className="px-3 py-1.5 rounded-xl text-xs font-600 transition-all"
                    style={{
                      fontWeight:  600,
                      background:  roleFilter === r ? "#2563eb" : "#f1f5f9",
                      color:       roleFilter === r ? "white" : "#475569",
                    }}>
                    {r === "" ? "All" : r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search by name or email..."
                  className="pl-9 pr-4 py-2 rounded-xl text-xs outline-none transition-all"
                  style={{ background: "#f8fafc", border: "1px solid #e2e8f0", width: 220, fontFamily: "'DM Sans', sans-serif", color: "#334155" }}
                  onFocus={(e) => e.target.style.borderColor = "#93c5fd"}
                  onBlur={(e)  => e.target.style.borderColor = "#e2e8f0"}
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              <thead>
                <tr style={{ background: "#f1f5f9", borderBottom: "2px solid #e2e8f0" }}>
                   {["User", "Role", "Email Verified", "Joined", "Actions"].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-[10px] uppercase tracking-widest"
                      style={{ color: "#334155", fontWeight: 800, letterSpacing: "0.12em" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      {[...Array(6)].map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 rounded-lg animate-pulse" style={{ background: "#f1f5f9", width: j === 0 ? 140 : 80 }}/>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-sm text-slate-400">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id} className="transition-colors"
                      style={{ borderBottom: "1px solid #f1f5f9" }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "#fafbfc"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>

                      {/* User */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={user.name} picture={user.profile?.profilePicture} />
                          <div>
                            <p className="text-sm font-600 text-slate-900" style={{ fontWeight: 600 }}>{user.name}</p>
                            <p className="text-[10px] text-slate-600" style={{ fontFamily: "'DM Mono', monospace" }}>{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-3 py-3"><RoleBadge roles={user.roles}/></td>

                      {/* Email verified */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: user.isEmailVerified ? "#22c55e" : "#f59e0b" }}/>
                          <span className="text-xs text-slate-900">{user.isEmailVerified ? "Verified" : "Pending"}</span>
                        </div>
                      </td>

                      {/* Joined */}
                      <td className="px-6 py-4">
                        <span className="text-xs text-slate-900" style={{ fontFamily: "'DM Mono', monospace" }}>
                          {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </td>

                      

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <button onClick={() => setToDelete(user)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-600 transition-all"
                          style={{ background: "#fef2f2", color: "#dc2626", fontWeight: 600, border: "1px solid #fecaca" }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "#fee2e2"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "#fef2f2"; }}>
                          <svg width="10" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
                          </svg>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t" style={{ borderColor: "#e8eaf0" }}>
              <p className="text-xs text-slate-600">
                Page {pagination.page} of {pagination.totalPages} · {pagination.total} users
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchUsers(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="px-3 py-1.5 rounded-xl text-xs font-600 transition-all disabled:opacity-30"
                  style={{ background: "#f1f5f9", color: "#475569", fontWeight: 600 }}>
                  ← Prev
                </button>
                <button
                  onClick={() => fetchUsers(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-3 py-1.5 rounded-xl text-xs font-600 transition-all disabled:opacity-30"
                  style={{ background: "#2563eb", color: "white", fontWeight: 600 }}>
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Confirm Delete Modal ───────────────────────────── */}
      {toDelete && (
        <ConfirmDeleteModal
          user={toDelete}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
          deleting={deleting}
        />
      )}
    </AdminLayout>
  );
};

export default AdminUserManagement;