/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/mentee/components/onboarding/MentorshipPrefsSection.jsx
import PropTypes from "prop-types";
import MentorshipPreferencesCard from "../../../../components/shared/form/MentorshipPreferencesCard";

const COMM_OPTIONS = [
  { value: "Chat", label: "Chat", icon: "💬" },
  { value: "Video Call", label: "Video Call", icon: "🎥" },
  { value: "Email", label: "Email", icon: "✉️" },
  { value: "Phone Call", label: "Phone Call", icon: "📞" },
  { value: "In-Person", label: "In-Person", icon: "🤝" },
];

// 20 professional languages — no free text allowed
const LANGUAGE_OPTIONS = [
  "English",
  "Hindi",
  "Spanish",
  "French",
  "German",
  "Mandarin",
  "Arabic",
  "Portuguese",
  "Japanese",
  "Korean",
  "Italian",
  "Russian",
  "Dutch",
  "Turkish",
  "Swedish",
  "Polish",
  "Indonesian",
  "Bengali",
  "Tamil",
  "Urdu",
];

const MentorshipPrefsSection = ({ form, handleChange }) => {
  const selected = form.communicationPreferences || [];
  const languages = form.languages || [];

  const toggleComm = (value) => {
    const updated = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    handleChange({
      target: { name: "communicationPreferences", value: updated },
    });
  };

  const toggleLanguage = (lang) => {
    const updated = languages.includes(lang)
      ? languages.filter((l) => l !== lang)
      : [...languages, lang];
    handleChange({ target: { name: "languages", value: updated } });
  };

  const removeLanguage = (lang) => {
    handleChange({
      target: { name: "languages", value: languages.filter((l) => l !== lang) },
    });
  };

  return (
    <MentorshipPreferencesCard
      title="Mentorship Preferences"
      idPrefix="mentee-comm"
      communicationLabel="Preferred Communication"
      communicationOptions={COMM_OPTIONS}
      languageOptions={LANGUAGE_OPTIONS}
      selectedCommunication={selected}
      selectedLanguages={languages}
      onToggleCommunication={toggleComm}
      onToggleLanguage={toggleLanguage}
      onRemoveLanguage={removeLanguage}
      headerIconWrapperClassName="w-7 h-7"
      headerIconSize={13}
      dropdownZIndexClassName="z-50"
    />
  );
};

MentorshipPrefsSection.propTypes = {
  form: PropTypes.shape({
    communicationPreferences: PropTypes.arrayOf(
      PropTypes.oneOf([
        "Chat",
        "Video Call",
        "Email",
        "Phone Call",
        "In-Person",
      ]),
    ),
    languages: PropTypes.arrayOf(
      PropTypes.oneOf([
        "English",
        "Hindi",
        "Spanish",
        "French",
        "German",
        "Mandarin",
        "Arabic",
        "Portuguese",
        "Japanese",
        "Korean",
        "Italian",
        "Russian",
        "Dutch",
        "Turkish",
        "Swedish",
        "Polish",
        "Indonesian",
        "Bengali",
        "Tamil",
        "Urdu",
      ]),
    ),
  }).isRequired,
  handleChange: PropTypes.func.isRequired,
};

export default MentorshipPrefsSection;
