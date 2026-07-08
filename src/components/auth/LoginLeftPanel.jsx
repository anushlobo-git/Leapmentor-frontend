/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/components/auth/LoginLeftPanel.jsx
import { IMAGES } from "../../constants/images";

const LoginLeftPanel = () => {

  return (
    <div className="relative w-full h-full min-h-screen overflow-hidden">
      {/* Background image */}
      <img
        src={IMAGES.LOGIN}
        alt="Login visual"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-black/10" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-10 text-white">
        

        {/* Headline */}
        <h2 className="text-4xl font-extrabold leading-tight mb-4 tracking-tight">
          
             <>The right connection<br />changes everything.</>
             
          
        </h2>

        {/* Subtext */}
        <p className="text-sm text-white/70 leading-relaxed max-w-xs">
          <>Where experience meets ambition <br/> grow together, go further.</>
        </p>
      </div>
    </div>
  );
};

export default LoginLeftPanel;