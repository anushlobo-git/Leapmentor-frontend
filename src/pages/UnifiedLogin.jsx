import { useSignIn, useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function UnifiedLogin() {
  const { isSignedIn, user } = useUser();
  const navigate = useNavigate();
  const [roles, setRoles] = useState(null); // null = loading, [] = not registered, ["mentor"] etc
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isSignedIn || !user) return;

    const email = user.primaryEmailAddress?.emailAddress;
    if (!email) return;

    setLoading(true);
    axios
      .get(`${API}/api/auth/my-roles`, { params: { email } })
      .then((res) => {
        const { roles } = res.data;

        if (roles.length === 0) {
          // Not registered → go to role selection
          navigate("/select-role");
        } else if (roles.length === 1) {
          // Single role → auto redirect
          issueTokenAndRedirect(email, roles[0]);
        } else {
          // Both roles → show picker
          setRoles(roles);
          setLoading(false);
        }
      })
      .catch(() => {
        navigate("/select-role"); // fallback
      });
  }, [isSignedIn, user]);

  const issueTokenAndRedirect = async (email, role) => {
    try {
      const res = await axios.post(`${API}/api/auth/issue-token`, { email, role });
      localStorage.setItem("token", res.data.token);
      navigate(role === "mentor" ? "/dashboard/mentor" : "/dashboard/mentee");
    } catch (err) {
      console.error("Token issue failed", err);
    }
  };

  const handleRolePick = (role) => {
    const email = user.primaryEmailAddress?.emailAddress;
    issueTokenAndRedirect(email, role);
  };

  // If not signed in yet, show Clerk's SignIn embed
  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
            Welcome Back
          </h1>
          {/* Use Clerk's prebuilt SignIn component */}
          <SignInEmbed />
        </div>
      </div>
    );
  }

  if (loading || roles === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Signing you in...</p>
      </div>
    );
  }

  // Dual-role picker
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-sm text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Welcome back, {user.firstName}!
        </h2>
        <p className="text-gray-500 mb-8">
          You're registered as both a Mentor and Mentee. How would you like to continue?
        </p>
        <div className="flex flex-col gap-4">
          <button
            onClick={() => handleRolePick("mentor")}
            className="w-full py-3 px-6 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition"
          >
            Continue as Mentor
          </button>
          <button
            onClick={() => handleRolePick("mentee")}
            className="w-full py-3 px-6 border-2 border-indigo-600 text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition"
          >
            Continue as Mentee
          </button>
        </div>
      </div>
    </div>
  );
}

// Inline Clerk SignIn (no redirect, embedded)
import { SignIn } from "@clerk/clerk-react";

function SignInEmbed() {
  return (
    <SignIn
      routing="hash"
      afterSignInUrl="/login" // comes back to this page after Clerk auth
    />
  );
}