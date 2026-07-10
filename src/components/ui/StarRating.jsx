/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import StarIcon from "@components/ui/StarIcon";
import PropTypes from "prop-types";

export default function StarRating({ count = 5, total = 5 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: total }).map((_, i) => (
        <StarIcon key={i} filled={i < count} />
      ))}
    </div>
  );
}

StarRating.propTypes = {
  count: PropTypes.number,
  total: PropTypes.number,
};
