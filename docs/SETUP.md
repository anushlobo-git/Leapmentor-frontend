# Setup & Running the Server

This is the practical, start-to-finish guide for getting the LeapMentor frontend running on your machine — from a fresh clone to a live dev server, plus how to build and serve the production version.

> File naming note: this is the "server setup" document. It is named `SETUP.md` to match the project's other doc names; it covers exactly what "server setup" means for this frontend — installing, configuring, and running the app's dev and preview servers.

## What kind of server is this?

This project is a **frontend** app (React + Vite). "Running the server" here means running the **Vite dev server** while developing, or the **Vite preview server** for a production-like run. The app talks to a separate backend API over HTTP and sockets — the backend is a different service and is not started by these steps.

## Prerequisites

- **Node.js 18.x–22.x** (the `engines` field requires `>=18 <23`)
- **npm 9.x or newer**
- The **backend API** running and reachable (default `http://localhost:5000`), or valid URLs to a hosted backend. Without it, the UI loads but data calls fail.

Check your versions:

```bash
node -v
npm -v
```

## 1. Get the code and install

```bash
git clone <repo-url>
cd Leapmentor-frontend
npm install
```

## 2. Configure environment variables

Create a `.env` file in `Leapmentor-frontend/`. All frontend variables must start with `VITE_` (that is how Vite exposes them to the app).

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_ADMIN_API_BASE_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
VITE_API_SOCKET_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_VAPID_PUBLIC_KEY=your-vapid-public-key
VITE_LOGTAIL_SOURCE_TOKEN=your-logtail-source-token
VITE_SENTRY_DSN=your-sentry-dsn
```

What they are for:

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | Base URL of the backend API. Used by the Axios clients and feature API modules. |
| `VITE_ADMIN_API_BASE_URL` | Optional override for cookie-authenticated `/admin/*` traffic. Defaults to `VITE_API_BASE_URL`. Include the `/api/v1` prefix. |
| `VITE_SOCKET_URL` / `VITE_API_SOCKET_URL` | Socket.IO endpoint for real-time features (notifications, chat). Keep both in sync. |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth login. |
| `VITE_VAPID_PUBLIC_KEY` | Web push notifications. |
| `VITE_LOGTAIL_SOURCE_TOKEN` | Ships warn/error logs to Better Stack (optional; skipped if absent). |
| `VITE_SENTRY_DSN` | Production error monitoring (Sentry is off in dev). |

Notes:
- **Never commit `.env`** — it is git-ignored. Real values for Google/VAPID/Logtail/Sentry come from whoever owns those services.
- Missing optional keys (Logtail, Sentry) won't crash local dev; the app degrades gracefully.
- See [ONBOARDING.md](ONBOARDING.md) for a per-variable "used by which file" breakdown.

## 3. Run the dev server

```bash
npm run dev
```

- Starts the Vite dev server (default at `http://localhost:5173`).
- Hot-reloads the page as you edit files.
- `npm start` does the exact same thing as `npm run dev`.

Open the printed URL in your browser. React DevTools and Redux DevTools work automatically here (see [DEBUGGING.md](DEBUGGING.md)).

## 4. Build the production bundle

```bash
npm run typecheck   # optional but recommended: catches type errors first
npm run build       # compiles optimized static files into dist/
```

The output in `dist/` is plain static files (HTML/CSS/JS) that any static host or CDN can serve.

## 5. Preview the production build locally

```bash
npm run preview
```

This serves the built `dist/` files the way production would, so you can sanity-check the real build before deploying.

## Running with Docker

The repo includes a root `Dockerfile` that builds the app and serves it with the preview server on port `5173`:

```bash
docker build -t leapmentor-frontend .
docker run -p 5173:5173 leapmentor-frontend
```

(Environment variables baked at build time must be provided to the build step. See [DEPLOYMENT.md](DEPLOYMENT.md).)

## All available scripts

| Command | What it does |
| --- | --- |
| `npm run dev` / `npm start` | Start the Vite dev server |
| `npm run build` | Build production assets into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking (no output files) |
| `npm test` | Run the test suite once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with a coverage report |
| `npm run analyze` | Inspect production bundle sizes |

## Common issues

- **Blank page / API calls fail:** the backend isn't running or `VITE_API_BASE_URL` is wrong. Check the browser Network tab.
- **`.env` changes not taking effect:** restart the dev server — Vite reads env vars at startup.
- **Node version errors on install:** confirm `node -v` is within `>=18 <23`.
- **Port 5173 in use:** stop the other process, or Vite will offer the next free port.

## Related docs

- [ONBOARDING.md](ONBOARDING.md) — first-time setup and path aliases
- [DEBUGGING.md](DEBUGGING.md) — debugging tools
- [TESTING.md](TESTING.md) — running and writing tests
- [DEPLOYMENT.md](DEPLOYMENT.md) — building and shipping
- [BRANCHING.md](BRANCHING.md) — git workflow
