// components/mentee/onboarding/InterestedFieldsSection.jsx
import { useState } from "react";

const TagInput = ({ tags, onAdd, onRemove, placeholder }) => {
  const [input, setInput] = useState("");

  const add = () => {
    const trimmed = input.trim();
    if (!trimmed || tags.includes(trimmed)) { setInput(""); return; }
    onAdd(trimmed);
    setInput("");
  };

  return (
    <div>
      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-2 min-h-[28px]">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full"
          >
            {tag}
            <button
              type="button"
              onClick={() => onRemove(tag)}
              className="w-3.5 h-3.5 rounded-full bg-blue-300 hover:bg-blue-900 text-white flex items-center justify-center text-[10px] transition-colors duration-150"
            >
              ×
            </button>
          </span>
        ))}
      </div>

      {/* Input */}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
        onBlur={add}
        placeholder={placeholder}
        className="w-full text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none placeholder:text-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-150"
      />
    </div>
  );
};

const InterestedFieldsSection = ({ form, handleChange }) => {
  const addToArray = (field, value) => {
    handleChange({ target: { name: field, value: [...(form[field] || []), value] } });
  };

  const removeFromArray = (field, value) => {
    handleChange({ target: { name: field, value: (form[field] || []).filter((v) => v !== value) } });
  };

  return (
    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-blue-50 bg-blue-50">
        <div className="w-7 h-7 rounded-lg bg-blue-900 flex items-center justify-center shrink-0">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
          </svg>
        </div>
        <h2 className="text-sm font-bold text-slate-800">3. Interested Fields</h2>
      </div>

      <div className="px-6 py-5 space-y-5">
        {/* Fields of Interest */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-2">
            Fields of Interest
          </label>
          <TagInput
            tags={form.interestedFields || []}
            onAdd={(v) => addToArray("interestedFields", v)}
            onRemove={(v) => removeFromArray("interestedFields", v)}
            placeholder="Add fields e.g. AI, Growth, Design..."
          />
        </div>

        {/* Skills of Interest */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-2">
            Skills of Interest
          </label>
          <TagInput
            tags={form.skills || []}
            onAdd={(v) => addToArray("skills", v)}
            onRemove={(v) => removeFromArray("skills", v)}
            placeholder="Add skills e.g. Figma, Python, Leadership..."
          />
        </div>
      </div>
    </div>
  );
};

export default InterestedFieldsSection;