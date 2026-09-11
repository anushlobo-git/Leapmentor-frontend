/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/components/auth/AuthUI.jsx
import type { ReactNode, InputHTMLAttributes } from "react";

/**
 * Message banner for success / info / error states.
 * Props: type ("success" | "info" | "error"), text (string)
 */
interface AuthMessageBannerProps {
  type?: "success" | "info" | "error";
  text?: string;
}

export const AuthMessageBanner = ({ type, text }: AuthMessageBannerProps) => {
  if (!text) return null;

  const classes: Record<string, string> = {
    success: "bg-green-50 text-green-700 border border-green-200",
    info: "bg-blue-50 text-blue-700 border border-blue-200",
    error: "bg-red-50 text-red-700 border border-red-200",
  };

  return (
    <div className={`rounded-lg px-4 py-2.5 text-sm mb-4 leading-relaxed ${(type && classes[type]) || classes.error}`}>
      {text}
    </div>
  );
};

/**
 * "Or sign up/in with" divider.
 * Props: label (string, default "Or sign up with")
 */
export const AuthDivider = ({ label = "Or sign up with" }: { label?: string }) => (
  <div className="flex items-center gap-3 my-5">
    <div className="flex-1 h-px bg-slate-200" />
    <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">{label}</span>
    <div className="flex-1 h-px bg-slate-200" />
  </div>
);

/**
 * Reusable labeled input field.
 * Props: label, all standard <input> props
 */
interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
}

export const AuthField = ({ label, hint, ...inputProps }: AuthFieldProps) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <input
      {...inputProps}
      className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 bg-white outline-none focus:border-blue-900 transition-colors"
    />
    {hint && <p className="text-xs text-slate-400">{hint}</p>}
  </div>
);

/**
 * Brand header row — logo + "LeapMentor" text.
 * Props: logo (JSX element)
 */
export const AuthBrand = ({ logo }: { logo: ReactNode }) => (
  <div className="flex items-center gap-2.5 mb-7">
    {logo}
    <span className="text-xl font-bold text-slate-900 tracking-tight">LeapMentor</span>
  </div>
);
