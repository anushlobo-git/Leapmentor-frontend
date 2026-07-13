/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import PropTypes from "prop-types";

// components/mentee/dashboard/ComingSoon.jsx
const ComingSoon = ({ icon, title, desc }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
    <span className="text-5xl">{icon}</span>
    <h3 className="text-lg font-bold text-slate-700">{title}</h3>
    <p className="text-sm text-slate-400 max-w-xs leading-relaxed">{desc}</p>
    <span className="mt-2 inline-flex items-center gap-1.5 bg-blue-50 text-blue-500 text-xs font-semibold px-3 py-1 rounded-full">
      <span aria-hidden="true" className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
      <span>Coming soon</span>
    </span>
  </div>
);
ComingSoon.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  desc: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default ComingSoon;
