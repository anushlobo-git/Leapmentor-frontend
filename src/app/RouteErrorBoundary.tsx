/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/app/RouteErrorBoundary.tsx
//
// The data-router equivalent of <ErrorBoundary resetKeys={[location.pathname]}>
// from the old App.tsx. That resetKeys trick existed to clear a stuck error
// whenever the user navigated to a different route — a data router's
// errorElement does that automatically (it's re-mounted per route), so the
// trick is gone along with the global boundary it patched.
//
// Used as the `errorElement` on the root route and on each guarded group
// (mentor, mentee, admin, shared-dashboard) — a crash inside one group
// shows this, while the rest of the app (e.g. navigating back to "/")
// keeps working.
import { useEffect } from "react";
import { isRouteErrorResponse, useNavigate, useRouteError } from "react-router-dom";
import * as Sentry from "@sentry/react";
import logger from "@lib/monitoring/logger";
import { ErrorFallback } from "@components/shared/ErrorBoundary";
import NotFound from "@app/pages/NotFound";

const RouteErrorBoundary = () => {
  const error = useRouteError();
  const navigate = useNavigate();
  const isHttpError = isRouteErrorResponse(error);

  useEffect(() => {
    if (isHttpError) return; // 404/expected — not a bug, don't report it
    const message = error instanceof Error ? error.message : String(error);
    logger.error("Route error boundary caught an error:", { error: message });
    Sentry.captureException(error);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- report once per error instance
  }, [error]);

  // A route/loader that threw a 404 (or a 403, treated the same way here)
  // gets the same friendly "not found" page as an unmatched URL.
  if (isHttpError && (error.status === 404 || error.status === 403)) {
    return <NotFound />;
  }

  return (
    <ErrorFallback
      error={isHttpError ? new Error(`${error.status} ${error.statusText}`) : (error as Error)}
      resetErrorBoundary={() => navigate("/")}
    />
  );
};

export default RouteErrorBoundary;
