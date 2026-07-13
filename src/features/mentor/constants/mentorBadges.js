/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// Shared achievement badge definitions, used by MentorHomeTab and
// MentorProfileModal (mentee-facing mentor profile view).
export const MENTOR_BADGES = [
  {
    key: "newcomer",
    label: "Newcomer",
    icon: "👋",
    desc: "Joined LeapMentor",
    condition: () => true,
  },
  {
    key: "ten_sessions",
    label: "10 Sessions",
    icon: "🎯",
    desc: "Completed 10 sessions",
    condition: (p) => (p?.totalSessions || 0) >= 10,
  },
  {
    key: "top_rated",
    label: "Top Rated",
    icon: "⭐",
    desc: "Achieved 4.5+ rating",
    condition: (p) => (p?.avgRating || 0) >= 4.5,
  },
  {
    key: "expert_guide",
    label: "Expert Guide",
    icon: "🏆",
    desc: "50+ sessions completed",
    condition: (p) => (p?.totalSessions || 0) >= 50,
  },
];
