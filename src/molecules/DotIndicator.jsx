import Dot from "@atoms/Dot";

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