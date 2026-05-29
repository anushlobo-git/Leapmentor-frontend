import Card from "@atoms/Card";

export default function FeatureCard({ icon, title, description }) {
  return (
    <Card className="p-8">
      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-5 group-hover:bg-blue-100 transition-colors duration-200">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
    </Card>
  );
}