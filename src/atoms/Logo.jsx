export default function Logo({ onClick,variant="dark" }) {

  // "dark" variant gets dark text (gray-900), "light" variant gets white text
  const textColor = variant === "light" ? "text-white" : "text-gray-900";
  return (
    <div
      className="flex items-center gap-2 cursor-pointer"
      onClick={onClick}
    >
      <img
        src="/images/logo.webp"
        alt="LeapMentor logo"
        className="h-8 w-8"
        width={32}
        height={32}
      />
      <span className={`text-xl font-bold tracking-tight ${textColor}`}>
        LeapMentor
      </span>
    </div>
  );
}
 