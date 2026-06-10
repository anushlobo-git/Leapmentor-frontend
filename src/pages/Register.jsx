// src/pages/Register.jsx
import { useState } from "react";
import AuthLeftPanel from "../components/auth/AuthLeftPanel";
import RegisterForm from "../components/auth/RegisterForm";
import { LeapMentorLogo } from "../components/auth/AuthIcons";
import { AuthBrand } from "../components/auth/AuthUI";

const MENTEE_PANEL = {
  imageSrc: "/images/mentor-bg.jpg",
  imageAlt: "Mentees learning",
  badge: "🚀 Start your growth journey today",
  heading: <>Find the mentor who<br />unlocks your potential.</>,
  subtext: <>Connect with world-class mentors and accelerate<br />your career like never before.</>,
  stats: [
    { num: "50K+", label: "Mentees" },
    { num: "200+", label: "Skills" },
    { num: "4.9★", label: "Rating" },
  ],
};

const MENTOR_PANEL = {
  imageSrc: "/images/mentor-bg.jpg",
  imageAlt: "Mentors collaborating",
  badge: "🌍 Trusted by 10,000+ mentors globally",
  heading: <>Empowering the next<br />generation of leaders.</>,
  subtext: <>Join over 10,000+ mentors globally and start making<br />an impact today.</>,
  stats: [
    { num: "10K+", label: "Mentors" },
    { num: "50K+", label: "Sessions" },
    { num: "98%",  label: "Satisfaction" },
  ],
};

const Register = () => {
  const [role, setRole] = useState("mentee");
  const panel = role === "mentor" ? MENTOR_PANEL : MENTEE_PANEL;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AuthLeftPanel
        key={role}
        imageSrc={panel.imageSrc}
        imageAlt={panel.imageAlt}
        badge={panel.badge}
        heading={panel.heading}
        subtext={panel.subtext}
        stats={panel.stats}
      />

      <main className="flex flex-1 items-center justify-center px-6 py-10 overflow-y-auto">
        <div className="w-full max-w-105">

        <AuthBrand logo={<LeapMentorLogo />} />


          {/* Toggle */}
          <div className="flex p-1 mb-7 rounded-lg bg-slate-100 border border-slate-200">
            <button
              type="button"
              onClick={() => setRole("mentee")}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all duration-200 cursor-pointer
                ${role === "mentee"
                  ? "bg-white text-blue-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
                }`}
            >
              Find a Mentor
            </button>
            <button
              type="button"
              onClick={() => setRole("mentor")}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all duration-200 cursor-pointer
                ${role === "mentor"
                  ? "bg-white text-blue-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
                }`}
            >
              Become a Mentor
            </button>
          </div>

          {/* Form — key resets all state on role switch */}
          <RegisterForm key={role} role={role} />

        </div>
      </main>
    </div>
  );
};

export default Register;