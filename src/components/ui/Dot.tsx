/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

interface DotProps {
  isActive: boolean;
  onClick: () => void;
}

export default function Dot({ isActive, onClick }: DotProps) {
  return (
    <button
      onClick={onClick}
      className="rounded-full transition-all duration-300"
      style={{
        width: isActive ? "24px" : "8px",
        height: "8px",
        background: isActive
          ? "linear-gradient(135deg, #8b5cf6, #ec4899)"
          : "#d1d5db",
      }}
    />
  );
}
