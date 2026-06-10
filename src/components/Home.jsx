//not being used currently, but keeping for potential future use
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@organisms/Navbar";
import Hero from "@organisms/Hero";
import Missions from "@organisms/Missions";
import Testimonials from "@organisms/Testimonials";
import Footer from "@organisms/Footer";

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role  = localStorage.getItem("role");
    if (token && role) {
      navigate(role === "mentor" ? "/dashboard/mentor" : "/dashboard/mentee", { replace: true });
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans antialiased">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Missions />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}