// src/components/mentor/dashboard/requests/RequestsTab.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import RequestCard from "./RequestCard";
import MenteeProfileModal from "./MenteeProfileModal";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const TABS = [
  { key: "all",      label: "All Requests" },
  { key: "pending",  label: "Pending" },
  { key: "accepted", label: "Accepted" },
  { key: "rejected", label: "Rejected" },
  { key: "referred", label: "Referred" }, // ✅ new tab
];

const RequestsTab = () => {
  const [requests, setRequests]               = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState("");
  const [activeTab, setActiveTab]             = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(`${BASE_URL}/api/connect-requests/incoming`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRequests(res.data.requests || []);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load requests.");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  // ✅ Update request status locally after respond/refer
  const handleUpdate = (id, newStatus) => {
    setRequests((prev) =>
      prev.map((r) =>
        r._id === id ? { ...r, status: newStatus, respondedAt: new Date().toISOString() } : r
      )
    );
  };

  // Filter by active tab
  const filtered = activeTab === "all"
    ? requests
    : requests.filter((r) => r.status === activeTab);

  // Count badges
  const counts = {
    all:      requests.length,
    pending:  requests.filter((r) => r.status === "pending").length,
    accepted: requests.filter((r) => r.status === "accepted").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
    referred: requests.filter((r) => r.status === "referred").length, // ✅ new
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-blue-100 border-t-blue-900 animate-spin" />
          <p className="text-sm text-slate-400 font-medium">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-5">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Mentee Requests</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Manage your incoming and active mentorship connections.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-sm bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3">
            <span>⚠</span> {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-100 pb-1 flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-xl text-xs font-bold transition-all duration-150 ${
                activeTab === tab.key
                  ? "text-blue-900 border-b-2 border-blue-900 bg-blue-50/50"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {tab.label}
              {counts[tab.key] > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === tab.key
                    ? "bg-blue-900 text-white"
                    : tab.key === "referred"
                    ? "bg-violet-100 text-violet-600"  // ✅ violet badge for referred
                    : "bg-slate-100 text-slate-500"
                }`}>
                  {counts[tab.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Cards */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <p className="text-sm font-bold text-slate-700">
              {activeTab === "all" ? "No requests yet" : `No ${activeTab} requests`}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {activeTab === "pending"
                ? "You'll see new requests here when mentees reach out."
                : activeTab === "referred"
                ? "Requests you've referred to other mentors will appear here."
                : activeTab === "all"
                ? "When mentees send you connect requests, they'll appear here."
                : `No requests have been ${activeTab} yet.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((request) => (
              <RequestCard
                key={request._id}
                request={request}
                onViewProfile={(r) => setSelectedRequest(r)}
              />
            ))}
          </div>
        )}
      </div>

      {/* MenteeProfileModal */}
      {selectedRequest && (
        <MenteeProfileModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onUpdate={(id, status) => {
            handleUpdate(id, status);
            setSelectedRequest(null);
          }}
        />
      )}
    </>
  );
};

export default RequestsTab;