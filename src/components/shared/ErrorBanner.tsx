/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/components/shared/ErrorBanner.jsx

const SIZE_CLASSES: Record<string, string> = {
  sm: "text-xs",
  md: "text-sm",
};

interface ErrorBannerProps {
  message?: string;
  size?: "sm" | "md";
  className?: string;
}

const ErrorBanner = ({ message, size = "md", className = "" }: ErrorBannerProps) => {
  if (!message) return null;

  return (
    <div
      className={`flex items-center gap-2 ${SIZE_CLASSES[size]} bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 ${className}`}
    >
      <span>⚠</span> {message}
    </div>
  );
};

export default ErrorBanner;
