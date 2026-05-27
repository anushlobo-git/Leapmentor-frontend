import { useState, useEffect, useCallback, useRef } from "react";
import TestimonialCard from "@molecules/TestimonialCard";
import StatCard from "@molecules/StatCard";
import SideArrow from "@atoms/SideArrow";

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Software Engineer",
    company: "Google",
    letter: "PS",
    color: "bg-gradient-to-br from-pink-500 to-rose-500",
    rating: 5,
    text: "LeapMentor completely transformed my career trajectory. My mentor helped me crack FAANG interviews in just 3 months. The 1-on-1 sessions were incredibly focused and practical.",
  },
  {
    name: "Arjun Mehta",
    role: "Product Manager",
    company: "Flipkart",
    letter: "AM",
    color: "bg-gradient-to-br from-violet-500 to-purple-600",
    rating: 5,
    text: "I was stuck in the same role for 3 years. After 8 sessions with my mentor, I landed a Senior PM role with a 60% salary hike. The guidance was worth every token!",
  },
  {
    name: "Sneha Reddy",
    role: "Data Scientist",
    company: "Microsoft",
    letter: "SR",
    color: "bg-gradient-to-br from-emerald-500 to-teal-500",
    rating: 5,
    text: "The smart matching algorithm paired me with the perfect mentor who had the exact background I was targeting. Highly recommend LeapMentor to anyone serious about growth.",
  },
  {
    name: "Karan Patel",
    role: "UX Designer",
    company: "Adobe",
    letter: "KP",
    color: "bg-gradient-to-br from-orange-500 to-amber-400",
    rating: 5,
    text: "My mentor reviewed my portfolio and gave brutally honest feedback. That's exactly what I needed. Within 2 months I had 3 job offers. This platform is a game changer.",
  },
  {
    name: "Divya Nair",
    role: "Backend Engineer",
    company: "Razorpay",
    letter: "DN",
    color: "bg-gradient-to-br from-cyan-500 to-blue-500",
    rating: 5,
    text: "The shared dashboard and session notes made every meeting productive. I never had to repeat context — my mentor was always prepared and engaged. 10/10 experience.",
  },
  {
    name: "Rohit Joshi",
    role: "DevOps Engineer",
    company: "Infosys",
    letter: "RJ",
    color: "bg-gradient-to-br from-yellow-400 to-orange-400",
    rating: 5,
    text: "I was skeptical about online mentorship but LeapMentor proved me wrong. The structured goal tracking and milestone system kept me accountable every single week.",
  },
];

const stats = [
  { value: "5,000+", label: "Mentees Helped",    gradientFrom: "#ec4899", gradientTo: "#f43f5e" },
  { value: "98%",    label: "Satisfaction Rate", gradientFrom: "#8b5cf6", gradientTo: "#7c3aed" },
  { value: "4.9★",  label: "Average Rating",    gradientFrom: "#10b981", gradientTo: "#0891b2" },
];

export default function Testimonials() {
  const [active, setActive] = useState(0);
  const animating = useRef(false);
  const cardRef = useRef(null);

  const go = useCallback((dir) => {
    if (animating.current) return;
    animating.current = true;

    // Animate out — direct DOM, zero re-render
    if (cardRef.current) {
      cardRef.current.style.opacity = "0";
      cardRef.current.style.transform = "scale(0.96)";
    }

    setTimeout(() => {
      // Only this triggers a re-render
      setActive((prev) => (prev + dir + testimonials.length) % testimonials.length);

      // Animate in — direct DOM
      if (cardRef.current) {
        cardRef.current.style.opacity = "1";
        cardRef.current.style.transform = "scale(1)";
      }

      animating.current = false;
    }, 300);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => go(1), 4000);
    return () => clearInterval(timer);
  }, [go]);

  const prev = (active - 1 + testimonials.length) % testimonials.length;
  const next = (active + 1) % testimonials.length;

  return (
    <section
      className="py-24 px-6 overflow-hidden"
      style={{ background: "linear-gradient(135deg, #fdf4ff 0%, #eff6ff 60%, #f0fdf4 100%)" }}
    >
      <div className="max-w-6xl mx-auto">

        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-violet-600 text-sm font-semibold uppercase tracking-widest mb-3">
            What Our Community Says
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
            Real stories, real growth
          </h2>
          <p className="text-gray-500 mt-4 text-lg max-w-xl mx-auto">
            Thousands of professionals have transformed their careers with LeapMentor.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-6 mb-16 max-w-2xl mx-auto">
          {stats.map((stat) => (
            <StatCard
              key={stat.label}
              value={stat.value}
              label={stat.label}
              gradientFrom={stat.gradientFrom}
              gradientTo={stat.gradientTo}
            />
          ))}
        </div>

        {/* Carousel */}
        <div className="relative flex items-center justify-center gap-6">

          <SideArrow onClick={() => go(-1)} direction="left" />

          <div className="flex gap-5 items-center w-full max-w-4xl overflow-hidden">

            {/* Prev card — dimmed, no ref needed */}
            <div
              className="hidden md:block w-1/3 shrink-0 cursor-pointer"
              onClick={() => go(-1)}
            >
              <TestimonialCard testimonial={testimonials[prev]} dimmed />
            </div>

            {/* Active card — ref attached for direct DOM animation */}
            <div
              ref={cardRef}
              className="w-full md:w-1/3 shrink-0"
              style={{
                opacity: 1,
                transform: "scale(1)",
                transition: "opacity 0.3s ease, transform 0.3s ease",
              }}
            >
              <TestimonialCard testimonial={testimonials[active]} active />
            </div>

            {/* Next card — dimmed, no ref needed */}
            <div
              className="hidden md:block w-1/3 shrink-0 cursor-pointer"
              onClick={() => go(1)}
            >
              <TestimonialCard testimonial={testimonials[next]} dimmed />
            </div>

          </div>

          <SideArrow onClick={() => go(1)} direction="right" />

        </div>

        {/* Dots — inline */}
        <div className="flex justify-center gap-2 mt-10">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                if (!animating.current && i !== active) {
                  go(i > active ? 1 : -1);
                }
              }}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === active ? "24px" : "8px",
                height: "8px",
                background: i === active
                  ? "linear-gradient(135deg, #8b5cf6, #ec4899)"
                  : "#d1d5db",
              }}
            />
          ))}
        </div>

      </div>
    </section>
  );
}