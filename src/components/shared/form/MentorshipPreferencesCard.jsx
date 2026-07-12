/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// components/shared/onboarding/MentorshipPreferencesCard.jsx
//
// Single source of truth for the "Mentorship Preferences" card
// (communication channel checkboxes + language multi-select dropdown).
// Previously this markup/logic was duplicated near-verbatim between
// mentor/components/onboarding/PreferencesSection.jsx and
// mentee/components/onboarding/MentorshipPrefsSection.jsx.
// Both now render this component and only supply the bits that differ
// (title, option lists, id prefix, and callbacks).
import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";

const optionId = (prefix, value) =>
  `${prefix}-${value.replace(/\s+/g, "-").toLowerCase()}`;

const MentorshipPreferencesCard = ({
  title,
  idPrefix,
  communicationOptions,
  languageOptions,
  selectedCommunication,
  selectedLanguages,
  onToggleCommunication,
  onToggleLanguage,
  onRemoveLanguage,
  communicationLabel,
  headerIconWrapperClassName,
  headerIconSize,
  dropdownZIndexClassName,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-blue-50 bg-blue-50">
        <div
          className={`${headerIconWrapperClassName} rounded-xl bg-blue-900 flex items-center justify-center shrink-0`}
        >
          <svg
            width={headerIconSize}
            height={headerIconSize}
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <h2 className="text-sm font-bold text-slate-800">{title}</h2>
      </div>

      <div className="px-6 py-5">
        <div className="grid grid-cols-2 gap-6">
          {/* Communication Channels */}
          <div>
            {/* Group heading, not tied to a single control — <p>, not <label> */}
            <p className="block text-xs font-semibold text-slate-500 mb-3">
              {communicationLabel}
            </p>
            <div className="space-y-2.5">
              {communicationOptions.map(({ value, label, icon }) => {
                const isChecked = selectedCommunication.includes(value);
                const id = optionId(idPrefix, value);
                return (
                  <label
                    key={value}
                    htmlFor={id}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    {/* Real, keyboard/mouse/tab-accessible checkbox — visually hidden */}
                    <input
                      type="checkbox"
                      id={id}
                      checked={isChecked}
                      onChange={() => onToggleCommunication(value)}
                      className="sr-only peer"
                    />
                    {/* Decorative visual only — label + input handle interaction */}
                    <div
                      aria-hidden="true"
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-150 shrink-0 ${
                        isChecked
                          ? "bg-blue-900 border-blue-900"
                          : "border-slate-300 bg-white group-hover:border-blue-400"
                      }`}
                    >
                      {isChecked && (
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 12 12"
                          fill="none"
                        >
                          <path
                            d="M2 6l3 3 5-5"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-slate-600 select-none">
                      {icon} {label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Languages — dropdown multi-select */}
          <div>
            <p className="block text-xs font-semibold text-slate-500 mb-2">
              Languages Known
            </p>

            {selectedLanguages.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {selectedLanguages.map((lang) => (
                  <span
                    key={lang}
                    className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full"
                  >
                    {lang}
                    <button
                      type="button"
                      onClick={() => onRemoveLanguage(lang)}
                      className="text-blue-400 hover:text-blue-700 leading-none ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div ref={dropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="w-full text-sm text-left bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 hover:border-slate-400 transition-all duration-150 flex items-center justify-between"
              >
                <span
                  className={
                    selectedLanguages.length === 0
                      ? "text-slate-300"
                      : "text-slate-700"
                  }
                >
                  {selectedLanguages.length === 0
                    ? "Select languages..."
                    : `${selectedLanguages.length} selected`}
                </span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                  }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* dropdownZIndexClassName lets the dropdown escape any stacking context from parent containers */}
              {dropdownOpen && (
                <div
                  className={`absolute ${dropdownZIndexClassName} top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-44 overflow-y-auto`}
                >
                  {languageOptions.map((lang) => {
                    const isSelected = selectedLanguages.includes(lang);
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => onToggleLanguage(lang)}
                        className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors ${
                          isSelected
                            ? "bg-blue-50 text-blue-700 font-semibold"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {lang}
                        {isSelected && (
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                          >
                            <path
                              d="M2 6l3 3 5-5"
                              stroke="#2563eb"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

MentorshipPreferencesCard.propTypes = {
  title: PropTypes.string.isRequired,
  idPrefix: PropTypes.string.isRequired,
  communicationOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.string.isRequired,
    }),
  ).isRequired,
  languageOptions: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedCommunication: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedLanguages: PropTypes.arrayOf(PropTypes.string).isRequired,
  onToggleCommunication: PropTypes.func.isRequired,
  onToggleLanguage: PropTypes.func.isRequired,
  onRemoveLanguage: PropTypes.func.isRequired,
  communicationLabel: PropTypes.string,
  headerIconWrapperClassName: PropTypes.string,
  headerIconSize: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  dropdownZIndexClassName: PropTypes.string,
};

MentorshipPreferencesCard.defaultProps = {
  communicationLabel: "Communication Channels",
  headerIconWrapperClassName: "w-8 h-8",
  headerIconSize: 14,
  dropdownZIndexClassName: "z-[9999]",
};

export default MentorshipPreferencesCard;
