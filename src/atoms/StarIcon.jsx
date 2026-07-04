import PropTypes from "prop-types";
export default function StarIcon({ filled = true }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "#FBBF24" : "#D1D5DB"}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}
StarIcon.propTypes = {
  filled: PropTypes.bool,
};
