/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// View for the SSOCallback page — pure JSX. All state/logic lives in
// presenters/useSSOCallbackPresenter.ts.
import { useSSOCallbackPresenter } from "@features/auth/presenters/useSSOCallbackPresenter";

const SSOCallback = () => {
  const { error, goToLogin } = useSSOCallbackPresenter();

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-600 font-medium mb-2">{error}</p>
          <button
            className="mt-4 underline text-sm text-slate-600 hover:text-slate-800"
            onClick={goToLogin}
          >
            Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
        <p className="text-gray-500 text-sm">Completing sign in…</p>
      </div>
    </div>
  );
};

export default SSOCallback;
