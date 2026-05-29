import Card from "@atoms/Card";

export default function StatCard({ value, label, gradientFrom, gradientTo }) {
  return (
    <Card className="text-center py-5 px-4">
      <p
        className="text-3xl font-extrabold"
        style={{
          background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {value}
      </p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </Card>
  );
}