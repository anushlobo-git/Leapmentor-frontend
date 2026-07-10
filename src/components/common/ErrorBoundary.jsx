/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/components/common/ErrorBoundary.jsx
import React from "react";
import logger from "@lib/logger";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Note: We can integrate with a real logger/reporting service here if available
    logger.error("ErrorBoundary caught an error:", { error: error.message || error, errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    logger.info("ErrorBoundary reset — navigating to homepage");
    globalThis.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
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
              {this.state.error && (
                <div className="mt-4 p-3 bg-rose-50 border border-rose-100 rounded-lg text-left text-xs font-mono text-rose-700 max-h-32 overflow-y-auto break-all">
                  {this.state.error.toString()}
                </div>
              )}
            </div>
            <div>
              <button
                onClick={this.handleReset}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                Go to Homepage
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
