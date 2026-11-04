/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/App.jsx
import { Toaster } from "sonner";
import { useEffect, useMemo, useState } from "react";
import { RouterProvider } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@store/index";
import { setUser, logout } from "@features/auth/models/authSlice";
import {
  getCurrentUserRequest,
  refreshTokenRequest,
} from "@features/auth/models/auth.api";
import logger from "@lib/monitoring/logger";
import PageLoader from "./PageLoader";
import { createAppRouter } from "./createAppRouter";

// Restore the session from the HttpOnly refresh cookie, then verify the user
// through Identity's authenticated /users/me endpoint before rendering routes.
// When the page is hard-refreshed, Redux is wiped but the HttpOnly
// refreshToken cookie is still sent automatically by the browser. Probe the
// refresh endpoint directly; the client must not inspect that cookie or use a
// second readable cookie as a session hint.
const useSessionBootstrap = () => {
  const dispatch = useDispatch<AppDispatch>();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  const [rehydrating, setRehydrating] = useState(() => !accessToken);

  useEffect(() => {
    if (accessToken) {
      setRehydrating(false);
      return;
    }

    const rehydrate = async () => {
      try {
        const { data } = await refreshTokenRequest();
        if (!data.accessToken) {
          throw new Error("Refresh response did not include an access token");
        }
        const { data: user } = await getCurrentUserRequest(data.accessToken);
        if (!user?._id || !Array.isArray(user.roles)) {
          throw new Error("Current-user response was incomplete");
        }
        dispatch(setUser({ user, accessToken: data.accessToken }));
      } catch (error) {
        // No refresh session is also a valid state for public pages. Protected
        // routes perform the appropriate redirect after bootstrap completes.
        dispatch(logout());
        logger.warn("Session restoration unavailable — continuing without a session", {
          reason: error instanceof Error ? error.message : "Unknown restoration error",
        });
      } finally {
        setRehydrating(false);
      }
    };

    rehydrate();
  }, [accessToken, dispatch]);

  return !rehydrating;
};

const App = () => {
  const ready = useSessionBootstrap();
  // createBrowserRouter starts its initial loaders as soon as it is created.
  // Wait until bearer-session restoration has updated Redux so loaders (such
  // as the shared-dashboard loader) don't mistake a hard refresh for logout.
  const router = useMemo(() => (ready ? createAppRouter() : null), [ready]);

  if (!ready || !router) return <PageLoader />;

  return (
    <>
      {/* The root route's hydrateFallbackElement (see routes.tsx) covers
          the initial paint while the matched route's lazy-loaded code
          resolves — the data-router equivalent of the old top-level
          <Suspense>. */}
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
};

export default App;
