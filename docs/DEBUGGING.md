# Debugging

This document lists the tools used to debug the LeapMentor frontend, what each one is for, and how to turn it on. It is written to be readable without deep technical background: each tool has a plain-language "what it does" line first.

The app is a React 19 + Vite + TypeScript single-page app, so most debugging happens in the browser plus a few installed helpers.

## 1. Browser extensions

### React Developer Tools

- **What it does:** Lets you see the app as a tree of components (the building blocks of the UI), inspect the data each one holds (props and state), and measure what is slow (the Profiler tab).
- **Install:** Add "React Developer Tools" from the Chrome Web Store or Firefox Add-ons.
- **How to use:** Open the browser DevTools (F12) → you'll see new **Components** and **Profiler** tabs. Click any element on the page and the Components tab shows exactly which React component rendered it and with what data.
- **Notes:** Works automatically in development (`npm run dev`). No code change is needed.

### Redux DevTools

- **What it does:** Redux is where the app keeps shared data (who is logged in, onboarding progress, notifications, wallet, connect requests, etc.). This extension shows every change to that data as a list of "actions", lets you inspect the full state at any moment, and lets you "time-travel" back to a previous state.
- **Install:** Add "Redux DevTools" from the Chrome Web Store or Firefox Add-ons.
- **How to use:** Open DevTools (F12) → **Redux** tab. You'll see actions on the left and the current state on the right.
- **Why it works with no setup:** The store is created with Redux Toolkit's `configureStore` in `src/store/index.ts`. Redux Toolkit wires up the DevTools connection automatically in development, so the extension "just works" while running `npm run dev`. The store slices you can inspect are: `auth`, `menteeOnboarding`, `mentorOnboarding`, `sharedDashboard`, `dashboardUser`, `notifications`, `connectRequests`, `wallet`.

### Inspecting the store from the console

- In development only, the app also attaches the Redux store to the browser's global object (`src/main.tsx`: `globalThis.store = store`).
- This means you can open the browser **Console** and type `store.getState()` to print the entire current app state without any extension. This line is guarded by `import.meta.env.DEV`, so it never runs in production.

## 2. Built-in browser DevTools

- **Console tab — what it does:** Shows log messages and errors. Important detail for this app: the console output is **filtered for safety**. `src/lib/monitoring/logger.ts` wraps `console.log/info/warn/error` so that sensitive values (access tokens, refresh tokens, passwords, JWT-looking strings, cookies, etc.) are automatically replaced with `[REDACTED]` before they are printed. So what you see in the console is a cleaned-up version — this is intentional, not a bug.
- **Network tab — what it does:** Shows every request the app makes to the backend API and the responses. Use it to confirm a call was sent, check the status code (200 good, 401 auth, 409 conflict, 500 server error), and see the payload. API calls go through the Axios client in `src/lib/http/axiosInstance.ts`.

## 3. Error boundaries (catching crashes in the UI)

When a component crashes while rendering, these stop the whole page from going blank and show a fallback instead:

- `@sentry/react`'s `Sentry.ErrorBoundary` — the outermost wrapper in `src/main.tsx`. Shows a "Something went wrong / Try again" screen and (in production) reports the crash to Sentry.
- `src/components/shared/ErrorBoundary.tsx` — the app's own error boundary, using the `react-error-boundary` library.
- `src/app/RouteErrorBoundary.tsx` — handles errors raised while navigating between routes.

When you hit the fallback screen during development, the real error and its stack trace appear in the browser console.

## 4. Remote monitoring (for errors users hit in production)

These do not help while coding locally; they capture problems that happen after deployment, so the team can debug issues real users experienced.

### Sentry (`@sentry/react`)

- **What it does:** Automatically captures unhandled errors and crashes in the deployed app and sends them to the Sentry dashboard with stack traces.
- **Where:** `src/lib/monitoring/sentry.ts`. It is **disabled in development on purpose** (`if (import.meta.env.DEV) return;`), so it only runs in built/deployed environments.
- **Config:** Needs the `VITE_SENTRY_DSN` environment variable.

### Better Stack via Logtail (`@logtail/browser`)

- **What it does:** Ships log lines to the Better Stack logging service so the team can search them later.
- **Where:** `src/lib/monitoring/logger.ts`.
- **Important behavior:** Only `warn` and `error` levels are sent. `info` is intentionally a "do-nothing" function — success/`200`-type messages are not shipped, to avoid noise. Everything sent is shaped to the ECS (Elastic Common Schema) format so fields have predictable names (`service.*`, `error.*`, `http.*`, `trace.id`).
- **Config:** Needs the `VITE_LOGTAIL_SOURCE_TOKEN` environment variable. If the token is missing (e.g. local dev), remote logging is simply skipped — it won't crash the app.

## 5. Bundle / performance debugging

- **`npm run analyze`** — runs `source-map-explorer` over the built files in `dist/assets/*.js` to show which libraries and code take up the most space in the final bundle. Useful when the app feels heavy to load. Run `npm run build` first so `dist/` exists.
- **React DevTools Profiler** (see above) — for finding slow re-renders at runtime.

## 6. Type and lint checks (catch problems before running)

- **`npm run typecheck`** — runs TypeScript (`tsc --noEmit`) to catch type mistakes without building.
- **`npm run lint`** — runs ESLint across the codebase to catch common bugs and style issues.

These are the fastest way to catch a whole class of errors without even opening the browser.

## Quick reference

| Tool | Purpose | How to enable |
| --- | --- | --- |
| React Developer Tools | Inspect component tree, props/state, profiling | Browser extension |
| Redux DevTools | Inspect shared app state and every state change | Browser extension (auto-connected in dev) |
| `store.getState()` in console | Print full Redux state | Dev only, no install |
| Browser Console | Read logs/errors (secrets auto-redacted) | Built into browser |
| Browser Network tab | Inspect API requests/responses | Built into browser |
| Error boundaries | Catch UI crashes, show fallback | Already wired in `main.tsx` |
| Sentry | Capture production crashes | `VITE_SENTRY_DSN`, prod only |
| Better Stack / Logtail | Ship warn/error logs remotely | `VITE_LOGTAIL_SOURCE_TOKEN` |
| `npm run analyze` | Find large bundle chunks | Run after `npm run build` |
| `npm run typecheck` / `npm run lint` | Catch type/lint errors early | npm scripts |
