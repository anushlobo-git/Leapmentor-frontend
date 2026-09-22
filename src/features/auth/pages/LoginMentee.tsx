/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/pages/LoginMentee.jsx
import LoginLeftPanel from "@features/auth/components/LoginLeftPanel";
import LoginForm from "@features/auth/components/LoginForm";

const LoginMentee = () => {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:block lg:w-[45%] shrink-0">
        <LoginLeftPanel />
      </div>
      <main className="flex-1 flex items-center justify-center bg-white px-6 py-12">
        <LoginForm placeholder="you@example.com" registerPath="/register" />
      </main>
    </div>
  );
};

export default LoginMentee;