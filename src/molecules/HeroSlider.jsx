import { useState, useEffect } from "react";
import SuccessCard from "@molecules/SuccessCard";

const images = [
  "/images/mentor3.webp",
  "/images/mentor4.webp",
  "/images/mentor2.webp",
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % images.length);
        setFade(true);
      }, 400);
    }, 3000);
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
              opacity: current === i ? (fade ? 1 : 0) : 0,
              transition: current === i && fade ? "opacity 0.4s ease-in-out" : "none",
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