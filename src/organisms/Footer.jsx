/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "@atoms/Logo";
import ContactModal from "@molecules/ContactModal";

// TermsAndConditionsModal is intentionally NOT here.
// It belongs in RegisterMentor + RegisterMentee pages only,
// where users actually need to accept terms during signup.

const footerLinks = {
  "For Mentees": ["Find a Mentor"],
  "For Mentors": ["Become a Mentor"],
  Company: ["Contact"],
};

export default function Footer() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const navigate = useNavigate();

  const handleLinkClick = (link) => {
    if (link === "Find a Mentor") return navigate("/register");
    if (link === "Become a Mentor") return navigate("/register");
    if (link === "Contact") return setIsContactOpen(true);
  };

  return (
    <>
      <footer
        style={{
          background: "linear-gradient(135deg, #0d1117 0%, #0f1923 50%, #0d1117 100%)",
          position: "relative",
          overflow: "hidden",
        }}
        className="text-gray-300 pt-8 pb-5 px-6"
      >
        {/* Glow accents */}
        <div style={{ position: "absolute", top: "-80px", left: "20%", width: "400px", height: "300px", background: "radial-gradient(ellipse, rgba(99,102,241,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "0", right: "10%", width: "300px", height: "200px", background: "radial-gradient(ellipse, rgba(59,130,246,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div className="max-w-6xl mx-auto" style={{ position: "relative", zIndex: 1 }}>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-6">

            {/* Brand */}
            <div className="col-span-1">
              <div className="mb-2">
                <Logo variant="light" />
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                The world's leading mentorship platform for professional career growth and leadership development.
              </p>
            </div>

            {/* Link Columns */}
            {Object.entries(footerLinks).map(([heading, links]) => (
              <div key={heading}>
                <h4 style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "#6366f1", marginBottom: "14px" }}>
                  {heading}
                </h4>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link}>
                      <button
                        onClick={() => handleLinkClick(link)}
                        style={{ background: "none", border: "none", padding: 0, fontSize: "14px", color: "#9ca3af", cursor: "pointer", transition: "color 0.2s ease" }}
                        onMouseEnter={e => { e.currentTarget.style.color = "#fff"; }}
                        onMouseLeave={e => { e.currentTarget.style.color = "#9ca3af"; }}
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

          </div>

          {/* Bottom bar */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "24px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ color: "#4b5563", fontSize: "12px" }}>
              © 2026 LeapMentor Inc. All rights reserved.
            </p>
          </div>

        </div>
      </footer>

      {/* Contact Modal */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />
    </>
  );
}