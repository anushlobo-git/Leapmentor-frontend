/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import StarIcon from "@components/ui/StarIcon";

interface StarRatingProps {
  count?: number;
  total?: number;
}

export default function StarRating({ count = 5, total = 5 }: StarRatingProps) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: total }, (_, i) => i).map((i) => (
        <StarIcon key={`star-${i}`} filled={i < count} />
      ))}
    </div>
  );
}
