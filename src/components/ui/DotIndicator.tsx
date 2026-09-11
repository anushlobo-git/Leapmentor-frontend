/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import Dot from "@components/ui/Dot";

interface DotIndicatorProps {
  total: number;
  active: number;
  onDotClick: (index: number) => void;
}

export default function DotIndicator({ total, active, onDotClick }: DotIndicatorProps) {
  return (
    <div className="flex justify-center gap-2 mt-10">
      {Array.from({ length: total }, (_, i) => `dot-${i}`).map((key, i) => (
        <Dot key={key} isActive={i === active} onClick={() => onDotClick(i)} />
      ))}
    </div>
  );
}
