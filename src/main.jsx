import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import store from "./store/index.js";
import { injectStore } from "./utils/axiosInstance.js"; // FIX: import injectStore
import "./index.css";
import * as Sentry from "@sentry/react";
import { ToastProvider } from "./context/ToastContext.jsx";
import logger from "./utils/logger.js";

const App = lazy(() => import("./App.jsx"));

// FIX: give the Axios interceptor access to Redux store
// Must be called before any API request fires — here is the right place
injectStore(store);

if (import.meta.env.DEV) {
  globalThis.store = store;
}

Sentry.init({
  dsn: "https://fb4accd47575799b807ef1b990ab5ebb@o4511471540240384.ingest.de.sentry.io/4511471555575888",
  sendDefaultPii: true,
});

// Catch unhandled React/UI errors
globalThis.addEventListener("error", (event) => {
  logger.error("Unhandled UI Error", {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
  });
});

// Catch unhandled asynchronous errors
globalThis.addEventListener("unhandledrejection", (event) => {
  logger.error("Unhandled Promise Rejection", {
    reason: event.reason?.message || event.reason,
  });
});

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
