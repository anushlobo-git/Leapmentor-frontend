/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PublicLayout from "@templates/PublicLayout";
import Hero from "@organisms/Hero";
import Missions from "@organisms/Missions";
import Testimonials from "@organisms/Testimonials";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "@store/slices/authSlice";

export default function Home() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();

  useEffect(() => {
    // authToken is HttpOnly (unreadable), check authRole cookie instead
    if (isAuthenticated) {
    const role = user?.roles?.[0];
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
