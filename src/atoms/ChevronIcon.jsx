import PropTypes from "prop-types";
export default function ChevronIcon({ isOpen = false }) {
  return (
    <svg
      className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}
ChevronIcon.propTypes = {
  isOpen: PropTypes.bool,
};
