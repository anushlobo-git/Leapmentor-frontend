# LeapMentor — Frontend

This repository contains the frontend for LeapMentor: a mentorship platform built with React and Vite. The frontend is implemented as a modern Vite React app using a feature-based `src/` layout, centralized `lib/` helpers, and lightweight UI primitives in `src/components` and `src/ui`.

**Quick links**

- Code: [src](src)
- Docs: [docs](docs)

## What this repo contains

- A Vite + React 19 application bootstrapped for fast local development and production builds.
- Feature-based source organization under `src/features/*` (auth, mentor, mentee, sessions, reports, etc.).
- Shared UI primitives in `src/components/` and `src/ui/`.
- HTTP helpers and shared utilities in `src/lib/`.

## Requirements

- Node.js 18.x or newer
- npm 9.x or newer

See the `engines` field in package.json for the exact supported versions.

## Install

Clone the repo and install dependencies:

```bash
cd Leapmentor-frontend
npm install
```

## Environment

Create a `.env` file in the project root and provide the API and feature keys required by your environment. Typical variables used by the app:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
VITE_API_SOCKET_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_VAPID_PUBLIC_KEY=your-vapid-public-key
VITE_LOGTAIL_SOURCE_TOKEN=your-logtail-source-token
```

Do not commit secrets to version control.

## Scripts

Use the npm scripts defined in `package.json`:

- `npm run dev` / `npm start` — Start Vite dev server
- `npm run build` — Build production assets into `dist/`
- `npm run preview` — Preview the production build locally
- `npm run lint` — Run ESLint
- `npm test` — Run Vitest once
- `npm run test:watch` — Vitest in watch mode
- `npm run test:coverage` — Run tests with coverage
- `npm run analyze` — Analyze source maps for bundle sizes

Example: start the dev server

```bash
npm run dev
```

## Project structure (high level)

```text
src/
├─ app/                 # App bootstrap and top-level providers
├─ components/          # Shared presentational components
├─ config/              # Onboarding fields and static config
├─ constants/           # Shared constants and image paths
├─ features/            # Feature-based folders (auth, mentor, mentee, sessions...)
├─ lib/                 # Axios instances, mappers, cookies, logger, helpers
├─ store/               # Redux store and feature slices
├─ ui/                  # Small UI atoms and icons
├─ index.css
├─ main.jsx
└─ App.jsx
```

For more detail see [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md).

## Testing

Tests use Vitest and testing-library. There's a test setup file at `src/test/setup.js`.

Run tests:

```bash
npm test
```

## Linting

Run ESLint across the codebase:

```bash
npm run lint
```

## Notes & gotchas

- Keep backend URLs and socket URLs in `.env` as Vite environment variables (`VITE_...`).
- Do not commit real API keys or VAPID keys.

## Where to look next

- App entry: [src/main.jsx](src/main.jsx#L1)
- Top-level app: [src/app/App.jsx](src/app/App.jsx#L1)
- API helpers: [src/lib/axiosInstance.js](src/lib/axiosInstance.js#L1)
- Onboarding config: [src/config/onboardingFields.js](src/config/onboardingFields.js#L1)

If you want, I can also update or expand any of the docs in the `docs/` folder to match the new layout.
