/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/components/admin/common/StatCard.jsx
import PropTypes from "prop-types";

const StatCard = ({ label, value, sub, icon, accent = "#2563eb", trend }) => (
  <div className="rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden"
    style={{ background: "#ffffff", border: "1px solid #e8eaf0" }}>

    {/* Subtle accent glow top-right */}
    <div className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none"
      style={{ background: `radial-gradient(circle at top right, ${accent}12, transparent 70%)` }} />

    <div className="flex items-center justify-between">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${accent}14` }}>
        <span style={{ color: accent }}>{icon}</span>
      </div>
      {trend !== undefined && (
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg"
          style={{ background: trend >= 0 ? "#f0fdf4" : "#fef2f2" }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
            stroke={trend >= 0 ? "#16a34a" : "#dc2626"} strokeWidth="2.5" strokeLinecap="round">
            {trend >= 0
              ? <><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></>
              : <><line x1="7" y1="7" x2="17" y2="17"/><polyline points="17 7 17 17 7 17"/></>
            }
          </svg>
          <span className="text-[10px] font-700"
            style={{ color: trend >= 0 ? "#16a34a" : "#dc2626", fontWeight: 700 }}>
            {Math.abs(trend)}%
          </span>
        </div>
      )}
    </div>

    <div>
      <p className="text-2xl font-700 text-slate-800 leading-none" style={{ fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>
        {value?.toLocaleString() ?? "—"}
      </p>
      <p className="text-xs font-500 text-slate-700 mt-1" style={{ fontWeight: 500 }}>{label}</p>
      {sub && <p className="text-[10px] text-slate-500 mt-0.5">{sub}</p>}
    </div>
  </div>
);

StatCard.propTypes = {
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  value: PropTypes.object.isRequired,
  sub: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.node.isRequired,
  accent: PropTypes.string,
  trend: PropTypes.any.isRequired,
};

export default StatCard;
