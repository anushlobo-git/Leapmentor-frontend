// src/components/mentor/dashboard/requests/RequestCard.jsx
import { useState } from "react";
import ReferredByProfileModal from "./ReferredByProfileModal";

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  // Handle both ISO timestamps and YYYY-MM-DD strings
  const d = dateStr.includes("T") ? new Date(dateStr) : new Date(dateStr + "T00:00:00");
  if (isNaN(d)) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const formatTime = (time) => {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
};

const STATUS_STYLES = {
  pending:  "bg-amber-50 text-amber-600 border-amber-200",
  accepted: "bg-emerald-50 text-emerald-600 border-emerald-200",
  rejected: "bg-red-50 text-red-500 border-red-200",
  referred: "bg-violet-50 text-violet-600 border-violet-200",
};

// ── Slots Detail Modal ────────────────────────────────────────
const SlotsModal = ({ request, onClose }) => {
  const { mentee, selectedSlots = [], confirmedSlot, status, message, requestedAt } = request;
  const initials = mentee?.name
    ? mentee.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-6">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-900 flex items-center justify-center text-white text-lg font-bold shrink-0">
              {initials}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">{mentee?.name || "—"}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{mentee?.email}</p>
              <span className={`inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border capitalize ${STATUS_STYLES[status] || STATUS_STYLES.pending}`}>
                {status}
              </span>
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

          {/* Message */}
          {message && (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
              <p className="text-xs font-bold text-blue-900 uppercase tracking-wide mb-1.5">Message</p>
              <p className="text-sm text-slate-600 leading-relaxed italic">"{message}"</p>
            </div>
          )}

          {/* ✅ Referral info inside modal */}
          {request.referredBy && (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-1.5">Referred By</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center text-amber-800 text-xs font-bold shrink-0">
                  {request.referredBy?.name
                    ? request.referredBy.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
                    : "?"}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">{request.referredBy?.name || "—"}</p>
                  {request.referredBy?.email && (
                    <p className="text-xs text-slate-400">{request.referredBy.email}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Confirmed slot (accepted) */}
          {status === "accepted" && confirmedSlot && (
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Confirmed Session</p>
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <span className="text-sm font-semibold text-emerald-700">
                    {confirmedSlot.day}, {formatDate(confirmedSlot.date)}
                  </span>
                </div>
                <span className="text-sm font-bold text-emerald-600">
                  {formatTime(confirmedSlot.startTime)} – {formatTime(confirmedSlot.endTime)}
                </span>
              </div>
            </div>
          )}

          {/* All proposed slots */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
              {status === "accepted" ? "All Proposed Slots" : "Proposed Session Times"}
              <span className="ml-2 text-blue-500 normal-case font-semibold">
                {selectedSlots.length} slot{selectedSlots.length > 1 ? "s" : ""}
              </span>
            </p>
            <div className="space-y-2">
              {selectedSlots.map((slot, i) => (
                <div key={i}
                  className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-900 text-[10px] font-black flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-sm font-semibold text-slate-700">
                      {slot.day}, {formatDate(slot.date)}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-blue-900">
                    {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Requested on */}
          <p className="text-xs text-slate-400 text-center">
            Requested on {formatDate(requestedAt)}
          </p>

          {/* Close */}
          <button type="button" onClick={onClose}
            className="w-full py-3 rounded-2xl border-2 border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-all duration-150">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Request Card ──────────────────────────────────────────────
const RequestCard = ({ request, onViewProfile }) => {
  const [showSlots, setShowSlots]                         = useState(false);
  const [showReferredByProfile, setShowReferredByProfile] = useState(false); // ✅ NEW

  const { mentee, message, selectedSlots = [], confirmedSlot, status, requestedAt } = request;

  const initials = mentee?.name
    ? mentee.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const displaySlot = status === "accepted" && confirmedSlot
    ? confirmedSlot
    : selectedSlots[0];

  const extraSlots = selectedSlots.length - 1;

  // ✅ NEW — build object for ReferredByProfileModal
  const referredByMentor = request.referredBy
    ? {
        name:              request.referredBy.name              || "",
        email:             request.referredBy.email             || "",
        currentRole:       request.referredByProfile?.currentRole       || "",
        company:           request.referredByProfile?.company           || "",
        industry:          request.referredByProfile?.industry          || "",
        bio:               request.referredByProfile?.bio               || "",
        hourlyRate:        request.referredByProfile?.hourlyRate        || null,
        avgRating:         request.referredByProfile?.avgRating         || 0,
        yearsOfExperience: request.referredByProfile?.yearsOfExperience || null,
        profilePicture:    request.referredByProfile?.profilePicture    || null,
        skills:            request.referredByProfile?.skills            || [],
      }
    : null;

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4 hover:shadow-md transition-shadow duration-150">

        {/* Top row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-blue-900 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {initials}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">{mentee?.name || "—"}</p>
              <p className="text-xs text-slate-400">{mentee?.email || "—"}</p>
            </div>
          </div>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full border capitalize shrink-0 ${STATUS_STYLES[status] || STATUS_STYLES.pending}`}>
            {status}
          </span>
        </div>

        {/* Slot display + extra slots badge */}
        {displaySlot && (
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <p className="text-xs font-semibold text-blue-700">
                {displaySlot.day}, {formatDate(displaySlot.date)} · {formatTime(displaySlot.startTime)} – {formatTime(displaySlot.endTime)}
              </p>
            </div>
            {/* Extra slots badge */}
            {extraSlots > 0 && status === "pending" && (
              <button
                type="button"
                onClick={() => setShowSlots(true)}
                className="shrink-0 w-8 h-8 rounded-xl bg-blue-900 text-white text-xs font-black flex items-center justify-center hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
                title={`${extraSlots} more slot${extraSlots > 1 ? "s" : ""}`}
              >
                +{extraSlots}
              </button>
            )}
          </div>
        )}

        {/* Referred note — this mentor referred to someone else */}
        {status === "referred" && (
          <div className="flex items-center gap-2 bg-violet-50 border border-violet-100 rounded-xl px-3 py-2">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
            </svg>
            <p className="text-xs text-violet-600 font-medium">Referred to another mentor</p>
          </div>
        )}

        {/* ✅ NEW — Referred-by banner, clickable to view profile */}
        {request.referredBy && (
          <button
            type="button"
            onClick={() => setShowReferredByProfile(true)}
            className="w-full flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 hover:bg-amber-100 transition-colors text-left"
          >
            <div className="w-7 h-7 rounded-full bg-amber-300 flex items-center justify-center text-amber-900 text-[10px] font-bold shrink-0">
              {request.referredBy?.name
                ? request.referredBy.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
                : "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-amber-700 font-medium leading-tight">
                Referred by{" "}
                <span className="font-bold">{request.referredBy?.name || "another mentor"}</span>
              </p>
              {request.referredByProfile?.currentRole && (
                <p className="text-[10px] text-amber-500 truncate">
                  {request.referredByProfile.currentRole}
                  {request.referredByProfile.company ? ` · ${request.referredByProfile.company}` : ""}
                </p>
              )}
            </div>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <path d="M5 12h14"/><path d="M12 5l7 7-7 7"/>
            </svg>
          </button>
        )}

        {/* Message preview */}
        {message && (
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed italic">"{message}"</p>
        )}

        {/* Requested date */}
        <p className="text-xs text-slate-400">Requested on {formatDate(requestedAt)}</p>

        {/* View + Respond buttons */}
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={() => setShowSlots(true)}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-all duration-150"
          >
            View Details
          </button>
          {status === "pending" && (
            <button
              type="button"
              onClick={() => onViewProfile(request)}
              className="flex-1 py-2.5 rounded-xl bg-blue-900 text-white text-xs font-bold hover:bg-blue-700 transition-all duration-150 shadow-sm shadow-blue-100"
            >
              Respond
            </button>
          )}
        </div>

      </div>

      {/* Slots detail modal */}
      {showSlots && (
        <SlotsModal
          request={request}
          onClose={() => setShowSlots(false)}
        />
      )}

      {/* ✅ NEW — Referred by profile modal */}
      {showReferredByProfile && referredByMentor && (
        <ReferredByProfileModal
          mentor={referredByMentor}
          onClose={() => setShowReferredByProfile(false)}
        />
      )}
    </>
  );
};

export default RequestCard;