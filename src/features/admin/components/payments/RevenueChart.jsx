/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/admin/components/payments/RevenueChart.jsx
import { useState } from "react";
import PropTypes from "prop-types";
import { MONO } from "@features/admin/constants/payments.constants";

const PAD_LEFT = 45;
const W = 700;
const H = 180;
const CHART_W = W - PAD_LEFT;
const Y_TICKS = [0, 0.25, 0.5, 0.75, 1];

const fmtVal = (v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v));

const RevenueChart = ({ data = [], loading }) => {
  const [hovered, setHovered] = useState(null);

  if (loading)
    return (
      <div
        className="h-44 rounded-2xl animate-pulse"
        style={{ background: "#f1f5f9" }}
      />
    );
  if (!data.length) return null;

  const values = data.map((d) => d.amount);
  const min = Math.min(...values);
  const max = Math.max(...values) || 1;
  const range = max - min || 1;

  const xs = data.map((_, i) => PAD_LEFT + (i / (data.length - 1)) * CHART_W);
  const ys = values.map((v) => H - ((v - min) / range) * (H * 0.72) - H * 0.1);

  let line = `M ${xs[0]} ${ys[0]}`;
  for (let i = 0; i < data.length - 1; i++) {
    const cpx1 = xs[i] + (xs[i + 1] - xs[i]) / 3;
    const cpx2 = xs[i + 1] - (xs[i + 1] - xs[i]) / 3;
    line += ` C ${cpx1} ${ys[i]}, ${cpx2} ${ys[i + 1]}, ${xs[i + 1]} ${ys[i + 1]}`;
  }
  const area = `${line} L ${xs.at(-1)} ${H} L ${xs[0]} ${H} Z`;

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", height: 200 }}
        onMouseLeave={() => setHovered(null)}
      >
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.13" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {Y_TICKS.filter((t) => t > 0 && t < 1).map((t) => (
          <line
            key={t}
            x1={PAD_LEFT}
            y1={H * t}
            x2={W}
            y2={H * t}
            stroke="#e8eaf0"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        ))}

        {/* Y-axis labels */}
        {Y_TICKS.map((t) => {
          const value = Math.round(min + (max - min) * (1 - t));
          const y = Math.max(8, Math.min(H - 4, H * t));
          return (
            <text
              key={t}
              x={PAD_LEFT - 6}
              y={y}
              fill="#94a3b8"
              fontSize="9"
              fontFamily={MONO}
              textAnchor="end"
              dominantBaseline="middle"
            >
              {fmtVal(value)}
            </text>
          );
        })}

        {/* Y-axis line */}
        <line
          x1={PAD_LEFT}
          y1={0}
          x2={PAD_LEFT}
          y2={H}
          stroke="#e8eaf0"
          strokeWidth="1"
        />

        {/* Area + Line */}
        <path d={area} fill="url(#revGrad)" />
        <path
          d={line}
          fill="none"
          stroke="#2563eb"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Hover */}
        {xs.map((x, i) => (
          <g key={data[i]?.label ?? x}>
            <rect
              x={x - 14}
              y={0}
              width={28}
              height={H}
              fill="transparent"
              onMouseEnter={() => setHovered(i)}
            />
            {hovered === i && (
              <>
                <line
                  x1={x}
                  y1={0}
                  x2={x}
                  y2={H}
                  stroke="#2563eb"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  opacity="0.4"
                />
                <circle
                  cx={x}
                  cy={ys[i]}
                  r="5"
                  fill="#2563eb"
                  stroke="white"
                  strokeWidth="2"
                />
                <g
                  transform={`translate(${Math.min(x - 35, W - 90)}, ${Math.max(ys[i] - 42, 4)})`}
                >
                  <rect
                    x="0"
                    y="0"
                    width="84"
                    height="32"
                    rx="6"
                    fill="#1e293b"
                  />
                  <text
                    x="9"
                    y="13"
                    fill="#94a3b8"
                    fontSize="9"
                    fontFamily={MONO}
                  >
                    {data[i]?.label}
                  </text>
                  <text
                    x="9"
                    y="26"
                    fill="#60a5fa"
                    fontSize="11"
                    fontFamily={MONO}
                    fontWeight="600"
                  >
                    {values[i].toLocaleString()} LP
                  </text>
                </g>
              </>
            )}
          </g>
        ))}

        {/* X-axis labels */}
        {xs.map((x, i) => (
          <text
            key={data[i]?.label ?? x}
            x={x}
            y={H + 14}
            fill="#94a3b8"
            fontSize="9"
            fontFamily={MONO}
            textAnchor="middle"
          >
            {data[i]?.label}
          </text>
        ))}
      </svg>
    </div>
  );
};

RevenueChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      amount: PropTypes.number.isRequired,
      label: PropTypes.string,
    }),
  ),
  loading: PropTypes.bool.isRequired,
};

export default RevenueChart;
