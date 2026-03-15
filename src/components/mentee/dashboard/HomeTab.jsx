// src/components/mentee/dashboard/HomeTab.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import MentorProfileModal from "./findMentors/MentorProfileModal";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

// ── Internal hook — fetches recommended mentors + upcoming sessions ──
const useHomeData = (profile) => {
  const [mentors,   setMentors]   = useState([]);
  const [sessions,  setSessions]  = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);

        // ── Recommended mentors ──────────────────────────────
        // Use first skill or first interestedField as search term
        // Falls back to top-rated if no skills set
        const skillTerm =
          profile?.skills?.[0] ||
          profile?.interestedFields?.[0] ||
          "";

        const mentorRes = await axios.get(`${BASE_URL}/api/mentors/search`, {
          params:  { skill: skillTerm, limit: 2 },
          headers: authHeader(),
        });
        setMentors(mentorRes.data.mentors || []);

        // ── Upcoming sessions ────────────────────────────────
        // Fetch all requests and filter for accepted + ongoing
        const sessionRes = await axios.get(
          `${BASE_URL}/api/connect-requests/my-requests`,
          { headers: authHeader() }
        );
        const allRequests = sessionRes.data.requests || [];
        const upcoming = allRequests.filter(
          (r) => r.status === "accepted" || r.status === "ongoing"
        );
        setSessions(upcoming);
      } catch (err) {
        console.error("HomeTab data fetch error:", err.message);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch once profile is available
    if (profile !== null) fetchAll();
  }, [profile]);

  return { mentors, sessions, loading };
};

// ── Helpers ───────────────────────────────────────────────────
const getInitials = (name = "") =>
  name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

const AVATAR_COLORS = [
  "bg-rose-100 text-rose-600",
  "bg-blue-100 text-blue-600",
  "bg-violet-100 text-violet-600",
  "bg-emerald-100 text-emerald-600",
  "bg-amber-100 text-amber-600",
];
const getAvatarColor = (name = "") =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const formatSlotDate = (slot) => {
  if (!slot?.date) return "";
  return new Date(slot.date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  });
};

const formatSlotTime = (slot) => {
  if (!slot?.startTime || !slot?.endTime) return "";
  const fmt = (t) => {
    const [h, m] = t.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    return `${hour % 12 || 12}:${m} ${ampm}`;
  };
  return `${fmt(slot.startTime)} – ${fmt(slot.endTime)}`;
};

const ACCENT_COLORS = ["bg-blue-500", "bg-violet-500", "bg-emerald-500", "bg-orange-500"];
const getAccent = (idx) => ACCENT_COLORS[idx % ACCENT_COLORS.length];

const calculateProfileCompletion = (profile) => {
  if (!profile) return 0;
  const fields = [
    profile.profilePicture,
    profile.bio,
    profile.currentRole,
    profile.company,
    profile.industry,
    profile.yearsOfExperience,
    profile.interestedFields?.length > 0,
    profile.skills?.length > 0,
    profile.communicationPreferences?.length > 0,
    profile.languages?.length > 0,
    profile.linkedInUrl,
    profile.portfolioUrl,
  ];
  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
};

// ── Mentor Card ───────────────────────────────────────────────
const MentorCard = ({ mentor, onViewProfile }) => {
  const [bookmarked, setBookmarked] = useState(false);
  const name     = mentor.user?.name || "Mentor";
  const initials = getInitials(name);
  const avatarBg = getAvatarColor(name);
  const skills   = mentor.skills?.slice(0, 2) || [];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {mentor.profilePicture ? (
            <img
              src={mentor.profilePicture}
              alt={name}
              className="w-10 h-10 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${avatarBg}`}>
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{name}</p>
            <p className="text-xs text-slate-500 truncate">{mentor.currentRole}</p>
            {mentor.company && (
              <p className="text-xs text-slate-400 truncate">@ {mentor.company}</p>
            )}
          </div>
        </div>
        <button
          onClick={() => setBookmarked(!bookmarked)}
          className="text-slate-300 hover:text-blue-500 transition-colors mt-1 shrink-0"
        >
          <svg width="16" height="16" viewBox="0 0 24 24"
            fill={bookmarked ? "currentColor" : "none"}
            stroke="currentColor" strokeWidth="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      </div>

      {/* Skills as tags */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {skills.map((skill) => (
            <span key={skill}
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full tracking-wide bg-blue-50 text-blue-600 border border-blue-100">
              {skill.toUpperCase()}
            </span>
          ))}
          {mentor.avgRating > 0 && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100">
              ⭐ {mentor.avgRating.toFixed(1)}
            </span>
          )}
        </div>
      )}

      <button
        onClick={() => onViewProfile(mentor)}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 rounded-xl transition-colors"
      >
        View Profile
      </button>
    </div>
  );
};

// ── Mentor Card Skeleton ──────────────────────────────────────
const MentorCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col gap-3 shadow-sm animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 bg-slate-200 rounded w-3/4" />
        <div className="h-2.5 bg-slate-100 rounded w-1/2" />
      </div>
    </div>
    <div className="flex gap-1.5">
      <div className="h-5 w-16 bg-slate-100 rounded-full" />
      <div className="h-5 w-12 bg-slate-100 rounded-full" />
    </div>
    <div className="h-8 bg-slate-200 rounded-xl" />
  </div>
);

// ── Session Card ──────────────────────────────────────────────
const SessionCard = ({ request, index, navigate }) => {
  const slot      = request.confirmedSlot || request.selectedSlots?.[0];
  const dateObj   = slot?.date ? new Date(slot.date + "T00:00:00") : null;
  const dateNum   = dateObj ? dateObj.getDate().toString() : "—";
  const dateMonth = dateObj
    ? dateObj.toLocaleDateString("en-US", { month: "short" }).toUpperCase()
    : "—";
  const mentorName = request.mentor?.name || "Mentor";
  const timeStr    = formatSlotTime(slot);
  const isOngoing  = request.status === "ongoing";

  const handleJoin = () => {
    if (isOngoing) {
      navigate(`/shared-dashboard/${request._id}`);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 px-4 py-3 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-10 h-12 rounded-xl flex flex-col items-center justify-center text-white ${getAccent(index)} shrink-0`}>
        <span className="text-[9px] font-bold tracking-widest">{dateMonth}</span>
        <span className="text-lg font-bold leading-none">{dateNum}</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-slate-800 truncate">
            Session with {mentorName}
          </p>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0
            ${isOngoing
              ? "bg-blue-50 text-blue-600 border border-blue-100"
              : "bg-emerald-50 text-emerald-600 border border-emerald-100"}`}>
            {isOngoing ? "Ongoing" : "Accepted"}
          </span>
        </div>
        <p className="text-xs text-slate-400 truncate mt-0.5">
          {timeStr ? `${timeStr}` : "Time TBD"}
          {slot?.date ? ` · ${formatSlotDate(slot)}` : ""}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 shrink-0">
        {isOngoing ? (
          <button
            onClick={handleJoin}
            className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-semibold transition-colors"
          >
            Open Dashboard
          </button>
        ) : (
          <span className="text-xs text-slate-400 border border-slate-200 px-3 py-1.5 rounded-lg font-medium">
            Awaiting Payment
          </span>
        )}
      </div>
    </div>
  );
};

// ── Session Skeleton ──────────────────────────────────────────
const SessionSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-100 px-4 py-3 flex items-center gap-3 shadow-sm animate-pulse">
    <div className="w-10 h-12 rounded-xl bg-slate-200 shrink-0" />
    <div className="flex-1 space-y-1.5">
      <div className="h-3 bg-slate-200 rounded w-3/5" />
      <div className="h-2.5 bg-slate-100 rounded w-2/5" />
    </div>
    <div className="h-8 w-24 bg-slate-200 rounded-lg" />
  </div>
);

// ── Main HomeTab ──────────────────────────────────────────────
const HomeTab = ({ user, profile }) => {
  const navigate          = useNavigate();
  const firstName         = user?.name?.split(" ")[0] || "there";
  const isFirstLogin      = user?.isFirstLogin ?? false;
  const profileCompletion = calculateProfileCompletion(profile);
  const [selectedMentor,  setSelectedMentor] = useState(null);

  const { mentors, sessions, loading } = useHomeData(profile);

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-6">

        {/* ── Main Content ── */}
        <div className="flex-1 min-w-0 flex flex-col gap-6">

          {/* Welcome */}
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {isFirstLogin ? `Welcome, ${firstName}! 👋` : `Welcome back, ${firstName}! 👋`}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {sessions.length > 0
                ? `You have ${sessions.length} active session${sessions.length > 1 ? "s" : ""}.`
                : "No active sessions yet. Find a mentor to get started!"}
            </p>
          </div>

          {/* Recommended Mentors */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-semibold text-slate-700">Recommended Mentors</h2>
                {profile?.skills?.[0] && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    Based on your skill: <span className="font-semibold text-blue-600">{profile.skills[0]}</span>
                  </p>
                )}
              </div>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("setDashboardTab", { detail: "findMentors" }))}
                className="text-xs text-blue-600 font-medium hover:underline"
              >
                View all
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {loading ? (
                <>
                  <MentorCardSkeleton />
                  <MentorCardSkeleton />
                </>
              ) : mentors.length > 0 ? (
                mentors.map((mentor) => (
                  <MentorCard
                    key={mentor._id || mentor.user?._id}
                    mentor={mentor}
                    onViewProfile={setSelectedMentor}
                  />
                ))
              ) : (
                <div className="col-span-2 bg-slate-50 border border-dashed border-slate-200
                  rounded-2xl p-8 text-center">
                  <p className="text-sm text-slate-500">No mentor recommendations yet.</p>
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent("setDashboardTab", { detail: "findMentors" }))}
                    className="text-xs text-blue-600 font-semibold mt-2 hover:underline"
                  >
                    Browse all mentors →
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Upcoming / Active Sessions */}
          <section>
            <h2 className="text-base font-semibold text-slate-700 mb-3">
              Active Sessions
            </h2>
            <div className="flex flex-col gap-3">
              {loading ? (
                <>
                  <SessionSkeleton />
                  <SessionSkeleton />
                </>
              ) : sessions.length > 0 ? (
                sessions.map((request, idx) => (
                  <SessionCard
                    key={request._id}
                    request={request}
                    index={idx}
                    navigate={navigate}
                  />
                ))
              ) : (
                <div className="bg-slate-50 border border-dashed border-slate-200
                  rounded-2xl p-8 text-center">
                  <p className="text-sm text-slate-500">No active sessions yet.</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Once a mentor accepts and you make payment, your sessions appear here.
                  </p>
                </div>
              )}
            </div>
          </section>

        </div>

        {/* ── Right Panel ── */}
        <aside className="w-full lg:w-60 lg:shrink-0 flex flex-col gap-4">

          {/* Profile completion */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-slate-700">Complete Profile</p>
              <span className="text-sm font-bold text-blue-600">{profileCompletion}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mb-4">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>

            <p className="text-[10px] font-semibold text-slate-400 tracking-widest uppercase mb-2">
              Fields of Interest
            </p>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {profile?.interestedFields?.length > 0 ? (
                profile.interestedFields.map((field) => (
                  <span key={field}
                    className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                    {field}
                  </span>
                ))
              ) : (
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent("setDashboardTab", { detail: "profile" }))}
                  className="text-xs text-blue-600 font-semibold hover:underline"
                >
                  Add interests →
                </button>
              )}
            </div>

            <p className="text-[10px] font-semibold text-slate-400 tracking-widest uppercase mb-2">
              Skills to Learn
            </p>
            <div className="flex flex-wrap gap-1.5">
              {profile?.skills?.length > 0 ? (
                profile.skills.map((skill) => (
                  <span key={skill}
                    className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {skill}
                  </span>
                ))
              ) : (
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent("setDashboardTab", { detail: "profile" }))}
                  className="text-xs text-blue-600 font-semibold hover:underline"
                >
                  Add skills →
                </button>
              )}
            </div>
          </div>

          {/* Career Insight */}
          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="#f97316" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p className="text-xs font-semibold text-orange-600">Career Insight</p>
            </div>
            <p className="text-xs text-slate-600">
              Explore trending skills in your field and stay ahead in your career journey.
            </p>
          </div>

        </aside>
      </div>

      {selectedMentor && (
        <MentorProfileModal
          mentor={selectedMentor}
          onClose={() => setSelectedMentor(null)}
        />
      )}
    </>
  );
};

export default HomeTab;