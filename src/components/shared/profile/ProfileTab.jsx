/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// components/shared/profile/ProfileTab.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import {
  selectDashboardUser,
  selectDashboardProfile,
} from "@store/slices/dashboardUserSlice";

// ── Icons (kept small and local — each used once per card) ─────────
const Icon = {
  camera: (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  ),
  verified: (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  pending: (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  unverified: (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  upload: (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  edit: (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  briefcase: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    </svg>
  ),
  skills: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  prefs: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  globe: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  linkedin: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  ),
  external: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  ),
};

const COMM_EMOJI = {
  "Video Call": "🎥",
  Chat: "💬",
  Email: "✉️",
  "Phone Call": "📞",
  "In-Person": "🤝",
};

// ── Card: header row with an icon chip + title (used by every card below) ──
const CardHeader = ({ icon, title }) => (
  <div className="flex items-center gap-2 mb-4">
    <div className="w-7 h-7 rounded-lg bg-blue-900 flex items-center justify-center shrink-0">
      {icon}
    </div>
    <h3 className="text-sm font-bold text-slate-800">{title}</h3>
  </div>
);
CardHeader.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
};

// ── Hero card: avatar, name, verification (optional), bio, edit button ──
const HeroCard = ({ user, profile, config, onEdit }) => {
  const [imgError, setImgError] = useState(false);
  const navigate = useNavigate();
  const isVerified = profile?.verificationStatus === "verified";
  const isPending = profile?.verificationStatus === "pending";

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-start gap-5">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-20 h-20 rounded-2xl bg-blue-100 overflow-hidden border-2 border-blue-100">
            {profile?.profilePicture && !imgError ? (
              <img
                src={profile.profilePicture}
                alt={user?.name}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-blue-400 text-2xl font-bold">
                {user?.name?.[0]?.toUpperCase() || "M"}
              </div>
            )}
          </div>
          <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-blue-900 rounded-full flex items-center justify-center shadow-sm">
            {Icon.camera}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-bold text-slate-800 leading-tight">
              {user?.name || "—"}
            </h2>

            {config.showVerification && isVerified && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-600 border border-green-200">
                {Icon.verified} Verified
              </span>
            )}
            {config.showVerification && isPending && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-600 border border-yellow-200">
                {Icon.pending} Under Review
              </span>
            )}
            {config.showVerification && !isVerified && !isPending && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                {Icon.unverified} Unverified
              </span>
            )}
          </div>

          <p className="text-sm text-slate-500 mt-0.5">
            {profile?.currentRole || "—"}
            {profile?.company ? ` & ${profile.company}` : ""}
          </p>

          {profile?.bio && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-1">
                Bio
              </p>
              <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                {profile.bio}
              </p>
            </div>
          )}

          <div className="flex items-center gap-2 mt-3">
            {/* Only unverified users need to be pointed at document upload */}
            {config.showVerification && !isVerified && !isPending && (
              <button
                onClick={() => navigate("/verify-documents")}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors"
              >
                {Icon.upload} Upload Verification Documents
              </button>
            )}

            <button
              onClick={onEdit}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-900 text-white hover:bg-blue-700 transition-colors"
            >
              {Icon.edit} Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
HeroCard.propTypes = {
  user: PropTypes.shape({ name: PropTypes.string }),
  profile: PropTypes.object,
  config: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
};

// ── Professional info: two-column label/value grid, fields from config ──
const ProfessionalInfoCard = ({ profile, fields }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
    <CardHeader icon={Icon.briefcase} title="Professional Info" />
    <div className="grid grid-cols-2 gap-4">
      {fields.map(({ key, label, format }) => {
        const raw = profile?.[key];
        const value = format ? format(raw) : raw;
        if (!value) return null; // hides optional fields like hourlyRate/rating cleanly
        return (
          <div key={key}>
            <p className="text-xs text-slate-600 font-medium mb-0.5">{label}</p>
            <p className="text-sm font-semibold text-slate-700">{value}</p>
          </div>
        );
      })}
    </div>
  </div>
);
ProfessionalInfoCard.propTypes = {
  profile: PropTypes.object,
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      label: PropTypes.string,
      format: PropTypes.func,
    }),
  ).isRequired,
};

// ── Tag sections: one or more chip clouds (skills / interested fields) ──
const TagsCard = ({ profile, sections }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
    <CardHeader icon={Icon.skills} title="Skills & Interests" />
    <div className="space-y-5">
      {sections.map(({ key, title, emptyText, chipStyle }, i) => {
        const items = profile?.[key] || [];
        return (
          <div key={key}>
            {i > 0 && <div className="border-t border-slate-100 -mt-2 mb-4" />}
            <p className="text-xs text-slate-500 font-medium mb-2">{title}</p>
            {items.length === 0 ? (
              <p className="text-sm text-slate-400">{emptyText}</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {items.map((item) => (
                  <span
                    key={item}
                    className={
                      chipStyle === "accent"
                        ? "inline-flex items-center text-xs font-semibold bg-blue-50 text-blue-900 px-3 py-1.5 rounded-full border border-blue-100"
                        : "inline-flex items-center text-xs font-semibold text-slate-600 px-3 py-1.5 rounded-full border border-slate-200"
                    }
                  >
                    {item}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  </div>
);
TagsCard.propTypes = {
  profile: PropTypes.object,
  sections: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      title: PropTypes.string,
      emptyText: PropTypes.string,
      chipStyle: PropTypes.string,
    }),
  ).isRequired,
};

// ── Mentorship preferences: comm channels + languages ──
const MentorshipPrefsCard = ({ profile, commLabelMap }) => {
  const commPrefs = profile?.communicationPreferences || [];
  const languages = profile?.languages || [];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <CardHeader icon={Icon.prefs} title="Mentorship Preferences" />
      <div className="space-y-4">
        <div>
          <p className="text-xs text-slate-500 font-medium mb-2">
            Communication Channels
          </p>
          {commPrefs.length === 0 ? (
            <p className="text-sm text-slate-500">—</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {commPrefs.map((pref) => (
                <span
                  key={pref}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-50 text-slate-600 px-3 py-1.5 rounded-xl border border-slate-200"
                >
                  <span>{COMM_EMOJI[pref] || "💬"}</span>
                  {commLabelMap?.[pref] || pref}
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs text-slate-500 font-medium mb-1">Languages</p>
          <p className="text-sm font-semibold text-slate-700">
            {languages.length > 0 ? languages.join(", ") : "—"}
          </p>
        </div>
      </div>
    </div>
  );
};
MentorshipPrefsCard.propTypes = {
  profile: PropTypes.object,
  commLabelMap: PropTypes.object,
};

// ── Social links: portfolio + LinkedIn, same boxed design for both roles ──
const SocialCard = ({ profile }) => {
  const links = [
    {
      key: "portfolioUrl",
      label: "Portfolio",
      icon: Icon.globe,
      strip: /^https?:\/\//,
    },
    {
      key: "linkedInUrl",
      label: "LinkedIn",
      icon: Icon.linkedin,
      strip: /^https?:\/\/(www\.)?linkedin\.com\/in\//,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <CardHeader icon={Icon.globe} title="Social & Web" />
      <div className="space-y-3">
        {links.map(({ key, label, icon, strip }) => {
          const url = profile?.[key];
          return (
            <div
              key={key}
              className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-900 flex items-center justify-center shrink-0">
                {icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-500">{label}</p>
                {url ? (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-slate-700 hover:underline truncate block"
                  >
                    {url.replace(strip, "")}
                  </a>
                ) : (
                  <p className="text-sm text-slate-400">—</p>
                )}
              </div>
              {url && (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-blue-900 shrink-0"
                >
                  {Icon.external}
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
SocialCard.propTypes = { profile: PropTypes.object };

// ── Page ─────────────────────────────────────────────────────────
const ProfileTab = ({ config }) => {
  const navigate = useNavigate();
  const user = useSelector(selectDashboardUser);
  const profile = useSelector(selectDashboardProfile);
  const goToEdit = () => navigate(config.editPath);

  return (
    <div className="space-y-4">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-slate-800">
          {config.dashboardTitle}
        </h1>
        <p className="text-sm text-blue-900 mt-0.5">
          Manage your professional identity and preferences.
        </p>
      </div>

      <HeroCard
        user={user}
        profile={profile}
        config={config}
        onEdit={goToEdit}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ProfessionalInfoCard
          profile={profile}
          fields={config.professionalFields}
        />
        <TagsCard profile={profile} sections={config.tagSections} />
        <MentorshipPrefsCard
          profile={profile}
          commLabelMap={config.commLabelMap}
        />
        <SocialCard profile={profile} />
      </div>

      <div className="pt-2 pb-4">
        <p className="text-xs text-slate-600">
          Last profile update:{" "}
          {profile?.updatedAt
            ? new Date(profile.updatedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "—"}
        </p>
      </div>
    </div>
  );
};
ProfileTab.propTypes = { config: PropTypes.object.isRequired };

export default ProfileTab;
