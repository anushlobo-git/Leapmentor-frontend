/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { useState, useEffect } from "react";
import SuccessCard from "@components/ui/SuccessCard";

const images = [
  "/images/mentor3.webp",
  "/images/mentor4.webp",
  "/images/mentor2.webp",
];

const SLIDE_INTERVAL_MS = 3000;
const FADE_OUT_MS = 400;

function getNextIndex(prev) {
  return (prev + 1) % images.length;
}

function getSlideOpacity(current, i, fade) {
  if (current !== i) return 0;
  return fade ? 1 : 0;
}

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    function showNextSlide() {
      setCurrent(getNextIndex);
      setFade(true);
    }

    function startFadeOut() {
      setFade(false);
      setTimeout(showNextSlide, FADE_OUT_MS);
    }

    const interval = setInterval(startFadeOut, SLIDE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex justify-center">
      <div className="w-full max-w-md h-80 md:h-96 rounded-3xl overflow-hidden shadow-2xl relative bg-blue-50">
        {images.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={`Slide ${i + 1}`}
            width={896}
            height={768}
            fetchPriority={i === 0 ? "high" : "low"}
            loading={i === 0 ? "eager" : "lazy"}
            decoding={i === 0 ? "sync" : "async"}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: getSlideOpacity(current, i, fade),
              transition:
                current === i && fade ? "opacity 0.4s ease-in-out" : "none",
            }}
          />
        ))}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent pointer-events-none" />

        {/* Floating success card */}
        <SuccessCard />
      </div>
    </div>
  );
}
