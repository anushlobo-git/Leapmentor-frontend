// src/components/mentor/dashboard/requests/MenteeProfileModal.jsx
import { useState } from "react";
import axios from "axios";
import RequestActionModal from "./RequestActionModal";
import ReferModal from "./ReferModal";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const formatTime = (time) => {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long", month: "short", day: "numeric", year: "numeric",
  });
};

const MenteeProfileModal = ({ request, onClose, onUpdate }) => {
  const [loading, setLoading]               = useState(false);
  const [actionModal, setActionModal]       = useState(null);
  const [showReferModal, setShowReferModal] = useState(false);

  const mentee   = request.mentee;
  const slots    = request.selectedSlots || [];
  const initials = mentee?.name
    ? mentee.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const handleRespond = async (status) => {
    const confirmedSlot = status === "accepted" ? slots[0] : undefined;
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const body  = { status, ...(confirmedSlot ? { confirmedSlot } : {}) };
      await axios.patch(
        `${BASE_URL}/connect-requests/${request._id}`,
        body,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // ✅ No toast here — backend emits socket event to mentee directly
      setActionModal({ type: status, mentee: mentee?.name });
      onUpdate(request._id, status);
    } catch (err) {
      console.error("Respond error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (actionModal) {
    return (
      <RequestActionModal
        type={actionModal.type}
        menteeName={actionModal.mentee}
        onBack={() => { setActionModal(null); onClose(); }}
      />
    );
  }

  if (showReferModal) {
    return (
      <ReferModal
        request={request}
        onClose={() => { setShowReferModal(false); onClose(); }}
        onReferred={(id, status) => {
          // ✅ No toast here — backend emits socket event to mentee directly
          onUpdate(id, status);
          setShowReferModal(false);
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-6">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">

        {/* ── Header ── */}
        <div className="flex items-start justify-between p-6 pb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-900 flex items-center justify-center text-white text-xl font-bold shrink-0">
              {initials}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">{mentee?.name || "—"}</h2>
              <p className="text-sm text-blue-900 font-semibold">Aspiring Mentee</p>
              <p className="text-xs text-slate-400 mt-0.5">{mentee?.email}</p>
            </div>
          </div>
          <button type="button" onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center shrink-0 transition-colors">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="px-6 pb-6 space-y-5">

          {/* ── Message ── */}
          {request.message && (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <p className="text-xs font-bold text-blue-900 uppercase tracking-wide">Mentorship Request Message</p>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed italic">"{request.message}"</p>
            </div>
          )}

          {/* ── Proposed slots ── */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Proposed Session Times</p>
            <div className="space-y-2">
              {slots.map((slot, i) => (
                <div key={i} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <span className="text-sm font-semibold text-slate-700">{formatDate(slot.date)}</span>
                  </div>
                  <span className="text-sm font-bold text-blue-900">
                    {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Requested on ── */}
          <p className="text-xs text-slate-400 text-center">
            Requested on {new Date(request.requestedAt).toLocaleDateString("en-US", {
              month: "short", day: "numeric", year: "numeric"
            })}
          </p>

          {/* ── Actions ── */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setShowReferModal(true)} disabled={loading}
              className="flex-1 py-3 rounded-2xl border-2 border-emerald-200 text-emerald-600 text-sm font-semibold hover:bg-emerald-50 disabled:opacity-50 transition-all duration-150">
              Refer
            </button>
            <button type="button" onClick={() => handleRespond("rejected")} disabled={loading}
              className="flex-1 py-3 rounded-2xl border-2 border-red-200 text-red-500 text-sm font-semibold hover:bg-red-50 disabled:opacity-50 transition-all duration-150">
              {loading ? "..." : "Reject"}
            </button>
            <button type="button" onClick={() => handleRespond("accepted")} disabled={loading}
              className="flex-1 py-3 rounded-2xl bg-blue-900 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-all duration-150 shadow-sm shadow-blue-200">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ...
                </span>
              ) : "Accept Request"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenteeProfileModal;