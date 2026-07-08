/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isLoggedIn, getRole } from "@utils/cookies";
import PublicLayout from "@templates/PublicLayout";
import Hero from "@organisms/Hero";
import Missions from "@organisms/Missions";
import Testimonials from "@organisms/Testimonials";

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    // ✅ authToken is HttpOnly (unreadable), check authRole cookie instead
    if (isLoggedIn()) {
      const role = getRole();
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