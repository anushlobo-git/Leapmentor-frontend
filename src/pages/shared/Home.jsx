import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PublicLayout from "@templates/PublicLayout";
import Hero from "@organisms/Hero";
import Missions from "@organisms/Missions";
import Testimonials from "@organisms/Testimonials";

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
    <PublicLayout>
      <Hero />
      <Missions />
      <Testimonials />
    </PublicLayout>
  );
}