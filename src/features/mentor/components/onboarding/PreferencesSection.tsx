/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/mentor/components/onboarding/PreferencesSection.jsx
import MentorshipPreferencesCard from "../../../../components/shared/form/MentorshipPreferencesCard";

const COMMUNICATION_OPTIONS = [
  { value: "Video Call", label: "Video Meetings", icon: "🎥" },
  { value: "Chat", label: "Instant Messaging (Chat)", icon: "💬" },
  { value: "Email", label: "Email Correspondence", icon: "✉️" },
  { value: "Phone Call", label: "Phone Call", icon: "📞" },
  { value: "In-Person", label: "In-Person", icon: "🤝" },
];

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

// Supports both the legacy comma-separated string format and the new array format.
const parseLanguages = (value: string | string[] | undefined): string[] => {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  return value
    .split(",")
    .map((s: string) => s.trim())
    .filter(Boolean);
};

interface PreferencesSectionProps {
  form: { communicationPreferences?: string[]; languages?: string | string[] };
  onChange: (e: any) => void;
}

const PreferencesSection = ({ form, onChange }: PreferencesSectionProps) => {
  const selected = form.communicationPreferences || [];
  const languages = parseLanguages(form.languages);

  const toggleComm = (value: string) => {
    const updated = selected.includes(value)
      ? selected.filter((v: string) => v !== value)
      : [...selected, value];
    onChange({ target: { name: "communicationPreferences", value: updated } });
  };

  const toggleLanguage = (lang: string) => {
    const updated = languages.includes(lang)
      ? languages.filter((l: string) => l !== lang)
      : [...languages, lang];
    onChange({ target: { name: "languages", value: updated } });
  };

  const removeLanguage = (lang: string) => {
    onChange({
      target: { name: "languages", value: languages.filter((l: string) => l !== lang) },
    });
  };

  return (
    <MentorshipPreferencesCard
      title="Mentorship Preferences"
      idPrefix="comm"
      communicationOptions={COMMUNICATION_OPTIONS}
      languageOptions={LANGUAGE_OPTIONS}
      selectedCommunication={selected}
      selectedLanguages={languages}
      onToggleCommunication={toggleComm}
      onToggleLanguage={toggleLanguage}
      onRemoveLanguage={removeLanguage}
    />
  );
};


export default PreferencesSection;
