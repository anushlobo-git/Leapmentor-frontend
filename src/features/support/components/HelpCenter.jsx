/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/support/components/HelpCenter.jsx
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { sendSupportMessage } from "@features/support/api/support.api";
import { mentorFaqs, menteeFaqs } from "@features/support/data/faqs";
import FaqItem from "@features/support/components/FaqItem";
import FormField from "@components/ui/FormField";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const INDIGO = "#4f46e5";
const INDIGO_DARK = "#4338ca";
const INDIGO_LIGHT = "#eef2ff";

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function HelpCenter() {
  const location = useLocation();
  const isMentor = location.pathname.includes("/mentor");

  const role = isMentor ? "mentor" : "mentee";
  const faqs = isMentor ? mentorFaqs : menteeFaqs;

  const [search, setSearch] = useState("");
  const [openFaq, setOpenFaq] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [form, setForm] = useState({ email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const categories = ["All", ...faqs.map((f) => f.category)];

  const filteredFaqs = faqs
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          (activeCategory === "All" || group.category === activeCategory) &&
          (search === "" ||
            item.q.toLowerCase().includes(search.toLowerCase()) ||
            item.a.toLowerCase().includes(search.toLowerCase())),
      ),
    }))
    .filter((g) => g.items.length > 0);

  // handleSubmit becomes:
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    try {
      await sendSupportMessage(form, role);
      setSubmitted(true);
      setForm({ email: "", subject: "", message: "" });
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        fontFamily: "'DM Sans', 'Geist', sans-serif",
        background: "#f8f9fb",
        minHeight: "100vh",
        padding: "32px 24px",
        maxWidth: 900,
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 6,
          }}
        >
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "#0f172a",
              margin: 0,
            }}
          >
            Help Center
          </h1>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              padding: "3px 10px",
              borderRadius: 20,
              background: isMentor ? "#fef3c7" : INDIGO_LIGHT,
              color: isMentor ? "#b45309" : INDIGO,
              textTransform: "capitalize",
            }}
          >
            {role}
          </span>
        </div>
        <p style={{ color: "#64748b", fontSize: 15, margin: 0 }}>
          {isMentor
            ? "Resources and support for managing your sessions, earnings, and profile."
            : "Find answers about booking sessions, payments, and getting the most from your mentor."}
        </p>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 32 }}>
        <span
          style={{
            position: "absolute",
            left: 14,
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: 18,
            color: "#94a3b8",
            pointerEvents: "none",
          }}
        >
          🔍
        </span>
        <FormField
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setActiveCategory("All");
          }}
          placeholder={`Search ${role} FAQs...`}
          style={{
            width: "100%",
            padding: "13px 16px 13px 44px",
            fontSize: 15,
            borderRadius: 12,
            background: "#fff",
            boxSizing: "border-box",
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          }}
        />
      </div>

      {/* FAQ */}
      <div style={{ marginBottom: 40 }}>
        <h2
          style={{
            fontSize: 17,
            fontWeight: 600,
            color: "#0f172a",
            marginBottom: 16,
          }}
        >
          Frequently Asked Questions
        </h2>

        {/* Category Tabs */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 20,
            flexWrap: "wrap",
          }}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: "6px 16px",
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                border: "1.5px solid",
                borderColor: activeCategory === cat ? INDIGO : "#e2e8f0",
                background: activeCategory === cat ? INDIGO : "#fff",
                color: activeCategory === cat ? "#fff" : "#64748b",
                transition: "all 0.15s",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {filteredFaqs.length === 0 ? (
          <div
            style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}
          >
            <div style={{ fontSize: 32 }}>🔍</div>
            <p style={{ marginTop: 10 }}>
              No results for "{search}". Try different keywords.
            </p>
          </div>
        ) : (
          filteredFaqs.map((group) => {
            const groupKey = group.category;
            return (
              <div key={groupKey} style={{ marginBottom: 24 }}>
                {activeCategory === "All" && (
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#94a3b8",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      marginBottom: 10,
                    }}
                  >
                    {group.category}
                  </div>
                )}
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {group.items.map((item) => {
                    const key = `${groupKey}-${item.q}`;
                    return (
                      <FaqItem
                        key={key}
                        item={item}
                        isOpen={openFaq === key}
                        onToggle={() =>
                          setOpenFaq(openFaq === key ? null : key)
                        }
                      />
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Contact Support */}
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          border: "1.5px solid #e2e8f0",
          padding: "28px",
        }}
      >
        <h2
          style={{
            fontSize: 17,
            fontWeight: 600,
            color: "#0f172a",
            margin: "0 0 4px",
          }}
        >
          Still need help?
        </h2>
        <p style={{ color: "#64748b", fontSize: 14, marginBottom: 20 }}>
          Send us a message and we'll get back to you within 24 hours.
        </p>

        {submitted ? (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div style={{ fontSize: 36 }}>✅</div>
            <p style={{ fontWeight: 600, color: "#0f172a", marginTop: 10 }}>
              Message sent!
            </p>
            <p style={{ color: "#64748b", fontSize: 14 }}>
              We'll reply to your email within 24 hours.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              style={{
                marginTop: 16,
                padding: "8px 20px",
                borderRadius: 8,
                background: INDIGO,
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              Send another
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >
            <FormField
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Your email address"
            />
            <FormField
              required
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="Subject"
            />
            <FormField
              as="textarea"
              required
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Describe your issue..."
              rows={4}
              style={{ resize: "vertical" }}
            />
            {submitError && (
              <p style={{ color: "#ef4444", fontSize: 13, margin: 0 }}>
                {submitError}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "12px 24px",
                background: submitting ? "#a5b4fc" : INDIGO,
                color: "#fff",
                border: "none",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: submitting ? "not-allowed" : "pointer",
                alignSelf: "flex-start",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!submitting) e.currentTarget.style.background = INDIGO_DARK;
              }}
              onMouseLeave={(e) => {
                if (!submitting) e.currentTarget.style.background = INDIGO;
              }}
            >
              {submitting ? "Sending..." : "Send Message"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
