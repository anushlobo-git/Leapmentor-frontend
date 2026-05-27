import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ChevronIcon from "@atoms/ChevronIcon";
import RegisterDropdownItem from "@molecules/RegisterDropdownItem";

export default function RegisterDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>

      {/* Trigger button — inline, used only here */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="w-32 flex items-center justify-between gap-1 px-5 py-[9px] text-sm font-semibold text-blue-900 border-2 border-blue-900 rounded-lg hover:bg-blue-50 transition-colors duration-200"
      >
        Register
        <ChevronIcon isOpen={isOpen} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border-2 border-blue-900/10 z-50 overflow-hidden p-2">

          <RegisterDropdownItem
            emoji="🚀"
            title="Become a Mentor"
            subtitle="Share your expertise"
            iconBg="bg-blue-900"
            onClick={() => { navigate("/register/mentor"); setIsOpen(false); }}
          />

          <div className="h-px bg-blue-900/10 mx-3 my-1" />

          <RegisterDropdownItem
            emoji="🎓"
            title="Find a Mentor"
            subtitle="Accelerate your growth"
            iconBg="bg-blue-100"
            onClick={() => { navigate("/register/mentee"); setIsOpen(false); }}
          />

        </div>
      )}

    </div>
  );
}