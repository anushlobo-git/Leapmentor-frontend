import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../ui/Navbar";
import Hero from "../ui/Hero";
import Missions from "../ui/Missions";
import Testimonials from "../ui/Testimonials";
import Footer from "../ui/Footer";

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