// src/pages/LoginMentor.jsx
import LoginLeftPanel from "../components/auth/LoginLeftPanel";
import LoginForm from "../components/auth/LoginForm";

const LoginMentor = () => {
  return (
    <div className="min-h-screen flex">
      {/* Left — image panel (hidden on mobile) */}
      <div className="hidden lg:block lg:w-[45%] shrink-0">
        <LoginLeftPanel role="mentor" />
      </div>

      {/* Right — form panel */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-12">
        <LoginForm
          role="mentor"
          title="Login as Mentor"
          subtitle="Login to your mentor account"
          placeholder="mentor@example.com"
          registerPath="/register/mentor"
        />
      </div>
    </div>
  );
};

export default LoginMentor;