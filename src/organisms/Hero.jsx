/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import LetterBall from "@atoms/LetterBall";
import HeroSlider from "@molecules/HeroSlider"; 

const socialProof = [
  { letter: "A", color: "bg-pink-400" },
  { letter: "B", color: "bg-yellow-400" },
  { letter: "C", color: "bg-green-400" },
];

export default function Hero() {
  return (
    <section className="min-h-screen bg-white pt-24 pb-16 px-6 flex items-center">
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

        {/* Left — Content */}
        <div className="flex flex-col gap-6">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight">
            Empower Your <br />
            Growth with{" "}
            <span className="text-blue-900">Expert Mentorship</span>
          </h1>

          <p className="text-gray-500 text-lg leading-relaxed max-w-md">
            Leapmentor connects ambitious professionals with industry leaders.
            Get personalized guidance, master new skills, and accelerate your
            career path with 1-on-1 sessions.
          </p>

          {/* Social Proof — inline, small, used only here */}
          <div className="flex items-center gap-3 mt-2">
            <div className="flex -space-x-2">
              {socialProof.map((item) => (
                <LetterBall
                  key={item.letter}
                  letter={item.letter}
                  color={item.color}
                  size="md"
                />
              ))}
            </div>
            <p className="text-sm text-gray-500">
              Joined by{" "}
              <span className="font-semibold text-gray-800">5,000+</span>{" "}
              mentees this month
            </p>
          </div>
        </div>

        {/* Right — Image Slider */}
        <HeroSlider />

      </div>
    </section>
  );
}