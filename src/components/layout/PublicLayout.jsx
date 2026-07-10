/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// templates/PublicLayout.jsx
import Navbar from "@components/layout/Navbar";
import Footer from "@components/layout/Footer";
import PropTypes from "prop-types";

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col font-sans antialiased">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
PublicLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
