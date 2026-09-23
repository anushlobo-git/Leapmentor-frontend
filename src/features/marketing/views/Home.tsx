/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import PublicLayout from "@components/layout/PublicLayout";
import Hero from "@features/marketing/views/Hero";
import Missions from "@features/marketing/views/Missions";
import Testimonials from "@features/marketing/views/Testimonials";
import { useHomePresenter } from "@features/marketing/presenters/useHomePresenter";

export default function Home() {
  useHomePresenter();

  return (
    <PublicLayout>
      <Hero />
      <Missions />
      <Testimonials />
    </PublicLayout>
  );
}
