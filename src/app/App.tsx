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
import { refreshTokenRequest } from "@features/auth/models/auth.api";
import logger from "@lib/monitoring/logger";
import PageLoader from "./PageLoader";
import { createAppRouter } from "./createAppRouter";

// Silent refresh on page load.
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
        if (!data.user || !data.accessToken) {
          throw new Error("Incomplete refresh response");
        }
        dispatch(setUser({ user: data.user, accessToken: data.accessToken }));
      } catch {
        // No refresh session is also a valid state for public pages. Protected
        // routes perform the appropriate redirect after bootstrap completes.
        dispatch(logout());
        logger.warn("Silent refresh unavailable — continuing without a session");
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
  const router = useMemo(() => createAppRouter(), []);

  if (!ready) return <PageLoader />;

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
