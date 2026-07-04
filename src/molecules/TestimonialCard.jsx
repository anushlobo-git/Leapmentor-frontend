import Card from "@atoms/Card";
import StarRating from "@molecules/StarRating";
import LetterBall from "../atoms/LetterBall";
import PropTypes from "prop-types";

export default function TestimonialCard({ testimonial, active, dimmed }) {
  return (
    <Card
      className={`p-6 transition-all duration-300 ${
        active
          ? "border-violet-100 shadow-xl scale-100"
          : dimmed
          ? "bg-white/70 border-gray-100 shadow-sm opacity-50 scale-95"
          : ""
      }`}
    >
      {/* Quote icon */}
      <div className="mb-4">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="#ede9fe">
          <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
          <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
        </svg>
      </div>

      {/* Quote text */}
      <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-4">
        {testimonial.text}
      </p>

      {/* Author row */}
      <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LetterBall
            letter={testimonial.letter}
            color={testimonial.color}
            size="lg"
          />
          <div>
            <p className="text-sm font-bold text-gray-900">{testimonial.name}</p>
            <p className="text-xs text-gray-500">
              {testimonial.role} · {testimonial.company}
            </p>
          </div>
        </div>
        <StarRating count={testimonial.rating} />
      </div>
    </Card>
  );
}

TestimonialCard.propTypes = {
  testimonial: PropTypes.shape({
    text: PropTypes.string,
    letter: PropTypes.string,
    color: PropTypes.string,
    name: PropTypes.string,
    role: PropTypes.string,
    company: PropTypes.string,
    rating: PropTypes.number,
  }).isRequired,
  active: PropTypes.bool,
  dimmed: PropTypes.bool,
};
