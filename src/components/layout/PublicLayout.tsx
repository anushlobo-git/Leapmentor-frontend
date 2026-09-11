/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// templates/PublicLayout.jsx
import Navbar from "@components/layout/Navbar";
import Footer from "@components/layout/Footer";
import type { ReactNode } from "react";

interface PublicLayoutProps {
  children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col font-sans antialiased">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
