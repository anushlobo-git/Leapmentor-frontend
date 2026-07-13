/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/admin/pages/AdminEngagements.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import AdminLayout from "@features/admin/components/AdminLayout";
import StatCard from "@features/admin/components/common/StatCard";
import StatusBadge from "@features/admin/components/common/StatusBadge";
import {
  getEngagementStats,
  getEngagements,
} from "@features/admin/api/admin.api";
import PropTypes from "prop-types";

const FONT = "'DM Sans', sans-serif";
const MONO = "'DM Mono', monospace";

// Stable identifiers for the loading skeleton (avoids using the array index as a React key)
const SKELETON_ROW_IDS = ["sk-row-1", "sk-row-2", "sk-row-3", "sk-row-4", "sk-row-5", "sk-row-6"];
const SKELETON_COL_IDS = ["sk-col-1", "sk-col-2", "sk-col-3", "sk-col-4", "sk-col-5", "sk-col-6"];
const STATUS_TABS = ["", "pending", "accepted", "ongoing", "completed", "rejected", "referred"];
const TABLE_HEADERS = ["Mentor", "Mentee", "Status", "Payment", "Requested", ""];

// ── shared style objects (dedupes repeated inline style literals; also
// keeps JSX attributes short so Prettier doesn't re-wrap them) ──
const SX = {
  fw600: { fontWeight: 600 },
  fw700: { fontWeight: 700 },
  mono: { fontFamily: MONO },
  h1: { fontWeight: 700, fontFamily: FONT },
  card: { background: "#ffffff", border: "1px solid #e8eaf0" },
  borderColor: { borderColor: "#e8eaf0" },
  sectionLabel: { fontWeight: 700, letterSpacing: "0.1em" },
  cellLabel: { fontWeight: 700, letterSpacing: "0.08em" },
  cancelledLabel: { color: "#ef4444", fontWeight: 600 },
  searchInput: { background: "#f8fafc", border: "1px solid #e2e8f0", width: 220, fontFamily: FONT, color: "#334155" },
  dateInput: { background: "#f8fafc", border: "1px solid #e2e8f0", fontFamily: MONO, color: "#94a3b8" },
  clearBtn: { background: "#fef2f2", color: "#dc2626", fontWeight: 600, border: "1px solid #fecaca" },
  headRow: { background: "#f1f5f9", borderBottom: "2px solid #e2e8f0" },
  th: { color: "#334155", fontWeight: 800, letterSpacing: "0.12em" },
  prevBtn: { background: "#f1f5f9", color: "#475569", fontWeight: 600 },
  nextBtn: { background: "#2563eb", color: "white", fontWeight: 600 },
  skelRow: { borderBottom: "1px solid #f1f5f9" },
  font: { fontFamily: FONT },
};

// ── dynamic style helpers (value depends on a runtime condition) ──
const pillWrapStyle = (cancelled) => ({
  background: cancelled ? "#fef2f2" : "#f8fafc",
  border: `1px solid ${cancelled ? "#fecaca" : "#e2e8f0"}`,
});
const pillTextStyle = (cancelled) => ({
  color: cancelled ? "#ef4444" : "#475569",
  fontWeight: 500,
  fontFamily: MONO,
  textDecoration: cancelled ? "line-through" : "none",
});
const toastStyle = (success) => ({
  fontWeight: 600,
  fontFamily: FONT,
  background: success ? "#f0fdf4" : "#fef2f2",
  border: `1px solid ${success ? "#bbf7d0" : "#fecaca"}`,
  color: success ? "#15803d" : "#dc2626",
});
const statusPillStyle = (active) => ({
  fontWeight: 600,
  fontFamily: FONT,
  background: active ? "#2563eb" : "#f1f5f9",
  color: active ? "white" : "#475569",
});
const rowStyle = (expanded) => ({ borderBottom: expanded ? "none" : "1px solid #f1f5f9" });
const expandWrapStyle = (expanded) => ({ background: expanded ? "#eff6ff" : "#f1f5f9" });
const chevronStyle = (expanded) => ({
  transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
  transition: "transform 0.2s",
});

// ── shared helpers (removes repeated date-format / svg-attribute duplication) ──
const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

const Icon = ({ children, size = 20, stroke = "currentColor", strokeWidth = 1.8, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" className={className} style={style}>
    {children}
  </svg>
);
Icon.propTypes = {
  children: PropTypes.node.isRequired,
  size: PropTypes.number,
  stroke: PropTypes.string,
  strokeWidth: PropTypes.number,
  className: PropTypes.string,
  style: PropTypes.object,
};

// ── Avatar ────────────────────────────────────────────────────
const Avatar = ({ name }) => {
  const initials = name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?";
  const colors = ["#2563eb", "#7c3aed", "#0891b2", "#059669", "#d97706"];
  const color = colors[initials.codePointAt(0) % colors.length];
  const avatarStyle = { background: color, fontWeight: 700, fontFamily: FONT };
  return (
    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-700 text-white" style={avatarStyle}>
      {initials}
    </div>
  );
};

// ── User Cell ─────────────────────────────────────────────────
const UserCell = ({ user }) => (
  <div className="flex items-center gap-2.5">
    <Avatar name={user?.name} />
    <div>
      <p className="text-xs font-600 text-slate-800 leading-none" style={SX.fw600}>{user?.name || "—"}</p>
      <p className="text-[10px] text-slate-600 mt-0.5" style={SX.mono}>{user?.email || "—"}</p>
    </div>
  </div>
);

// ── Slot Pill ─────────────────────────────────────────────────
const SlotPill = ({ slot }) => {
  const isCancelled = slot.status === "cancelled";
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={pillWrapStyle(isCancelled)}>
      {isCancelled ? (
        <Icon size={12} stroke="#ef4444" strokeWidth={2.5}>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </Icon>
      ) : (
        <Icon size={12} stroke="#22c55e" strokeWidth={2.5}>
          <polyline points="20 6 9 17 4 12" />
        </Icon>
      )}
      <span className="text-[10px] font-600" style={pillTextStyle(isCancelled)}>
        {slot.date} · {slot.startTime}–{slot.endTime}
      </span>
      {isCancelled && (
        <span className="text-[9px] font-600 ml-auto" style={SX.cancelledLabel}>Cancelled</span>
      )}
    </div>
  );
};

// ── Expanded Detail Row ───────────────────────────────────────
const ExpandedDetail = ({ eng }) => {
  const sessionCells = [
    { label: "Rate / Session", value: eng.sessionRate ? `₹${eng.sessionRate}` : "—" },
    {
      label: "Session Count",
      value: eng.selectedSlots?.filter((s) => s.status !== "cancelled").length ?? eng.sessionCount ?? "—",
    },
    { label: "Payment", value: <StatusBadge status={eng.paymentStatus || "unpaid"} /> },
    { label: "Requested", value: formatDate(eng.requestedAt) },
    { label: "Responded", value: formatDate(eng.respondedAt) },
    { label: "Completed At", value: formatDate(eng.completedAt) },
  ];

  return (
    <tr>
      <td colSpan={6} style={SX.card}>
        <div className="px-6 py-4 grid grid-cols-2 gap-6">
          {/* Slots */}
          <div>
            <p className="text-[10px] font-700 uppercase tracking-widest text-slate-400 mb-2" style={SX.sectionLabel}>
              Proposed Slots
            </p>
            <div className="flex flex-col gap-1.5">
              {eng.selectedSlots?.map((s) => (
                <SlotPill key={`${s.date}-${s.startTime}-${s.endTime}`} slot={s} />
              ))}
            </div>
          </div>

          {/* Session details grid */}
          <div>
            <p className="text-[10px] font-700 uppercase tracking-widest text-slate-600 mb-2" style={SX.sectionLabel}>
              Session Details
            </p>
            <div className="grid grid-cols-2 gap-2">
              {sessionCells.map(({ label, value }) => (
                <div key={label} className="px-3 py-2 rounded-xl" style={SX.card}>
                  <p className="text-[9px] font-700 uppercase tracking-widest text-slate-600 mb-0.5" style={SX.cellLabel}>
                    {label}
                  </p>
                  <div className="text-xs font-600 text-slate-700" style={SX.fw600}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
};

// ── Toast ─────────────────────────────────────────────────────
const Toast = ({ toast }) => {
  if (!toast) return null;
  const isSuccess = toast.type === "success";
  return (
    <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg text-sm" style={toastStyle(isSuccess)}>
      {isSuccess ? (
        <Icon size={15} strokeWidth={2.5}>
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </Icon>
      ) : (
        <Icon size={15} strokeWidth={2.5}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </Icon>
      )}
      {toast.msg}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════
const AdminEngagements = () => {
  const [stats, setStats] = useState(null);
  const [engagements, setEngagements] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [toast, setToast] = useState(null);
  const searchTimer = useRef(null);

  const showToast = (msg, type = "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Fetch stats ───────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    try {
      const res = await getEngagementStats();
      setStats(res.data);
    } catch {
      showToast("Failed to load stats.");
    }
  }, []);

  // ── Fetch engagements ─────────────────────────────────────
  const fetchEngagements = useCallback(
    async (page = 1, q = search, status = statusFilter, from = dateFrom, to = dateTo) => {
      try {
        setLoading(true);
        const params = { page, limit: 15 };
        if (q) params.search = q;
        if (status) params.status = status;
        if (from) params.dateFrom = from;
        if (to) params.dateTo = to;
        const res = await getEngagements(params);
        setEngagements(res.data.engagements);
        setPagination(res.data.pagination);
      } catch {
        showToast("Failed to load engagements.");
      } finally {
        setLoading(false);
      }
    },
    [search, statusFilter, dateFrom, dateTo],
  );

  useEffect(() => {
    fetchStats();
    fetchEngagements();
  }, []);

  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => fetchEngagements(1, val, statusFilter, dateFrom, dateTo), 400);
  };

  const handleStatusFilter = (s) => {
    setStatusFilter(s);
    fetchEngagements(1, search, s, dateFrom, dateTo);
  };

  const handleDateFilter = (from, to) => {
    setDateFrom(from);
    setDateTo(to);
    fetchEngagements(1, search, statusFilter, from, to);
  };

  const toggleExpand = (id) => setExpandedId((prev) => (prev === id ? null : id));
  const onSearchFocus = (e) => (e.target.style.borderColor = "#93c5fd");
  const onSearchBlur = (e) => (e.target.style.borderColor = "#e2e8f0");

  const STAT_CARDS = [
    { key: "total", label: "Total", accent: "#2563eb", icon: <Icon><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></Icon> },
    { key: "pending", label: "Pending", accent: "#d97706", icon: <Icon><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></Icon> },
    { key: "ongoing", label: "Ongoing", accent: "#7c3aed", icon: <Icon><polygon points="5 3 19 12 5 21 5 3" /></Icon> },
    { key: "completed", label: "Completed", accent: "#059669", icon: <Icon><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></Icon> },
    { key: "rejected", label: "Rejected", accent: "#dc2626", icon: <Icon><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></Icon> },
  ];

  // ── FIX FOR S3358 / S7723 / S6479: independent statement, no Array(), no index keys ──
  let tableBody;

  if (loading) {
    tableBody = SKELETON_ROW_IDS.map((rowId) => (
      <tr key={rowId} style={SX.skelRow}>
        {SKELETON_COL_IDS.map((colId, j) => (
          <td key={colId} className="px-5 py-4">
            <div className="h-4 rounded-lg animate-pulse" style={{ background: "#f1f5f9", width: j < 2 ? 130 : 70 }} />
          </td>
        ))}
      </tr>
    ));
  } else if (engagements.length === 0) {
    tableBody = (
      <tr>
        <td colSpan={6} className="text-center py-16 text-sm text-slate-400">No engagements found.</td>
      </tr>
    );
  } else {
    tableBody = engagements.flatMap((eng) => {
      const isExpanded = expandedId === eng._id;
      const onEnter = (e) => { if (!isExpanded) e.currentTarget.style.background = "#fafbfc"; };
      const onLeave = (e) => { if (!isExpanded) e.currentTarget.style.background = "transparent"; };
      const rows = [
        <tr key={eng._id} className="transition-colors cursor-pointer" style={rowStyle(isExpanded)} onMouseEnter={onEnter} onMouseLeave={onLeave} onClick={() => toggleExpand(eng._id)}>
          <td className="px-5 py-4"><UserCell user={eng.mentor} /></td>
          <td className="px-5 py-4"><UserCell user={eng.mentee} /></td>
          <td className="px-5 py-4"><StatusBadge status={eng.status} /></td>
          <td className="px-5 py-4"><StatusBadge status={eng.paymentStatus || "unpaid"} /></td>
          <td className="px-5 py-4">
            <span className="text-xs text-slate-800" style={SX.mono}>{formatDate(eng.requestedAt)}</span>
          </td>
          <td className="px-5 py-4">
            <div className="w-7 h-7 flex items-center justify-center rounded-lg transition-all" style={expandWrapStyle(isExpanded)}>
              <Icon size={13} stroke={isExpanded ? "#2563eb" : "#94a3b8"} strokeWidth={2.5} style={chevronStyle(isExpanded)}>
                <polyline points="6 9 12 15 18 9" />
              </Icon>
            </div>
          </td>
        </tr>,
      ];
      if (isExpanded) rows.push(<ExpandedDetail key={`${eng._id}-detail`} eng={eng} />);
      return rows;
    });
  }

  return (
    <AdminLayout>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');`}</style>

      <Toast toast={toast} />

      <div className="space-y-6">
        {/* ── Header ───────────────────────────────────────── */}
        <div>
          <h1 className="text-2xl font-700 text-slate-800" style={SX.h1}>Engagements</h1>
          <p className="text-sm text-slate-600 mt-0.5">Track all mentorship sessions across the platform.</p>
        </div>

        {/* ── Stat Cards ────────────────────────────────────── */}
        <div className="grid grid-cols-5 gap-4">
          {STAT_CARDS.map(({ key, label, accent, icon }) => (
            <StatCard key={key} label={label} value={stats?.[key]} accent={accent} icon={icon} />
          ))}
        </div>

        {/* ── Table Card ────────────────────────────────────── */}
        <div className="rounded-2xl overflow-hidden" style={SX.card}>
          {/* Filters */}
          <div className="px-6 py-4 border-b space-y-3" style={SX.borderColor}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-700 text-slate-800" style={SX.fw700}>All Engagements</p>
                <p className="text-xs text-slate-600 mt-0.5">{pagination.total} total records</p>
              </div>
              <div className="relative">
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2" size={14} stroke="#94a3b8" strokeWidth={2}>
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </Icon>
                <input
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search mentor or mentee..."
                  className="pl-9 pr-4 py-2 rounded-xl text-xs outline-none transition-all"
                  style={SX.searchInput}
                  onFocus={onSearchFocus}
                  onBlur={onSearchBlur}
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 flex-wrap">
              {/* Status pills */}
              <div className="flex gap-1.5 flex-wrap">
                {STATUS_TABS.map((s) => (
                  <button key={s} onClick={() => handleStatusFilter(s)} className="px-3 py-1.5 rounded-xl text-xs font-600 transition-all capitalize" style={statusPillStyle(statusFilter === s)}>
                    {s === "" ? "All" : s}
                  </button>
                ))}
              </div>

              {/* Date range */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600" style={SX.mono}>From</span>
                <input type="date" value={dateFrom} onChange={(e) => handleDateFilter(e.target.value, dateTo)} className="px-3 py-1.5 rounded-xl text-xs outline-none" style={SX.dateInput} />
                <span className="text-xs text-slate-600" style={SX.mono}>To</span>
                <input type="date" value={dateTo} onChange={(e) => handleDateFilter(dateFrom, e.target.value)} className="px-3 py-1.5 rounded-xl text-xs outline-none" style={SX.dateInput} />
                {(dateFrom || dateTo) && (
                  <button onClick={() => handleDateFilter("", "")} className="px-2.5 py-1.5 rounded-xl text-xs font-600" style={SX.clearBtn}>
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full" style={SX.font}>
              <thead>
                <tr style={SX.headRow}>
                  {TABLE_HEADERS.map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-[10px] uppercase tracking-widest" style={SX.th}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>{tableBody}</tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t" style={SX.borderColor}>
              <p className="text-xs text-slate-400" style={SX.mono}>
                Page {pagination.page} of {pagination.totalPages} · {pagination.total} records
              </p>
              <div className="flex gap-2">
                <button onClick={() => fetchEngagements(pagination.page - 1)} disabled={pagination.page <= 1} className="px-3 py-1.5 rounded-xl text-xs font-600 transition-all disabled:opacity-30" style={SX.prevBtn}>
                  ← Prev
                </button>
                <button onClick={() => fetchEngagements(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages} className="px-3 py-1.5 rounded-xl text-xs font-600 transition-all disabled:opacity-30" style={SX.nextBtn}>
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

Avatar.propTypes = {
  name: PropTypes.string,
};

UserCell.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
  }),
};

SlotPill.propTypes = {
  slot: PropTypes.shape({
    status: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    startTime: PropTypes.string.isRequired,
    endTime: PropTypes.string.isRequired,
  }).isRequired,
};

ExpandedDetail.propTypes = {
  eng: PropTypes.shape({
    selectedSlots: PropTypes.array,
    sessionRate: PropTypes.number,
    sessionCount: PropTypes.number,
    paymentStatus: PropTypes.string,
    requestedAt: PropTypes.string,
    respondedAt: PropTypes.string,
    completedAt: PropTypes.string,
  }).isRequired,
};

Toast.propTypes = {
  toast: PropTypes.shape({
    type: PropTypes.string,
    msg: PropTypes.string.isRequired,
  }),
};

export default AdminEngagements;
