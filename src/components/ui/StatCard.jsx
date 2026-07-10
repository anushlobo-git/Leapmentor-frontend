/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import Card from "@components/ui/Card";
import PropTypes from "prop-types";

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
StatCard.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  label: PropTypes.string.isRequired,
  gradientFrom: PropTypes.string.isRequired,
  gradientTo: PropTypes.string.isRequired,
};
