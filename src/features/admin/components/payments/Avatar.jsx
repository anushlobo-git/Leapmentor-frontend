/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/admin/components/payments/Avatar.jsx
import PropTypes from "prop-types";

const AVATAR_COLORS = ["#2563eb", "#7c3aed", "#0891b2", "#059669", "#d97706"];

const Avatar = ({ name }) => {
  const initials =
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";
  const color = AVATAR_COLORS[initials.codePointAt(0) % AVATAR_COLORS.length];

  return (
    <div
      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-700 text-white"
      style={{ background: color, fontWeight: 700 }}
    >
      {initials}
    </div>
  );
};

Avatar.propTypes = {
  name: PropTypes.string,
};

export default Avatar;
