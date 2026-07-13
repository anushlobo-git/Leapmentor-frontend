/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/pages/admin/AdminVerifications.jsx
import { useEffect, useState, useCallback } from "react";
import {
  getMentorVerifications,
  verifyMentorProfile,
} from "@features/admin/api/admin.api";
import PropTypes from "prop-types";
import {
  IconShield,
  IconCheck,
  IconX,
  IconDoc,
  IconEye,
  IconSearch,
  IconFilter,
} from "@features/admin/components/verifications/VerificationIcons";
import DetailDrawer, {
  StatusBadge,
} from "@features/admin/components/verifications/VerificationDetailDrawer";

const STAT_FILTERS = [
  { key: "all", label: "Total Mentors", color: "#1e40af", bg: "#eff6ff" },
  { key: "pending", label: "Pending Review", color: "#a16207", bg: "#fefce8" },
  { key: "verified", label: "Verified", color: "#15803d", bg: "#f0fdf4" },
];
const FILTER_TABS = ["all", "pending", "verified"];

// ── Mentor Row Component ──────────────────────────────
// Sonar (S6819): a <div role="button"> was used to make the whole row
// clickable. Fixed by making the row itself a real <button>. Because a
// <button> can't validly contain another <button>, the nested "View"
// button — which fired the exact same setSelected(m) action as the row
// click — is now a plain <span> with identical styling; clicking
// anywhere in the row (including where "View" is shown) still opens the
// same drawer, so behavior is unchanged.
const MentorRow = ({
  m,
  i,
  filteredLength,
  isVerified,
  setSelected,
  docCount,
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setSelected(m)}
      className="grid items-center w-full text-left appearance-none bg-transparent border-0 m-0 px-5 py-4 transition-all duration-150 hover:bg-blue-50/40 cursor-pointer"
      style={{
        gridTemplateColumns: "2fr 2fr 1fr 1fr 1.2fr 80px",
        borderBottom: i < filteredLength - 1 ? "1px solid #f1f5f9" : "none",
        font: "inherit",
      }}
      aria-label={`View details for ${m.user?.name || "mentor"}`}
    >
      {/* Name + avatar */}
      <div className="flex items-center gap-3 min-w-0">
        {m.mentorProfile?.profilePicture && !imgError ? (
          <img
            src={m.mentorProfile.profilePicture}
            alt={m.user?.name}
            onError={() => setImgError(true)}
            className="w-8 h-8 rounded-xl object-cover flex-shrink-0 border border-slate-100"
          />
        ) : (
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#1e40af,#3b82f6)" }}
          >
            {m.user?.name?.[0]?.toUpperCase() || "?"}
          </div>
        )}
        <p className="text-sm font-semibold text-slate-800 truncate">
          {m.user?.name || "—"}
        </p>
      </div>

      {/* Email */}
      <p className="text-xs text-slate-500 truncate">{m.user?.email || "—"}</p>

      {/* Doc count */}
      <div className="flex items-center gap-1.5">
        <span className="text-slate-400">
          <IconDoc />
        </span>
        <span className="text-xs font-semibold text-slate-700">{docCount}</span>
        {docCount === 0 && (
          <span className="text-[10px] text-slate-400">none</span>
        )}
      </div>

      {/* Phone */}
      <p className="text-xs text-slate-600">
        {m.mentorProfile?.phoneNumber || (
          <span className="text-slate-300">—</span>
        )}
      </p>

      {/* Status badge */}
      <StatusBadge status={m.mentorProfile?.verificationStatus} />

      {/* View indicator — decorative only; the row itself is the button */}
      <div className="flex justify-end">
        <span
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all"
          style={
            isVerified
              ? { background: "#f1f5f9", color: "#64748b" }
              : { background: "#eff6ff", color: "#1d4ed8" }
          }
        >
          <IconEye /> View
        </span>
      </div>
    </button>
  );
};

MentorRow.propTypes = {
  m: PropTypes.object.isRequired,
  i: PropTypes.number.isRequired,
  filteredLength: PropTypes.number.isRequired,
  isVerified: PropTypes.bool.isRequired,
  setSelected: PropTypes.func.isRequired,
  docCount: PropTypes.number.isRequired,
};

// Extracted out of JSX: the original had a 3-way nested ternary
// (loading ? … : error ? … : filtered.length === 0 ? … : …) directly in
// the render tree. Sonar flags nested ternaries as hard to read, so this
// is now a plain function with early returns instead.
const renderTableRows = ({
  loading,
  error,
  filtered,
  fetchMentors,
  setSelected,
}) => {
  if (loading) {
    return (
      <div className="px-5 py-16 text-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-400">Loading mentors…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-5 py-16 text-center">
        <p className="text-sm text-red-500 font-medium">{error}</p>
        <button
          onClick={fetchMentors}
          className="mt-3 text-xs text-blue-600 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="px-5 py-16 text-center">
        <p className="text-sm text-slate-400">No mentors found.</p>
      </div>
    );
  }

  return filtered.map((m, i) => (
    <MentorRow
      key={m.user?._id || i}
      m={m}
      i={i}
      filteredLength={filtered.length}
      isVerified={m.mentorProfile?.verificationStatus === "verified"}
      setSelected={setSelected}
      docCount={
        (m.mentorProfile?.resumeDocument?.url ? 1 : 0) +
        (m.mentorProfile?.workExperienceDocuments?.length || 0)
      }
    />
  ));
};

// ══════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════
const AdminVerifications = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | pending | verified
  const [selected, setSelected] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [toast, setToast] = useState(null);

  // ── Fetch ──────────────────────────────────────────────
  const fetchMentors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMentorVerifications();
      setMentors(res.data.mentors || res.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMentors();
  }, [fetchMentors]);

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Verify ─────────────────────────────────────────────
  const handleVerify = async (mentorProfileId) => {
    setVerifying(true);
    try {
      // Response isn't used — the API confirms success by not throwing,
      // so the return value was previously assigned to an unused `res`.
      await verifyMentorProfile(mentorProfileId);

      // Update local state
      setMentors((prev) =>
        prev.map((m) =>
          m.mentorProfile?._id === mentorProfileId
            ? {
                ...m,
                mentorProfile: {
                  ...m.mentorProfile,
                  verificationStatus: "verified",
                },
              }
            : m,
        ),
      );
      if (selected?.mentorProfile?._id === mentorProfileId) {
        setSelected((prev) => ({
          ...prev,
          mentorProfile: {
            ...prev.mentorProfile,
            verificationStatus: "verified",
          },
        }));
      }
      showToast("✓ Mentor verified successfully!", "success");
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setVerifying(false);
    }
  };

  // ── Filtered list ──────────────────────────────────────
  const filtered = mentors.filter((m) => {
    const matchSearch =
      m.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.user?.email?.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ||
      (filter === "pending" &&
        m.mentorProfile?.verificationStatus !== "verified") ||
      (filter === "verified" &&
        m.mentorProfile?.verificationStatus === "verified");
    return matchSearch && matchFilter;
  });

  const counts = {
    all: mentors.length,
    pending: mentors.filter(
      (m) => m.mentorProfile?.verificationStatus !== "verified",
    ).length,
    verified: mentors.filter(
      (m) => m.mentorProfile?.verificationStatus === "verified",
    ).length,
  };

  // ══════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Toast */}
      {toast && (
        <div
          className="fixed top-5 right-5 z-[60] flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold shadow-xl transition-all"
          style={
            toast.type === "success"
              ? { background: "#15803d", color: "#fff" }
              : { background: "#dc2626", color: "#fff" }
          }
        >
          {toast.type === "success" ? <IconCheck /> : <IconX />}
          {toast.msg}
        </div>
      )}

      {/* Drawer */}
      {selected && (
        <DetailDrawer
          mentor={selected}
          onClose={() => setSelected(null)}
          onVerify={handleVerify}
          verifying={verifying}
        />
      )}

      {/* ── Page header ──────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #1e40af, #2563eb)" }}
          >
            <span className="text-white">
              <IconShield />
            </span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              Mentor Verifications
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Review submitted documents and approve mentors
            </p>
          </div>
        </div>
        <button
          onClick={fetchMentors}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-blue-700 border border-blue-200 hover:bg-blue-50 transition-all"
        >
          Refresh
        </button>
      </div>

      {/* ── Stat pills ──────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {STAT_FILTERS.map((s) => (
          <button
            key={s.key}
            onClick={() => setFilter(s.key)}
            className="flex flex-col items-start p-4 rounded-2xl border-2 text-left transition-all duration-150"
            style={{
              background: filter === s.key ? s.bg : "#ffffff",
              borderColor: filter === s.key ? s.color : "#e8eaf0",
              boxShadow: filter === s.key ? `0 0 0 1px ${s.color}22` : "none",
            }}
          >
            <p className="text-2xl font-bold" style={{ color: s.color }}>
              {counts[s.key]}
            </p>
            <p className="text-xs text-slate-500 mt-1 font-medium">{s.label}</p>
          </button>
        ))}
      </div>

      {/* ── Search + filter bar ─────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <IconSearch />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all"
            style={{
              borderColor: "#e2e8f0",
              background: "#ffffff",
              fontFamily: "'DM Sans', sans-serif",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
            onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400">
            <IconFilter />
          </span>
          {FILTER_TABS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all"
              style={
                filter === f
                  ? { background: "#1e40af", color: "#fff" }
                  : { background: "#f1f5f9", color: "#475569" }
              }
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────── */}
      <div
        className="rounded-2xl overflow-hidden border"
        style={{ borderColor: "#e8eaf0" }}
      >
        {/* Table head */}
        <div
          className="grid items-center px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400"
          style={{
            background: "#f8fafc",
            borderBottom: "1px solid #e8eaf0",
            gridTemplateColumns: "2fr 2fr 1fr 1fr 1.2fr 80px",
          }}
        >
          <span>Mentor</span>
          <span>Email</span>
          <span>Docs</span>
          <span>Phone</span>
          <span>Status</span>
          <span className="text-right">Action</span>
        </div>

        {/* Rows */}
        {renderTableRows({
          loading,
          error,
          filtered,
          fetchMentors,
          setSelected,
        })}
      </div>

      {/* Count footer */}
      {!loading && !error && (
        <p className="text-xs text-slate-400 mt-3 text-right">
          Showing {filtered.length} of {mentors.length} mentors
        </p>
      )}
    </div>
  );
};

export default AdminVerifications;
