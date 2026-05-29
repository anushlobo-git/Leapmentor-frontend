export default function Button({
  children,
  variant = "primary",
  onClick,
  type = "button",
  fullWidth = false,
  disabled = false,
  withIcon = false,
}) {
  const base =
    "px-5 py-[9px] text-sm font-semibold rounded-lg transition-colors duration-200 cursor-pointer";

  const variants = {
    primary:
      "text-white bg-blue-900 border-2 border-transparent hover:bg-blue-800",
    outline:
      "text-blue-900 bg-transparent border-2 border-blue-900 hover:bg-blue-50",
  };

  const width = fullWidth ? "w-full" : "w-32";
  const layout = withIcon ? "flex items-center justify-between gap-1" : "";
  const disabledStyles = disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${width} ${layout} ${disabledStyles}`}
    >
      {children}
    </button>
  );
}