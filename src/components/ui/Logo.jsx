/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import PropTypes from "prop-types";
import { IMAGES } from "@constants/images";
export default function Logo({ onClick,variant="dark" }) {

  // "dark" variant gets dark text (gray-900), "light" variant gets white text
  const textColor = variant === "light" ? "text-white" : "text-gray-900";
  return (
    <div
      className="flex items-center gap-2 cursor-pointer"
      onClick={onClick}
    >
      <img
        src={IMAGES.LOGO}
        alt="LeapMentor logo"
        className="h-8 w-8"
        width={32}
        height={32}
      />
      <span className={`text-xl font-bold tracking-tight ${textColor}`}>
        LeapMentor
      </span>
    </div>
  );
}
Logo.propTypes = {
  onClick: PropTypes.func.isRequired,
  variant: PropTypes.string,
};
