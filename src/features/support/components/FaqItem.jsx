/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/support/components/FaqItem.jsx

import PropTypes from "prop-types";

const INDIGO = "#4f46e5";
const INDIGO_BORDER = "#c7d2fe";

export default function FaqItem({ item, isOpen, onToggle }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        border: `1.5px solid ${isOpen ? INDIGO_BORDER : "#e2e8f0"}`,
        overflow: "hidden",
        transition: "border-color 0.2s",
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 18px",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          gap: 12,
        }}
      >
        <span
          style={{
            fontWeight: 500,
            fontSize: 14,
            color: "#0f172a",
            lineHeight: 1.4,
          }}
        >
          {item.q}
        </span>
        <span
          style={{
            fontSize: 16,
            color: INDIGO,
            flexShrink: 0,
            display: "inline-block",
            transition: "transform 0.2s",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          ▾
        </span>
      </button>
      {isOpen && (
        <div
          style={{
            padding: "0 18px 16px",
            color: "#475569",
            fontSize: 14,
            lineHeight: 1.7,
            borderTop: "1px solid #f1f5f9",
          }}
        >
          <div style={{ paddingTop: 12 }}>{item.a}</div>
        </div>
      )}
    </div>
  );
}

FaqItem.propTypes = {
  item: PropTypes.shape({ a: PropTypes.any, q: PropTypes.any }).isRequired,
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};
