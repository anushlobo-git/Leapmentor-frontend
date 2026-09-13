/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// components/shared/profile/profileConfig.js
//
// Single source of truth for everything that differs between the mentor
// and mentee profile tab. The shared <ProfileTab config={...} /> component
// never branches on role directly — it only reads these fields.

export const mentorProfileConfig = {
  role: "mentor",
  dashboardTitle: "Mentor Dashboard",
  editPath: "/dashboard/mentor/edit-profile",

  // Mentors go through document verification; mentees don't.
  showVerification: true,

  // Rendered as a two-column grid of label/value pairs. `format` receives
  // the raw profile value and returns the display string, or null/undefined
  // to hide the field entirely (e.g. hourlyRate when not yet set).
  professionalFields: [
    { key: "currentRole", label: "Current Role" },
    { key: "industry", label: "Industry" },
    { key: "company", label: "Company" },
    {
      key: "yearsOfExperience",
      label: "Experience",
      format: (v) => (v ? `${v}+ Years` : null),
    },
    {
      key: "hourlyRate",
      label: "Session Rate",
      format: (v) => (v > 0 ? `LP ${v}/hr` : null),
    },
    {
      key: "avgRating",
      label: "Rating",
      format: (v) => (v > 0 ? `⭐ ${v.toFixed(1)} / 5` : null),
    },
  ],

  // One or more tag-cloud sections (mentee has two: interested fields +
  // skills; mentor has just one).
  tagSections: [
    {
      key: "skills",
      title: "Skills & Expertise",
      emptyText: "No skills added yet.",
      chipStyle: "accent",
    },
  ],

  // Optional friendlier labels for communication preferences. Mentor has
  // none — plain labels are used as-is.
  commLabelMap: null,
};

export const menteeProfileConfig = {
  role: "mentee",
  dashboardTitle: "Mentee Dashboard",
  editPath: "/dashboard/mentee/edit-profile",

  showVerification: false,

  professionalFields: [
    { key: "currentRole", label: "Current Role" },
    {
      key: "yearsOfExperience",
      label: "Experience",
      format: (v) => (v ? `${v} Years` : null),
    },
    { key: "company", label: "Company" },
    { key: "industry", label: "Industry" },
  ],

  tagSections: [
    {
      key: "interestedFields",
      title: "Interested Fields",
      emptyText: "No fields added yet.",
      chipStyle: "plain",
    },
    {
      key: "skills",
      title: "Top Skills",
      emptyText: "No skills added yet.",
      chipStyle: "plain",
    },
  ],

  commLabelMap: {
    Chat: "Instant Messaging / Chat",
    "Video Call": "Video Conferences",
    Email: "Email Correspondence",
  },
};
