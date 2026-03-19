// components/mentor/onboarding/SkillsSection.jsx
import { useState } from "react";

const SkillsSection = ({ form, onChange }) => {
  const [input, setInput] = useState("");

  const addSkill = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const current = form.skills || [];
    if (current.includes(trimmed)) { setInput(""); return; }
    onChange({ target: { name: "skills", value: [...current, trimmed] } });
    setInput("");
  };

  const removeSkill = (skill) => {
    onChange({
      target: {
        name: "skills",
        value: (form.skills || []).filter((s) => s !== skill),
      },
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); addSkill(); }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#e8edf5] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[#e8edf5] bg-[#f8faff]">
        <div className="w-8 h-8 rounded-xl bg-blue-900 flex items-center justify-center shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
        </div>
        <h2 className="text-sm font-bold text-[#0f172a]">Skills & Expertise</h2>
      </div>

      <div className="px-6 py-5">
        <label className="block text-xs font-semibold text-[#475569] mb-2">
          Core Skills <span className="text-blue-900">*</span>
        </label>

        {/* Tags display */}
        <div className="flex flex-wrap gap-2 mb-3 min-h-[32px]">
          {(form.skills || []).map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1.5 bg-[#dbeafe] text-blue-900 text-xs font-semibold px-3 py-1.5 rounded-full"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="w-3.5 h-3.5 rounded-full bg-[#93c5fd] hover:bg-[#2563eb] text-white flex items-center justify-center transition-colors duration-150 text-[10px] leading-none"
              >
                ×
              </button>
            </span>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a skill and press enter..."
            className="flex-1 text-sm text-[#0f172a] bg-[#f8faff] border border-[#e2e8f0] rounded-xl px-3.5 py-2.5 outline-none placeholder:text-[#94a3b8] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb20] transition-all duration-150"
          />
          <button
            type="button"
            onClick={addSkill}
            className="px-4 py-2.5 rounded-xl bg-blue-900 text-white text-xs font-bold hover:bg-[#1d4ed8] transition-colors duration-150"
          >
            Add
          </button>
        </div>
        <p className="text-xs text-[#94a3b8] mt-1.5">Press Enter or click Add to add a skill</p>
      </div>
    </div>
  );
};

export default SkillsSection;