export default function LetterBall({ letter, color, size = "md" }) {
  const sizes = {
    sm: "w-7 h-7 text-xs",
    md: "w-9 h-9 text-xs",
    lg: "w-10 h-10 text-sm",
  };

  return (
    <div
      className={`${sizes[size]} ${color} rounded-full border-2 border-white flex items-center justify-center text-white font-bold shrink-0`}
    >
      {letter}
    </div>
  );
}