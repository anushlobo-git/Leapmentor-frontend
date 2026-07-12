/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import store from "@store/index";
import { injectStore } from "@lib/axiosInstance"; // FIX: import injectStore
import "./index.css";
import { ToastProvider } from "@app/providers/ToastContext";
import { initializeSentry } from "@lib/sentry";

const App = lazy(() => import("@app/App"));

// FIX: give the Axios interceptor access to Redux store
// Must be called before any API request fires — here is the right place
injectStore(store);

if (import.meta.env.DEV) {
  globalThis.store = store;
}

initializeSentry();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <ToastProvider>
        <Suspense fallback={null}>
          <App />
        </Suspense>
      </ToastProvider>
    </Provider>
  </StrictMode>,
);
