// src/components/mentor/dashboard/earnings/TrackEarningsTab.jsx
import { useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import useTrackEarnings from "../../../../hooks/useTrackEarnings";

// ── Helpers ───────────────────────────────────────────────────
const fmt = (n) =>
  Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ── Stat Card ─────────────────────────────────────────────────
const StatCard = ({ label, value, sub, subColor = "text-emerald-500", icon }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4 flex flex-col gap-1 min-w-0">
    <p className="text-xs text-slate-400 font-medium">{label}</p>
    <div className="flex items-end gap-2 flex-wrap">
      <p className="text-2xl font-extrabold text-slate-800 tracking-tight">{value}</p>
      {sub && (
        <span className={`text-xs font-bold mb-0.5 flex items-center gap-0.5 ${subColor}`}>
          {sub}
        </span>
      )}
    </div>
    {icon && <div className="mt-1 text-slate-300">{icon}</div>}
  </div>
);

// ── Custom Tooltip ────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-lg">
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        <p className="text-sm font-bold text-blue-600">{fmt(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

// ── Withdraw Modal ────────────────────────────────────────────
const WithdrawModal = ({ balance, onClose, onConfirm, loading, msg }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23"/>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      </div>
      <h2 className="text-xl font-extrabold text-slate-800 mb-1">Withdraw Funds</h2>
      <p className="text-sm text-slate-400 mb-4">
        Your available balance is{" "}
        <span className="font-bold text-slate-700">{fmt(balance)} LP</span>
      </p>

      {msg.text && (
        <div className={`w-full mb-4 text-sm rounded-xl px-4 py-3 border ${
          msg.type === "success"
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : "bg-red-50 text-red-600 border-red-200"
        }`}>
          {msg.text}
        </div>
      )}

      {balance <= 0 && (
        <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 w-full">
          No balance available to withdraw.
        </p>
      )}

      <div className="flex gap-3 w-full">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-3 rounded-2xl border-2 border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-all"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading || balance <= 0}
          className="flex-1 py-3 rounded-2xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Processing...</>
          ) : "Confirm"}
        </button>
      </div>
    </div>
  </div>
);

// ── Status Badge ──────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const styles = {
    paid:      "bg-emerald-50 text-emerald-600 border-emerald-200",
    completed: "bg-emerald-50 text-emerald-600 border-emerald-200",
    pending:   "bg-amber-50 text-amber-600 border-amber-200",
    refunded:  "bg-red-50 text-red-500 border-red-200",
  };
  const labels = {
    paid:      "Completed",
    completed: "Completed",
    pending:   "Pending",
    refunded:  "Refunded",
  };
  return (
    <span className={`text-xs font-bold px-3 py-1 rounded-full border capitalize ${styles[status] || styles.pending}`}>
      {labels[status] || status}
    </span>
  );
};

// ── Loading Skeleton ──────────────────────────────────────────
const Skeleton = ({ className }) => (
  <div className={`bg-slate-100 animate-pulse rounded-xl ${className}`} />
);

// ── Main Component ────────────────────────────────────────────
const TrackEarningsTab = () => {
  const {
    stats,
    loadingStats,
    chartData,
    chartPeriod,
    loadingChart,
    payouts,
    loadingPayouts,
    search,       setSearch,
    page,
    hasMore,
    totalCount,
    error,
    showWithdraw, setShowWithdraw,
    withdrawing,
    withdrawMsg,
    handleChartPeriod,
    goNext,
    goPrev,
    handleWithdraw,
  } = useTrackEarnings();

  return (
    <>
      <div className="space-y-6 max-w-5xl">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Track Earnings</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Monitor your mentorship income and session performance.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Withdraw Funds */}
            <button
              type="button"
              onClick={() => setShowWithdraw(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all shadow-sm shadow-blue-200"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
              Withdraw Funds
            </button>
            {/* Report */}
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
              Report
            </button>
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="flex items-center gap-2 text-sm bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3">
            <span>⚠</span> {error}
          </div>
        )}

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loadingStats ? (
            [1,2,3,4].map((i) => <Skeleton key={i} className="h-24" />)
          ) : (
            <>
              <StatCard
                label="Total Earnings"
                value={fmt(stats.totalEarnings)}
                sub={
                  <span className="flex items-center gap-0.5">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="18 15 12 9 6 15"/>
                    </svg>
                    12%
                  </span>
                }
              />
              <StatCard
                label="Sessions This Month"
                value={stats.sessionsThisMonth}
                sub={
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                  </svg>
                }
                subColor="text-slate-400"
              />
              <StatCard
                label="Average Rating"
                value={`${Number(stats.avgRating || 0).toFixed(1)}/5.0`}
                sub={
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                }
                subColor="text-amber-400"
              />
              <StatCard
                label="Pending Payout"
                value={fmt(stats.pendingPayout)}
                sub={
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                }
                subColor="text-slate-400"
              />
            </>
          )}
        </div>

        {/* ── Earnings Chart ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-start justify-between mb-1 flex-wrap gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-800">Earnings Over Last 6 Months</h2>
              <p className="text-xs text-slate-400 mt-0.5">Revenue growth from Jan 2024 to Jun 2024</p>
            </div>
            <div className="flex items-center gap-1 bg-slate-50 rounded-xl p-1">
              {["monthly", "weekly"].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleChartPeriod(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    chartPeriod === p
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {loadingChart ? (
            <Skeleton className="h-52 mt-4" />
          ) : (
            <div className="mt-4 h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "#94A3B8", fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#94A3B8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#3B82F6"
                    strokeWidth={2.5}
                    fill="url(#earningsGradient)"
                    dot={false}
                    activeDot={{ r: 5, fill: "#3B82F6", strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* ── Payout History ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <h2 className="text-base font-bold text-slate-800">Payout History</h2>
            {/* Search */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search mentee..."
                className="pl-8 pr-4 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all w-48"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {["DATE", "MENTEE NAME", "SESSION TYPE", "DURATION", "AMOUNT", "STATUS"].map((h) => (
                    <th key={h} className="pb-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider pr-4">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loadingPayouts ? (
                  [1,2,3,4].map((i) => (
                    <tr key={i}>
                      {[1,2,3,4,5,6].map((j) => (
                        <td key={j} className="py-3 pr-4">
                          <Skeleton className="h-4 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : payouts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <p className="text-sm font-semibold text-slate-500">No payouts found</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {search ? `No results for "${search}"` : "Completed sessions will appear here."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  payouts.map((row) => (
                    <tr key={row.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 pr-4 text-sm text-slate-500 whitespace-nowrap">{row.date}</td>
                      <td className="py-3.5 pr-4 text-sm font-semibold text-slate-700 whitespace-nowrap">{row.menteeName}</td>
                      <td className="py-3.5 pr-4 text-xs font-bold text-slate-500 uppercase tracking-wide">{row.sessionType}</td>
                      <td className="py-3.5 pr-4 text-sm text-slate-500 whitespace-nowrap">{row.duration}</td>
                      <td className="py-3.5 pr-4 text-sm font-bold text-slate-800">{fmt(row.amount)}</td>
                      <td className="py-3.5">
                        <StatusBadge status={row.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
            <p className="text-xs text-slate-400">
              Showing {payouts.length} of {totalCount} records
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goPrev}
                disabled={page === 1}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={goNext}
                disabled={!hasMore}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* ── Withdraw Modal ── */}
      {showWithdraw && (
        <WithdrawModal
          balance={stats.walletBalance}
          onClose={() => setShowWithdraw(false)}
          onConfirm={handleWithdraw}
          loading={withdrawing}
          msg={withdrawMsg}
        />
      )}
    </>
  );
};

export default TrackEarningsTab;