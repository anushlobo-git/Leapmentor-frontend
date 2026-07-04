import Dot from "@atoms/Dot";
import PropTypes from "prop-types";

export default function DotIndicator({ total, active, onDotClick }) {
  return (
    <div className="flex justify-center gap-2 mt-10">
      {Array.from({ length: total }).map((_, i) => (
        <Dot
          key={i}
          isActive={i === active}
          onClick={() => onDotClick(i)}
        />
      ))}
    </div>
  );
}

DotIndicator.propTypes = {
  total: PropTypes.number.isRequired,
  active: PropTypes.number.isRequired,
  onDotClick: PropTypes.func.isRequired,
};
