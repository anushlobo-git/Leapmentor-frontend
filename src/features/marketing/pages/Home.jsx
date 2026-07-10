/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PublicLayout from "@components/layout/PublicLayout";
import Hero from "@features/marketing/components/Hero";
import Missions from "@features/marketing/components/Missions";
import Testimonials from "@features/marketing/components/Testimonials";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "@features/auth/store/authSlice";

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
