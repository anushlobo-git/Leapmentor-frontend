/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */
// src/features/mentee/components/dashboard/history/OngoingReferredContent.jsx
//
// Split out of DetailDrawer.jsx (which had grown past 600 lines). This file
// holds the two status views with real internal logic: Ongoing (invoice
// download) and Referred (the referred-mentor profile modal). The simpler,
// mostly-static views (Pending, Accepted, Completed, Rejected) live in
// RequestStatusViews.jsx, which also exports the shared SlotRow used here.
import { useState } from "react";
import { downloadInvoice } from "@features/mentee/api/mentee.api";
import {
  formatDate,
  formatTime,
} from "@features/mentee/components/dashboard/history/constants";
import { SlotRow } from "@features/mentee/components/dashboard/history/RequestStatusViews";
import MentorProfileModal from "@features/mentee/components/dashboard/findMentors/MentorProfileModal";
import PropTypes from "prop-types";
import logger from "@lib/logger";

// ── Ongoing content ─────────────────────────────────────────
export const OngoingContent = ({ request, onClose }) => {
  const { confirmedSlot, sessionRate, sessionCount, totalAmount, paidAt } =
    request;

  // ✅ NEW
  const [downloading, setDownloading] = useState(false);

  // ✅ NEW
  const handleDownload = async () => {
    try {
      setDownloading(true);
      logger.info("Downloading invoice", { requestId: request._id });
      const res = await downloadInvoice(request._id);
      const url = globalThis.URL.createObjectURL(
        new Blob([res.data], { type: "application/pdf" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = `Invoice-${request._id.slice(-6).toUpperCase()}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      globalThis.URL.revokeObjectURL(url);
      logger.info("Invoice downloaded", { requestId: request._id });
    } catch (err) {
      logger.warn("Failed to download invoice", {
        requestId: request._id,
        error: err?.message || err,
      });
      alert("Failed to download invoice. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5">
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#2563EB"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <p className="text-xs text-blue-700 font-medium">
          {totalAmount} tokens secured in escrow
        </p>
      </div>

      {confirmedSlot && (
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">
            Session
          </p>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5">
            <p className="text-xs font-semibold text-emerald-700">
              {confirmedSlot.day},{" "}
              {new Date(confirmedSlot.date + "T00:00:00").toLocaleDateString(
                "en-US",
                {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                },
              )}
            </p>
            <p className="text-xs font-bold text-emerald-600 mt-0.5">
              {formatTime(confirmedSlot.startTime)} –{" "}
              {formatTime(confirmedSlot.endTime)}
            </p>
          </div>
        </div>
      )}

      {(sessionRate || sessionCount) && (
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-1.5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">
            Payment Summary
          </p>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Rate per session</span>
            <span className="font-semibold text-slate-700">
              {sessionRate} tokens
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Sessions</span>
            <span className="font-semibold text-slate-700">
              × {sessionCount}
            </span>
          </div>
          <div className="flex justify-between text-xs pt-1.5 border-t border-slate-200">
            <span className="font-bold text-slate-700">Total locked</span>
            <span className="font-bold text-blue-900">
              {totalAmount} tokens
            </span>
          </div>
        </div>
      )}

      {paidAt && (
        <p className="text-[10px] text-slate-400 text-center">
          Paid on {formatDate(paidAt)}
        </p>
      )}

      {/* ✅ NEW — Download Invoice button */}
      <button
        type="button"
        onClick={handleDownload}
        disabled={downloading}
        className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {downloading ? (
          <>
            <span className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 border-t-slate-600 animate-spin" />
            {"Downloading..."}
          </>
        ) : (
          <>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download Invoice
          </>
        )}
      </button>

      <button
        type="button"
        onClick={onClose}
        className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-all"
      >
        Close
      </button>
    </div>
  );
};

// ── Referred content ────────────────────────────────────────
export const ReferredContent = ({ request, onDelete }) => {
  const {
    mentor,
    referredTo,
    referredToProfile,
    selectedSlots = [],
    message,
  } = request;

  const [showReferredProfile, setShowReferredProfile] = useState(false);

  const referredMentorForModal = referredTo
    ? {
        user: {
          _id: referredTo._id,
          name: referredTo.name,
          email: referredTo.email,
        },
        currentRole: referredToProfile?.currentRole || "",
        company: referredToProfile?.company || "",
        industry: referredToProfile?.industry || "",
        bio: referredToProfile?.bio || "",
        hourlyRate: referredToProfile?.hourlyRate || null,
        avgRating: referredToProfile?.avgRating || 0,
        yearsOfExperience: referredToProfile?.yearsOfExperience || null,
        profilePicture: referredToProfile?.profilePicture || null,
        skills: referredToProfile?.skills || [],
      }
    : null;

  return (
    <>
      <div className="space-y-4">
        <div className="bg-violet-50 border border-violet-100 rounded-xl p-3 space-y-2">
          <p className="text-[10px] font-bold text-violet-400 uppercase tracking-wide">
            Referral Path
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-white border border-violet-200 rounded-lg px-3 py-2">
              <p className="text-[10px] text-slate-400 font-medium">
                Original Mentor
              </p>
              <p className="text-xs font-bold text-slate-700 truncate">
                {mentor?.name || "—"}
              </p>
            </div>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#7C3AED"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="M12 5l7 7-7 7" />
            </svg>
            <div className="flex-1 bg-white border border-violet-200 rounded-lg px-3 py-2">
              <p className="text-[10px] text-slate-400 font-medium">
                Referred To
              </p>
              <p className="text-xs font-bold text-slate-700 truncate">
                {referredTo?.name || "—"}
              </p>
              {referredToProfile?.currentRole && (
                <p className="text-[10px] text-slate-400 truncate">
                  {referredToProfile.currentRole}
                </p>
              )}
            </div>
          </div>
        </div>

        {referredMentorForModal && (
          <button
            type="button"
            onClick={() => setShowReferredProfile(true)}
            className="w-full py-2.5 rounded-xl bg-violet-600 text-white text-xs font-bold hover:bg-violet-700 transition-all flex items-center justify-center gap-2"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            View Referred Mentor Profile
          </button>
        )}

        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">
            Proposed Times
          </p>
          <div className="space-y-1.5">
            {selectedSlots.map((slot) => (
              <SlotRow
                key={`${slot.date}-${slot.startTime}`}
                slot={slot}
                isConfirmed={false}
              />
            ))}
          </div>
        </div>

        {message && (
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
              Your Message
            </p>
            <p className="text-xs text-slate-600 italic">"{message}"</p>
          </div>
        )}

        <button
          type="button"
          onClick={onDelete}
          className="w-full py-2.5 rounded-xl border-2 border-red-200 text-red-500 text-xs font-semibold hover:bg-red-50 transition-all"
        >
          Delete Request
        </button>
      </div>

      {showReferredProfile && referredMentorForModal && (
        <MentorProfileModal
          mentor={referredMentorForModal}
          onClose={() => setShowReferredProfile(false)}
        />
      )}
    </>
  );
};

OngoingContent.propTypes = {
  request: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    totalAmount: PropTypes.number.isRequired,
    confirmedSlot: PropTypes.shape({
      day: PropTypes.string,
      date: PropTypes.string,
      startTime: PropTypes.string,
      endTime: PropTypes.string,
    }),
    sessionRate: PropTypes.number,
    sessionCount: PropTypes.number,
    paidAt: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

ReferredContent.propTypes = {
  request: PropTypes.shape({
    mentor: PropTypes.shape({ name: PropTypes.string }),
    referredTo: PropTypes.shape({
      _id: PropTypes.string,
      name: PropTypes.string,
      email: PropTypes.string,
    }),
    referredToProfile: PropTypes.shape({
      currentRole: PropTypes.string,
      company: PropTypes.string,
      industry: PropTypes.string,
      bio: PropTypes.string,
      hourlyRate: PropTypes.number,
      avgRating: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      yearsOfExperience: PropTypes.number,
      profilePicture: PropTypes.string,
      skills: PropTypes.arrayOf(PropTypes.string),
    }),
    selectedSlots: PropTypes.array,
    message: PropTypes.string,
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
};
