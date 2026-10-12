/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/app/RouteErrorBoundary.tsx
//
// This is the "safety net" screen. If any page or its data-loader CRASHES,
// React Router shows THIS component instead of a blank white screen.
// It's attached as `errorElement` on the root route and on each group
// (mentor, mentee, admin, shared-dashboard), so a crash in one section
// shows this screen while the rest of the app still works.
//
// Used as the `errorElement` on the root route and on each guarded group
// (mentor, mentee, admin, shared-dashboard) — a crash inside one group
// shows this, while the rest of the app (e.g. navigating back to "/")
// keeps working.
import { useEffect } from "react";
// Three helpers from React Router:
//  - useRouteError:        gives us the actual error that was thrown
//  - useNavigate:          lets us send the user somewhere (e.g. back home)
//  - isRouteErrorResponse: tells us "is this an HTTP error like 404/403?"
import { isRouteErrorResponse, useNavigate, useRouteError } from "react-router-dom";
import * as Sentry from "@sentry/react";
import logger from "@lib/monitoring/logger";
import { ErrorFallback } from "@components/shared/ErrorBoundary";
import NotFound from "@app/pages/NotFound";

const RouteErrorBoundary = () => {
  // Grab the error that caused this screen to show.
  const error = useRouteError();
  const navigate = useNavigate();
  // Is this a "real HTTP problem" (404 not found, 403 forbidden, etc.)
  // rather than a code bug? true/false.
  const isHttpError = isRouteErrorResponse(error);

  useEffect(() => {
    // If it's just a 404/403 (expected, not a bug), stop here —
    // no need to alert developers about it.
    if (isHttpError) return; // 404/expected — not a bug, don't report it
    let message: string;
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === "string") {
      message = error;
    } else {
      try {
        message = JSON.stringify(error) ?? "Unknown error";
      } catch {
        message = "Unknown error";
      }
    }
    logger.error("Route error boundary caught an error:", { error: message });
    // ...and send the full error to Sentry so developers get notified.
    Sentry.captureException(error);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- report once per error instance
  }, [error]);

  // If it's a 404 (page doesn't exist) or 403 (not allowed),
  // just show the same friendly "Not Found" page as a bad URL.
  // We don't scare the user with a crash screen for these.
  if (isHttpError && (error.status === 404 || error.status === 403)) {
    return <NotFound />;
  }

  return (
    <ErrorFallback
      error={isHttpError ? new Error(`${error.status} ${error.statusText}`) : error}
      // The "Try again / Go home" button sends the user back to the homepage,
      // which also clears this error screen.
      resetErrorBoundary={() => navigate("/")}
    />
  );
};

export default RouteErrorBoundary;
