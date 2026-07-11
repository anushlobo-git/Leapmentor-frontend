/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import Dot from "@components/ui/Dot";
import PropTypes from "prop-types";

export default function DotIndicator({ total, active, onDotClick }) {
  return (
    <div className="flex justify-center gap-2 mt-10">
      {Array.from({ length: total }, (_, i) => `dot-${i}`).map((key, i) => (
        <Dot key={key} isActive={i === active} onClick={() => onDotClick(i)} />
      ))}
    </div>
  );
}

DotIndicator.propTypes = {
  total: PropTypes.number.isRequired,
  active: PropTypes.number.isRequired,
  onDotClick: PropTypes.func.isRequired,
};
