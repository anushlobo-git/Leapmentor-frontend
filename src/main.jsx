// src/main.jsx
import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux';
import store from './store/index.js';
import './index.css'
import * as Sentry from "@sentry/react";
import { ToastProvider } from './context/ToastContext.jsx'

const App = lazy(() => import('./App.jsx'))


Sentry.init({
  dsn: "https://fb4accd47575799b807ef1b990ab5ebb@o4511471540240384.ingest.de.sentry.io/4511471555575888",
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <ToastProvider>
        <Suspense fallback={null}>
          <App />
        </Suspense>
      </ToastProvider>
    </Provider>
  </StrictMode>,
)