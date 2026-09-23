/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/components/shared/ErrorBoundary.jsx
import type { ReactNode } from "react";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";
import type { FallbackProps } from "react-error-boundary";
import * as Sentry from "@sentry/react";
import logger from "@lib/monitoring/logger";

// ── All actual UI/markup lives here, as a plain function component ──
// react-error-boundary calls this with { error, resetErrorBoundary } —
// resetErrorBoundary is the library's own reset function, supplied to us
// rather than something we have to build ourselves.
export const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  const handleGoHome = () => {
    logger.info("ErrorBoundary reset — navigating to homepage");
    // Clear the boundary's internal error state first, then leave the page —
    // if the redirect were ever blocked/slow, the boundary shouldn't be left
    // stuck mid-reset.
    resetErrorBoundary();
    globalThis.location.href = "/";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-slate-100 text-center">
        <div>
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-rose-100 text-rose-600 animate-pulse">
            <svg
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-2xl font-extrabold text-slate-900 tracking-tight">
            Something went wrong
          </h2>
          <p className="mt-3 text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            An unexpected error occurred. Don't worry, our team has been
            notified. Let's get you back on track.
          </p>
          {error && (
            <div className="mt-4 p-3 bg-rose-50 border border-rose-100 rounded-lg text-left text-xs font-mono text-rose-700 max-h-32 overflow-y-auto break-all">
              {error.toString()}
            </div>
          )}
        </div>
        <div>
          <button
            onClick={handleGoHome}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    </div>
  );
};

interface ErrorBoundaryProps {
  children: ReactNode;
  // Route-level usage passes resetKeys={[location.pathname]} so the
  // boundary automatically clears a stuck error when the user navigates
  // to a different route, instead of requiring a full page reload.
  resetKeys?: unknown[];
}

/**
 * Thin wrapper around `react-error-boundary`'s <ErrorBoundary>.
 *
 * React requires error boundaries to be class components — there is no
 * hooks/function-component equivalent of getDerivedStateFromError /
 * componentDidCatch in stable React. This used to be a hand-written class
 * doing that work directly; `react-error-boundary` is the library React's
 * own docs point to for exactly this situation — it owns the class
 * internally so nothing in this codebase has to, while still giving us a
 * plain function-component API (FallbackComponent, onError, resetKeys)
 * to configure it.
 *
 * The component is kept as a named wrapper (rather than importing
 * react-error-boundary directly at every call site) so:
 *   - the default export name, and the `children`/`resetKeys` props,
 *     stay identical to before — App.tsx and main.tsx did not need to
 *     change at all.
 *   - the Sentry reporting + logging behavior stays defined in one place.
 */
const ErrorBoundary = ({ children, resetKeys }: ErrorBoundaryProps) => (
  <ReactErrorBoundary
    FallbackComponent={ErrorFallback}
    resetKeys={resetKeys}
    onError={(error: unknown, info) => {
      const message = error instanceof Error ? error.message : String(error);
      logger.error("ErrorBoundary caught an error:", {
        error: message,
        errorInfo: info,
      });
      // This boundary (not Sentry's own) is what renders on error, so
      // report to Sentry explicitly here to keep error monitoring coverage.
      Sentry.captureException(error);
    }}
  >
    {children}
  </ReactErrorBoundary>
);

export default ErrorBoundary;
