/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/pages/Login.jsx
//
// The bare /login page. Mirrors Register.tsx: a mentee/mentor toggle decides
// which dashboard a successful login lands on. One email can hold both roles,
// so the toggle is the only way a dual-role account chooses to enter its
// mentee side rather than always defaulting to the higher-priority (mentor)
// dashboard. The role is passed to LoginForm → useLoginPresenter, which only
// honors it when the authenticated account actually holds that role.
import { useState } from "react";
import LoginLeftPanel from "@features/auth/views/LoginLeftPanel";
import LoginForm from "@features/auth/views/LoginForm";

const Login = () => {
  const [role, setRole] = useState("mentee");

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:block lg:w-[45%] shrink-0">
        <LoginLeftPanel />
      </div>

      <main className="flex-1 flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-sm mx-auto">
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
              Login as Mentee
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
              Login as Mentor
            </button>
          </div>

          {/* Form — key resets all state on role switch */}
          <LoginForm
            key={role}
            role={role}
            placeholder={role === "mentor" ? "mentor@example.com" : "you@example.com"}
            registerPath="/register"
          />
        </div>
      </main>
    </div>
  );
};

export default Login;
