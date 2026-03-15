// src/pages/LoginMentee.jsx
import LoginLeftPanel from "../components/auth/LoginLeftPanel";
import LoginForm from "../components/auth/LoginForm";

const LoginMentee = () => {
  return (
    <div className="min-h-screen flex">
      {/* Left — image panel (hidden on mobile) */}
      <div className="hidden lg:block lg:w-[45%] shrink-0">
        <LoginLeftPanel role="mentee" />
      </div>

      {/* Right — form panel */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-12">
        <LoginForm
          role="mentee"
          title="Login as Mentee"
          subtitle="Login to your mentee account"
          placeholder="mentee@example.com"
          registerPath="/register/mentee"
        />
      </div>
    </div>
  );
};

export default LoginMentee;