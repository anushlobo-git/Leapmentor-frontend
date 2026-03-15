// src/components/admin/common/UserGrowthChart.jsx
import { useMemo, useState } from "react";

// Generates a smooth SVG path from data points
const smoothPath = (points, w, h, min, max) => {
  if (points.length < 2) return "";
  const range = max - min || 1;
  const xs = points.map((_, i) => (i / (points.length - 1)) * w);
  const ys = points.map((v) => h - ((v - min) / range) * (h * 0.8) - h * 0.1);

  let d = `M ${xs[0]} ${ys[0]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const cpx1 = xs[i] + (xs[i + 1] - xs[i]) / 3;
    const cpx2 = xs[i + 1] - (xs[i + 1] - xs[i]) / 3;
    d += ` C ${cpx1} ${ys[i]}, ${cpx2} ${ys[i + 1]}, ${xs[i + 1]} ${ys[i + 1]}`;
  }
  return { line: d, xs, ys };
};

const RANGES = ["7D", "30D", "90D"];

const UserGrowthChart = ({ data = [] }) => {
  const [range, setRange] = useState("30D");
  const [hovered, setHovered] = useState(null);

  const W = 700, H = 160;

  // Slice data by range
  const sliced = useMemo(() => {
    const n = range === "7D" ? 7 : range === "30D" ? 30 : 90;
    return data.length ? data.slice(-n) : generateMockData(n);
  }, [data, range]);

  const values  = sliced.map((d) => d.count);
  const min     = Math.min(...values);
  const max     = Math.max(...values);
  const result  = smoothPath(values, W, H, min, max);

  if (!result) return null;
  const { line, xs, ys } = result;

  // Area fill path
  const area = `${line} L ${xs[xs.length - 1]} ${H} L ${xs[0]} ${H} Z`;

  return (
    <div className="rounded-2xl p-6" style={{ background: "#ffffff", border: "1px solid #e8eaf0" }}>

      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-700 text-slate-800" style={{ fontWeight: 700 }}>User Growth</h3>
          <p className="text-xs text-slate-400 mt-0.5">New registrations over time</p>
        </div>
        <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "#f1f5f9" }}>
          {RANGES.map((r) => (
            <button key={r} onClick={() => setRange(r)}
              className="px-3 py-1.5 rounded-lg text-xs font-600 transition-all"
              style={{
                fontWeight: 600,
                background: range === r ? "#ffffff" : "transparent",
                color:      range === r ? "#1e40af" : "#94a3b8",
                boxShadow:  range === r ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              }}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative" style={{ overflowX: "auto" }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 160 }}
          onMouseLeave={() => setHovered(null)}>

          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#2563eb" stopOpacity="0.15"/>
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0"/>
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((t, i) => (
            <line key={i}
              x1={0} y1={H * t} x2={W} y2={H * t}
              stroke="#e8eaf0" strokeWidth="1" strokeDasharray="4 4"/>
          ))}

          {/* Area fill */}
          <path d={area} fill="url(#areaGrad)"/>

          {/* Line */}
          <path d={line} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>

          {/* Hover points */}
          {xs.map((x, i) => (
            <g key={i}>
              <rect
                x={x - 10} y={0} width={20} height={H}
                fill="transparent"
                onMouseEnter={() => setHovered(i)}
              />
              {hovered === i && (
                <>
                  <line x1={x} y1={0} x2={x} y2={H} stroke="#2563eb" strokeWidth="1" strokeDasharray="3 3" opacity="0.5"/>
                  <circle cx={x} cy={ys[i]} r="5" fill="#2563eb" stroke="white" strokeWidth="2"/>
                  {/* Tooltip */}
                  <g transform={`translate(${Math.min(x, W - 80)}, ${Math.max(ys[i] - 36, 4)})`}>
                    <rect x="0" y="0" width="75" height="28" rx="6" fill="#1e293b"/>
                    <text x="8" y="11" fill="white" fontSize="9" fontFamily="DM Mono, monospace" fontWeight="500">
                      {sliced[i]?.label || `Day ${i + 1}`}
                    </text>
                    <text x="8" y="22" fill="#93c5fd" fontSize="10" fontFamily="DM Mono, monospace" fontWeight="500">
                      {values[i]} users
                    </text>
                  </g>
                </>
              )}
            </g>
          ))}
        </svg>
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between mt-2 px-1">
        {sliced
          .filter((_, i) => i % Math.ceil(sliced.length / 6) === 0 || i === sliced.length - 1)
          .map((d, i) => (
            <span key={i} className="text-[10px] text-slate-400" style={{ fontFamily: "'DM Mono', monospace" }}>
              {d.label}
            </span>
          ))}
      </div>
    </div>
  );
};

// Mock data generator for when real data isn't available yet
const generateMockData = (n) => {
  const result = [];
  let val = 40;
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    val = Math.max(5, val + Math.floor((Math.random() - 0.4) * 15));
    result.push({
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      count: val,
    });
  }
  return result;
};

export default UserGrowthChart;