/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group ${className}`}
    >
      {children}
    </div>
  );
}
