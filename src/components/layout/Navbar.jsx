/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "@components/ui/Logo";
import Button from "@components/ui/Button";
import RegisterDropdownItem from "@features/auth/components/RegisterDropdownItem";
import HamburgerIcon from "@components/ui/HamburgerIcon";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogoClick = () => {
    if (globalThis.location.pathname === "/") {
      globalThis.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/");
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="w-full px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Logo onClick={handleLogoClick} />

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate("/register")}>
            Register
          </Button>
          <Button variant="primary" onClick={() => navigate("/login")}>
            Login
          </Button>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <HamburgerIcon isOpen={menuOpen} />
        </button>

      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden px-6 pb-4 flex flex-col gap-3 bg-white border-t border-gray-100">

          
          <Button
            variant="outline"
            fullWidth
            onClick={() => { navigate("/register"); setMenuOpen(false); }}
          >
            Register
          </Button>


          <Button
            variant="primary"
            fullWidth
            onClick={() => { navigate("/login"); setMenuOpen(false); }}
          >
            Login
          </Button>

        </div>
      )}

    </nav>
  );
}