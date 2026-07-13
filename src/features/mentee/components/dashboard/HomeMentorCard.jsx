/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { useState } from "react";
import PropTypes from "prop-types";
import {
  getInitials,
  getAvatarColor,
} from "@features/mentee/hooks/useHomeData";

// ── Mentor Card ───────────────────────────────────────────────
const HomeMentorCard = ({ mentor, onViewProfile }) => {
  const [imgError, setImgError] = useState(false);
  const name = mentor.user?.name || "Mentor";
  const initials = getInitials(name);
  const avatarBg = getAvatarColor(name);
  const skills = mentor.skills?.slice(0, 2) || [];

  return (
    <button
      type="button"
      onClick={() => onViewProfile(mentor)}
      className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer text-left w-full"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {mentor.profilePicture && !imgError ? (
            <img
              src={mentor.profilePicture}
              alt={name}
              onError={() => setImgError(true)}
              className="w-10 h-10 rounded-full object-cover shrink-0"
            />
          ) : (
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${avatarBg}`}
            >
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">
              {name}
            </p>
            <p className="text-xs text-slate-800 truncate">
              {mentor.currentRole}
            </p>
            {mentor.company && (
              <p className="text-xs text-slate-800 truncate">
                @ {mentor.company}
              </p>
            )}
          </div>
        </div>
      </div>

      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {skills.map((skill) => (
            <span
              key={skill}
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full tracking-wide bg-amber-50 text-slate-800 border border-blue-100"
            >
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
    </button>
  );
};

HomeMentorCard.propTypes = {
  mentor: PropTypes.shape({
    _id: PropTypes.string,
    profilePicture: PropTypes.string,
    currentRole: PropTypes.string,
    company: PropTypes.string,
    skills: PropTypes.arrayOf(PropTypes.string),
    avgRating: PropTypes.number,
    user: PropTypes.shape({
      _id: PropTypes.string,
      name: PropTypes.string,
    }),
  }).isRequired,
  onViewProfile: PropTypes.func.isRequired,
};

export default HomeMentorCard;
