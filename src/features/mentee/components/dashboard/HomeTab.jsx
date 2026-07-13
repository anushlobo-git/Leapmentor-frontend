/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/components/mentee/dashboard/HomeTab.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import SessionCard from "@features/sessions/components/SessionCard";
import Loader from "@components/common/Loader";
import MentorProfileModal from "@features/mentee/components/dashboard/findMentors/MentorProfileModal";
import LeapBuddy from "@features/support/components/LeapBuddy";
import {
  selectDashboardUser,
  selectDashboardProfile,
} from "@features/profile/store/dashboardUserSlice";
import PropTypes from "prop-types";
import {
  useHomeData,
  calculateProfileCompletion,
} from "@features/mentee/hooks/useHomeData";
import HomeMentorCard from "@features/mentee/components/dashboard/HomeMentorCard";
import LeapPointsPanel from "@features/mentee/components/dashboard/LeapPointsPanel";

const MENTEE_ACCENT_COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f97316"];

// ── Main HomeTab ──────────────────────────────────────────────
const HomeTab = () => {
  const navigate = useNavigate();
  const user = useSelector(selectDashboardUser);
  const profile = useSelector(selectDashboardProfile);
  const firstName = user?.name?.split(" ")[0] || "there";
  const isFirstLogin = user?.isFirstLogin ?? false;
  const completionPct = calculateProfileCompletion(profile);
  const [selectedMentor, setSelectedMentor] = useState(null);

  const { mentors, sessions, loading, balance } = useHomeData(profile);

  // Extracted so the "active sessions" message only needs a single (non-nested) ternary.
  const sessionCountSuffix = sessions.length > 1 ? "s" : "";

  // Extracted so the mentors grid only needs a single (non-nested) ternary.
  const mentorsContent =
    mentors.length > 0 ? (
      mentors.map((mentor) => (
        <HomeMentorCard
          key={mentor._id || mentor.user?._id}
          mentor={mentor}
          onViewProfile={setSelectedMentor}
        />
      ))
    ) : (
      <div className="col-span-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center">
        <p className="text-sm text-slate-700">No mentor recommendations yet.</p>
        <button
          onClick={() =>
            globalThis.dispatchEvent(
              new CustomEvent("setDashboardTab", {
                detail: "findMentors",
              }),
            )
          }
          className="text-xs text-blue-900 font-semibold mt-2 hover:underline"
        >
          Browse all mentors →
        </button>
      </div>
    );

  // Extracted so the sessions list only needs a single (non-nested) ternary.
  const sessionsContent =
    sessions.length > 0 ? (
      sessions.map((request, idx) => (
        <SessionCard
          key={request._id}
          request={request}
          index={idx}
          navigate={navigate}
          personKey="mentor"
          size="compact"
          accentPalette={MENTEE_ACCENT_COLORS}
        />
      ))
    ) : (
      <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-center">
        <p className="text-sm text-slate-700">No active sessions yet.</p>
        <p className="text-xs text-slate-700 mt-1">
          Once a mentor accepts, your sessions appear here.
        </p>
      </div>
    );

  return (
    <>
      <div className="flex flex-col gap-6 -mt-2">
        {/* ── Welcome + Profile Completion Pill ── */}
        <div className="flex items-center justify-between gap-6 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {isFirstLogin
                ? `Welcome, ${firstName}! 👋`
                : `Welcome , ${firstName}! 👋`}
            </h1>
            <p className="text-sm text-blue-900 mt-1">
              {sessions.length > 0
                ? `You have ${sessions.length} active session${sessionCountSuffix}.`
                : "No active sessions yet. Find a mentor to get started!"}
            </p>
          </div>

          {completionPct < 100 && (
            <button
              type="button"
              className="flex flex-col items-center gap-1 shrink-0 cursor-pointer hover:opacity-80 transition-opacity bg-transparent border-0"
              onClick={() =>
                globalThis.dispatchEvent(
                  new CustomEvent("setDashboardTab", { detail: "profile" }),
                )
              }
              aria-label="Go to profile completion"
            >
              <div className="relative w-9 h-9">
                <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="3"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9"
                    fill="none"
                    stroke="#1e3a5f"
                    strokeWidth="3"
                    strokeDasharray={`${completionPct} ${100 - completionPct}`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-extrabold text-blue-900">
                  {completionPct}%
                </span>
              </div>
              <span className="text-xs font-bold text-blue-900">Profile</span>
            </button>
          )}
        </div>

        {/* ── Recommended Mentors ── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-semibold text-slate-700">
                Recommended Mentors
              </h2>
              {profile?.skills?.[0] && (
                <p className="text-xs text-slate-600 mt-0.5">
                  Based on your skill:{" "}
                  <span className="font-semibold text-blue-900">
                    {profile.skills[0]}
                  </span>
                </p>
              )}
            </div>
            <button
              onClick={() =>
                globalThis.dispatchEvent(
                  new CustomEvent("setDashboardTab", { detail: "findMentors" }),
                )
              }
              className="text-xs text-blue-900 font-medium hover:underline"
            >
              View all
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {loading ? (
              <div className="col-span-1 sm:col-span-2 lg:col-span-4">
                <Loader minHeight={160} />
              </div>
            ) : (
              mentorsContent
            )}
          </div>
        </section>

        {/* ── Active Sessions + Leap Points (side by side) ── */}
        <div className="flex flex-col lg:flex-row gap-4 items-stretch">
          <section className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-slate-700 mb-3">
              Active Sessions
            </h2>
            <div className="flex flex-col gap-2.5">
              {loading ? <Loader minHeight={120} /> : sessionsContent}
            </div>
          </section>

          <div className="w-64 shrink-0">
            <h2 className="text-base font-semibold text-slate-700 mb-3">
              Wallet
            </h2>
            <LeapPointsPanel balance={balance} loading={loading} />
          </div>
        </div>
      </div>

      {selectedMentor && (
        <MentorProfileModal
          mentor={selectedMentor}
          onClose={() => setSelectedMentor(null)}
        />
      )}
      <LeapBuddy role="mentee" user={user} profile={profile} />
    </>
  );
};

SessionCard.propTypes = {
  request: PropTypes.shape({
    _id: PropTypes.string,
    status: PropTypes.string,
    mentor: PropTypes.shape({ name: PropTypes.string }),
    confirmedSlot: PropTypes.shape({
      date: PropTypes.string,
      startTime: PropTypes.string,
      endTime: PropTypes.string,
    }),
    selectedSlots: PropTypes.arrayOf(
      PropTypes.shape({
        date: PropTypes.string,
        startTime: PropTypes.string,
        endTime: PropTypes.string,
      }),
    ),
  }).isRequired,
  index: PropTypes.number.isRequired,
  navigate: PropTypes.func.isRequired,
};

export default HomeTab;
