import PropTypes from "prop-types";
export default function Dot({ isActive, onClick }) {
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
Dot.propTypes = {
  isActive: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};
