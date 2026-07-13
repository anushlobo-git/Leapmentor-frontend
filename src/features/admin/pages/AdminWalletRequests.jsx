/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/admin/pages/AdminWalletRequests.jsx
import { useState, useEffect, useCallback } from "react";
import {
  getLeapRequests,
  approveLeapRequest,
  rejectLeapRequest,
} from "@features/admin/api/admin.api";
import AdminLayout from "@features/admin/components/AdminLayout";
import MenteeHistoryModal from "@features/admin/components/wallet/MenteeHistoryModal";
import {
  EmptyState,
  RequestRow,
  Toast,
} from "@features/admin/components/wallet/WalletRequestTable";
import { TABS, getEmptyStateLabel } from "./walletRequests.utils";

// ── Main Page ─────────────────────────────────────────────────
const AdminWalletRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");
  const [historyMentee, setHistoryMentee] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getLeapRequests();
      setRequests(res.data.requests || res.data || []);
    } catch {
      showToast("Failed to load requests.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleApprove = async (reqId) => {
    try {
      setActionLoading(reqId);
      await approveLeapRequest(reqId);
      setRequests((prev) =>
        prev.map((r) => (r._id === reqId ? { ...r, status: "approved" } : r)),
      );
      showToast("500 LP added to mentee's wallet successfully!", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Approval failed.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (reqId) => {
    try {
      setActionLoading(reqId);
      await rejectLeapRequest(reqId);
      setRequests((prev) =>
        prev.map((r) => (r._id === reqId ? { ...r, status: "rejected" } : r)),
      );
      showToast("Request rejected.", "error");
    } catch (err) {
      showToast(err.response?.data?.message || "Rejection failed.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = requests.filter((r) => {
    const matchTab = activeTab === "all" || r.status === activeTab;
    const name = r.mentee?.name?.toLowerCase() || "";
    const email = r.mentee?.email?.toLowerCase() || "";
    const matchSearch =
      name.includes(search.toLowerCase()) ||
      email.includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const counts = {
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
    all: requests.length,
  };

  let tableContent;
  if (loading) {
    tableContent = (
      <div className="py-20 flex flex-col items-center gap-3">
        <svg
          className="animate-spin w-7 h-7 text-blue-600"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle cx="12" cy="12" r="10" stroke="#dbeafe" strokeWidth="3" />
          <path
            d="M12 2a10 10 0 0 1 10 10"
            stroke="#2563eb"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
        <p className="text-xs text-slate-400 font-medium">Loading requests…</p>
      </div>
    );
  } else if (filtered.length === 0) {
    tableContent = <EmptyState label={getEmptyStateLabel(search, activeTab)} />;
  } else {
    tableContent = (
      <div className="overflow-x-auto">
        <table className="w-full min-w-175">
          <thead>
            <tr
              style={{
                background: "#f8fafc",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              {[
                "Mentee",
                "Current Balance",
                "Requested On",
                "Status",
                "History",
                "Actions",
              ].map((col) => (
                <th
                  key={col}
                  className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((req) => (
              <RequestRow
                key={req._id}
                req={req}
                onApprove={handleApprove}
                onReject={handleReject}
                actionLoading={actionLoading}
                onViewHistory={setHistoryMentee}
              />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              Wallet Requests
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Review and approve mentee Leap Points refill requests
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
              style={{
                background: "#fef3c7",
                color: "#92400e",
                border: "1px solid #fde68a",
              }}
            >
              {counts.pending} Pending
            </div>
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
              style={{
                background: "#d1fae5",
                color: "#065f46",
                border: "1px solid #a7f3d0",
              }}
            >
              {counts.approved} Approved
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Tabs + Search */}
          <div className="flex items-center justify-between gap-4 px-5 pt-4 pb-0 flex-wrap border-b border-slate-100">
            <div className="flex items-center gap-1">
              {TABS.map((tab) => (
                <button
                  type="button"
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2"
                  style={{
                    borderBottomColor:
                      activeTab === tab.key ? "#2563eb" : "transparent",
                    color: activeTab === tab.key ? "#2563eb" : "#64748b",
                    background: "transparent",
                  }}
                >
                  {tab.label}
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                    style={{
                      background: activeTab === tab.key ? "#dbeafe" : "#f1f5f9",
                      color: activeTab === tab.key ? "#1e40af" : "#94a3b8",
                    }}
                  >
                    {counts[tab.key]}
                  </span>
                </button>
              ))}
            </div>
            <div className="relative mb-2">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2"
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#94a3b8"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search by name or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100"
                style={{ width: 200 }}
              />
            </div>
          </div>

          {/* Table */}
          {tableContent}
        </div>

        <Toast toast={toast} />
      </div>

      {/* History Modal */}
      {historyMentee && (
        <MenteeHistoryModal
          mentee={historyMentee}
          onClose={() => setHistoryMentee(null)}
        />
      )}
    </AdminLayout>
  );
};

export default AdminWalletRequests;
