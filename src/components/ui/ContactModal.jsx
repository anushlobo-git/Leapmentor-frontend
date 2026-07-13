/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { useEffect } from "react";
import PropTypes from "prop-types";

export default function ContactModal({ isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <dialog
      open
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      aria-modal="true"
      aria-labelledby="contact-modal-title"
    >
      <button
        type="button"
        aria-label="Close contact modal"
        onClick={onClose}
        className="absolute inset-0 w-full h-full cursor-default"
        style={{ border: "none", background: "transparent", padding: 0 }}
      />
      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
          width: "100%",
          maxWidth: "420px",
          padding: "32px",
          animation: "modal-in 0.22s ease both",
          textAlign: "center",
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: "52px",
            height: "52px",
            borderRadius: "14px",
            background: "linear-gradient(135deg, #6366f1, #4f46e5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 18px",
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </div>

        <h2
          id="contact-modal-title"
          style={{
            fontSize: "18px",
            fontWeight: "700",
            color: "#0f172a",
            marginBottom: "6px",
          }}
        >
          Contact Us
        </h2>
        <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "20px" }}>
          Have questions? We'd love to hear from you.
        </p>

        <a
          href="https://mail.google.com/mail/?view=cm&to=leapmentor2026@gmail.com"
          target="_blank"
          rel="noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "#f1f5f9",
            border: "1px solid #e2e8f0",
            borderRadius: "10px",
            padding: "12px 20px",
            fontSize: "14px",
            fontWeight: "600",
            color: "#4f46e5",
            textDecoration: "none",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#ede9fe";
            e.currentTarget.style.borderColor = "#a5b4fc";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#f1f5f9";
            e.currentTarget.style.borderColor = "#e2e8f0";
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          leapmentor2026@gmail.com
        </a>

        <div style={{ marginTop: "24px" }}>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "8px 24px",
              fontSize: "13px",
              color: "#64748b",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f8fafc";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "none";
            }}
          >
            Close
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modal-in {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </dialog>
  );
}

ContactModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
