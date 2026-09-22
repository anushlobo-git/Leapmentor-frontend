/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

interface RegisterDropdownItemProps {
  emoji: string;
  title: string;
  subtitle: string;
  iconBg: string;
  onClick: () => void;
}

export default function RegisterDropdownItem({
  emoji,
  title,
  subtitle,
  iconBg,
  onClick,
}: RegisterDropdownItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-50 transition-all duration-150 group text-left"
    >
      <div
        className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-150`}
      >
        <span className="text-base">{emoji}</span>
      </div>
      <div>
        <p className="text-sm font-bold text-slate-800 group-hover:text-blue-900">
          {title}
        </p>
        <p className="text-xs text-slate-400">{subtitle}</p>
      </div>
    </button>
  );
}
