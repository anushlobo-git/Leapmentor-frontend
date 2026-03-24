// src/components/mentor/dashboard/MentorHomeTab.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

// ── Helpers ───────────────────────────────────────────────────
const ACCENT_COLORS = ["#3b82f6", "#22c55e", "#a855f7", "#f97316", "#ec4899"];
const getAccent = (idx) => ACCENT_COLORS[idx % ACCENT_COLORS.length];

const formatSlotDate = (slot) => {
  if (!slot?.date) return { dateNum: "—", dateMonth: "—", fullDate: "" };
  const d = new Date(slot.date + "T00:00:00");
  return {
    dateNum: d.getDate().toString(),
    dateMonth: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    fullDate: d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
  };
};

const formatTime = (t) => {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hour = parseInt(h);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
};

const fmt = (n) =>
  Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ── Badges ────────────────────────────────────────────────────
const BADGES = [
  { key: "newcomer", label: "Newcomer", icon: "👋", desc: "Joined LeapMentor", condition: () => true },
  { key: "ten_sessions", label: "10 Sessions", icon: "🎯", desc: "Completed 10 sessions", condition: (p) => (p?.totalSessions || 0) >= 10 },
  { key: "top_rated", label: "Top Rated", icon: "⭐", desc: "Achieved 4.5+ rating", condition: (p) => (p?.avgRating || 0) >= 4.5 },
  { key: "expert_guide", label: "Expert Guide", icon: "🏆", desc: "50+ sessions completed", condition: (p) => (p?.totalSessions || 0) >= 50 },
];

// ── Profile Completion ────────────────────────────────────────
const getProfileCompletion = (profile) => {
  if (!profile) return 0;
  const fields = [
    profile.currentRole,
    profile.bio,
    profile.company,
    profile.industry,
    profile.profilePicture,
    profile.skills?.length > 0,
    profile.linkedInUrl,
    profile.yearsOfExperience > 0,
  ];
  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
};

// ── SVG Icons ─────────────────────────────────────────────────
const IconSessions = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1e3a5f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconStar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const IconMoney = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const IconInbox = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);

// ── Stat Card ─────────────────────────────────────────────────
const StatCard = ({ label, value, sub, icon }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-xl font-extrabold text-slate-800 leading-none truncate">{value}</p>
      {sub && <p className="text-[14px] text-blue-900 mt-0.5">{sub}</p>}
      <p className="text-xs font-bold text-blue-900 mt-1">{label}</p>
    </div>
  </div>
);

// ── Session Card ──────────────────────────────────────────────
const SessionCard = ({ request, index, navigate }) => {
  const slot = request.confirmedSlot || request.selectedSlots?.[0];
  const { dateNum, dateMonth, fullDate } = formatSlotDate(slot);
  const timeStr = slot ? `${formatTime(slot.startTime)} – ${formatTime(slot.endTime)}` : "Time TBD";
  const menteeName = request.mentee?.name || "Mentee";
  const isOngoing = request.status === "ongoing";
  const accent = getAccent(index);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 px-4 py-3.5 shadow-sm hover:shadow-md transition-all flex items-center gap-3">
      <div style={{ backgroundColor: accent }}
        className="w-11 h-14 rounded-xl flex flex-col items-center justify-center shrink-0">
        <span className="text-[9px] font-bold text-white tracking-widest">{dateMonth}</span>
        <span className="text-xl font-bold text-white leading-none">{dateNum}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-slate-800 truncate">{menteeName}</p>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0
            ${isOngoing
              ? "bg-blue-50 text-blue-900 border border-blue-100"
              : "bg-emerald-50 text-emerald-600 border border-emerald-100"}`}>
            {isOngoing ? "Ongoing" : "Accepted"}
          </span>
        </div>
        <p className="text-xs text-blue-900 mt-0.5 truncate">
          {timeStr}{fullDate ? ` · ${fullDate}` : ""}
        </p>
      </div>
      <div className="shrink-0">
        {isOngoing ? (
          <button
            onClick={() => navigate(`/shared-dashboard/${request._id}`)}
            className="text-xs bg-blue-900 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap">
            Open Dashboard
          </button>
        ) : (
          <span className="text-xs text-blue-800 border border-slate-200 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap">
            Awaiting Payment
          </span>
        )}
      </div>
    </div>
  );
};

// ── Session Skeleton ──────────────────────────────────────────
const SessionSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-100 px-4 py-3.5 flex items-center gap-3 animate-pulse">
    <div className="w-11 h-14 rounded-xl bg-slate-200 shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-3 bg-slate-200 rounded w-2/5" />
      <div className="h-2.5 bg-slate-100 rounded w-3/5" />
    </div>
    <div className="h-8 w-24 bg-slate-200 rounded-lg" />
  </div>
);

// ── Earnings Skeleton ─────────────────────────────────────────
const EarningsSkeleton = () => (
  <div className="space-y-3 animate-pulse">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50">
        <div className="space-y-1">
          <div className="h-3 w-24 bg-slate-200 rounded" />
          <div className="h-2 w-32 bg-slate-100 rounded" />
        </div>
        <div className="h-4 w-16 bg-slate-200 rounded" />
      </div>
    ))}
  </div>
);

// ── Main ──────────────────────────────────────────────────────
const MentorHomeTab = ({ user, profile, refetchProfile, setActiveTab }) => {
  const navigate = useNavigate();
  const firstName = user?.name?.split(" ")[0] || "there";
  const isFirstLogin = user?.isFirstLogin ?? false;

  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [actualSessionCount, setActualSessionCount] = useState(null);

  const [earnings, setEarnings] = useState(null);
  const [loadingEarnings, setLoadingEarnings] = useState(true);

  const completionPct = getProfileCompletion(profile);

  // compute badges using actualSessionCount for accuracy
  const badgeProfile = {
    ...profile,
    totalSessions: actualSessionCount ?? profile?.totalSessions ?? 0,
  };
  const badges = BADGES.map((b) => ({ ...b, unlocked: b.condition(badgeProfile) }));
  const unlockedCount = badges.filter((b) => b.unlocked).length;

  // ── Refetch profile on mount ──────────────────────────────
  useEffect(() => {
    if (refetchProfile) refetchProfile();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Fetch sessions + actual count ─────────────────────────
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoadingSessions(true);
        const res = await axios.get(
          `${BASE_URL}/api/connect-requests/incoming`,
          { headers: authHeader() }
        );
        const all = res.data.requests || [];
        const active = all.filter((r) => r.status === "ongoing" || r.status === "accepted");
        const pending = all.filter((r) => r.status === "pending");
        const completed = all.filter((r) => r.status === "completed");

        setSessions(active);
        setPendingCount(pending.length);
        // ✅ Real count from DB — completed + ongoing
        setActualSessionCount(completed.length + active.filter((r) => r.status === "ongoing").length);
      } catch (err) {
        console.error("MentorHomeTab sessions error:", err.message);
      } finally {
        setLoadingSessions(false);
      }
    };
    fetchSessions();
  }, []);

  // ── Fetch earnings ────────────────────────────────────────
  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        setLoadingEarnings(true);
        const res = await axios.get(
          `${BASE_URL}/api/mentor/earnings`,
          { headers: authHeader() }
        );
        setEarnings({
          totalEarnings: res.data.totalEarnings || 0,
          sessionsThisMonth: res.data.sessionsThisMonth || 0,
          pendingPayout: res.data.pendingPayout || 0,
          walletBalance: res.data.walletBalance || 0,
        });
      } catch (err) {
        console.error("MentorHomeTab earnings error:", err.message);
        setEarnings({ totalEarnings: 0, sessionsThisMonth: 0, pendingPayout: 0, walletBalance: 0 });
      } finally {
        setLoadingEarnings(false);
      }
    };
    fetchEarnings();
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto px-2 flex flex-col gap-6">

      {/* ── Welcome ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {isFirstLogin ? `Welcome, ${firstName}! 👋` : `Welcome , ${firstName}! 👋`}
          </h1>
          <p className="text-sm text-blue-900  mt-1">
            {loadingSessions
              ? "Loading your dashboard..."
              : sessions.length > 0
                ? `You have ${sessions.length} active session${sessions.length > 1 ? "s" : ""}.`
                : "No active sessions yet."}
          </p>
        </div>

        {/* Profile completion pill */}
        {completionPct < 100 && (
          <div className="hidden sm:flex flex-col items-center gap-1 shrink-0 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setActiveTab("profile")}>
            <div className="relative w-9 h-9">
              <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e3a5f" strokeWidth="3"
                  strokeDasharray={`${completionPct} ${100 - completionPct}`}
                  strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[9px] font-extrabold text-blue-900">
                {completionPct}%
              </span>
            </div>
            <span className="text-xs font-bold text-blue-900">Profile</span>
          </div>
        )}
      </div>

      {/* ── Quick Stats Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total Sessions"
          value={loadingSessions ? "—" : (actualSessionCount ?? 0)}
          sub="completed + ongoing"
          icon={<IconSessions />}
        />
        <StatCard
          label="Avg Rating"
          value={profile?.avgRating > 0 ? profile.avgRating.toFixed(1) : "New"}
          sub={profile?.avgRating > 0 ? "out of 5.0" : "no reviews yet"}
          icon={<IconStar />}
        />
        <StatCard
          label="Wallet Balance"
          value={loadingEarnings ? "—" : `${fmt(earnings?.walletBalance)} LP`}
          sub="available to withdraw"
          icon={<IconMoney />}
        />
        <StatCard
          label="Pending Requests"
          value={loadingSessions ? "—" : pendingCount}
          sub="awaiting your response"
          icon={<IconInbox />}
        />
      </div>

      {/* ── Main Two Column Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

        {/* ── LEFT — Active Sessions ── */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-700">Active Sessions</h2>
            {sessions.length > 0 && (
              <span className="text-xs font-bold text-blue-900 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">
                {sessions.length} active
              </span>
            )}
          </div>

          {loadingSessions ? (
            <div className="flex flex-col gap-3">
              <SessionSkeleton />
              <SessionSkeleton />
            </div>
          ) : sessions.length > 0 ? (
            <div className="flex flex-col gap-3">
              {sessions.map((request, idx) => (
                <SessionCard
                  key={request._id}
                  request={request}
                  index={idx}
                  navigate={navigate}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-10 text-center flex flex-col items-center gap-3 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-900">No active sessions</p>
                <p className="text-xs text-blue-900 mt-1 max-w-xs leading-relaxed">
                  Sessions appear here once a mentee completes escrow payment for an accepted request.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT — Badges + Earnings ── */}
        <div className="flex flex-col gap-4">

          {/* Badges */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-slate-700">Your Badges</p>
              <span className="text-[11px] font-semibold text-blue-800 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-full">
                {unlockedCount}/{badges.length} unlocked
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {badges.map((badge) => (
                <div
                  key={badge.key}
                  title={badge.desc}
                  className={`relative flex flex-col items-center gap-1.5 py-3 px-1 rounded-xl border transition-all duration-200
    ${badge.unlocked
                      ? "bg-blue-50 border-blue-200 shadow-md shadow-blue-200"
                      : "bg-slate-100 border-slate-600 border-dashed opacity-90 grayscale"
                    }`}
                >
                  {!badge.unlocked && (
                    <span className="absolute top-1 left-1 text-[10px]" style={{ filter: "none" }}>🔒</span>
                  )}
                  <span className="text-xl relative">
                    {badge.icon}

                  </span>
                  <span className={`text-[9px] font-bold text-center leading-tight
  ${badge.unlocked ? "text-blue-700" : "text-slate-800"}`}>
                    {badge.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Earnings Summary */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-slate-700">Earnings Summary</p>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                Leap Points
              </span>
            </div>

            {loadingEarnings ? (
              <EarningsSkeleton />
            ) : (
              <div className="space-y-1">
                <div className="flex items-center justify-between py-2.5 border-b border-slate-50 border-l-4 border-l-blue-400 pl-3">

                  <div>
                    <p className="text-xs text-blue-900 font-semibold">Total Earnings</p>
                    <p className="text-[10px] text-slate-800 font-semibold mt-0.5">from completed sessions</p>
                  </div>
                  <p className="text-sm font-extrabold text-slate-800">
                    {fmt(earnings?.totalEarnings)}
                    <span className="text-xs font-bold text-blue-500 ml-1">LP</span>
                  </p>
                </div>

                <div className="flex items-center justify-between py-2.5 border-b border-slate-50 border-l-4 border-l-amber-400 pl-3">
                  <div>
                    <p className="text-xs text-blue-900 font-semibold">Pending Payout</p>
                    <p className="text-[10px] text-slate-800 font-semibold mt-0.5">locked in escrow</p>
                  </div>
                  <p className="text-sm font-extrabold text-amber-600">
                    {fmt(earnings?.pendingPayout)}
                    <span className="text-xs font-bold text-amber-400 ml-1">LP</span>
                  </p>
                </div>

                <div className="flex items-center justify-between py-2.5 border-b border-slate-50 border-l-4 border-l-indigo-400 pl-3">
                  <div>
                    <p className="text-xs text-blue-900 font-semibold">This Month</p>
                    <p className="text-[10px] text-slate-800 font-semibold mt-0.5">completed sessions</p>
                  </div>
                  <p className="text-sm font-extrabold text-blue-900">
                    {earnings?.sessionsThisMonth ?? 0}
                    <span className="text-xs font-semibold text-blue-800 ml-1">sessions</span>
                  </p>
                </div>

                <div className="flex items-center justify-between py-2.5 border-l-4 border-l-emerald-400 pl-3">
                  <div>
                    <p className="text-xs text-blue-900 font-semibold">Available Balance</p>
                    <p className="text-[10px] text-slate-800 font-semibold mt-0.5">ready to withdraw</p>
                  </div>
                  <p className="text-sm font-extrabold text-emerald-600">
                    {fmt(earnings?.walletBalance)}
                    <span className="text-xs font-bold text-emerald-400 ml-1">LP</span>
                  </p>
                </div>

              </div>
            )}
          </div>

        </div>
        {/* ── END RIGHT ── */}

      </div>
      {/* ── END Two Column ── */}

    </div>
  );
};

export default MentorHomeTab;