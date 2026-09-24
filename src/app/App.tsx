/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/App.jsx
import { Toaster } from "sonner";
import { useEffect, useMemo, useState } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@store/index";
import { setUser, logout } from "@features/auth/models/authSlice";
import { refreshTokenRequest } from "@features/auth/models/auth.api";
import logger from "@lib/monitoring/logger";
import { hasSessionHint, clearAuthRole } from "@lib/http/cookies";
import PageLoader from "./PageLoader";
import { appRoutes } from "./routes";

// Built inside a function, not at module scope: createBrowserRouter reads
// window.location the moment it's created, and tests (App.test.jsx) change
// the path per test via createMemoryRouter instead — this keeps the two
// from fighting over when the router snapshots the URL.
export const createAppRouter = () => createBrowserRouter(appRoutes);

// FIX: Silent refresh on page load.
// When the page is hard-refreshed, Redux is wiped but the httpOnly
// refreshToken cookie is still alive. If the authRole cookie exists (user
// was logged in) but Redux has no accessToken, hit /auth/refresh to
// rehydrate Redux before rendering any route. This has to finish *before*
// the router renders anything, because a future loader (Phase 5) reading
// `store.getState().auth` would otherwise run against an empty session.
const useSessionBootstrap = () => {
  const dispatch = useDispatch<AppDispatch>();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  const [rehydrating, setRehydrating] = useState(() => {
    // Only block render if we actually need to rehydrate
    return hasSessionHint() && !accessToken;
  });

  useEffect(() => {
    if (!hasSessionHint() || accessToken) {
      // Not logged in, or token already in Redux — nothing to do
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
        // Refresh token expired — cookies are stale, clean up
        dispatch(logout());
        clearAuthRole();
        logger.warn("Silent refresh failed — redirecting to login");
        globalThis.location.href = "/login";
      } finally {
        setRehydrating(false);
      }
    };

    rehydrate();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps — runs once on mount

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
