# LeapMentor Frontend

This is the React frontend for LeapMentor, the mentorship platform that connects mentees with mentors for discovery, booking, communication, and progress tracking.

## Overview

The frontend provides:

- User authentication and onboarding screens
- Mentor discovery and search experience
- Booking and availability flow
- Real-time chat and notifications
- Mentor and mentee dashboards
- Admin views for platform management

## Tech Stack

- React 19
- Vite 7
- Redux Toolkit
- React Router
- Tailwind CSS
- Socket.IO client
- Recharts for analytics dashboards

## Project Structure

```text
src/
├── api/              # Thin axios-based API helpers for escrow and notes
├── assets/           # Static assets shipped with the app
├── atoms/            # Small reusable UI primitives
├── components/       # Feature components grouped by auth, admin, mentor, mentee, and shared dashboard
├── config/           # Static config values such as onboarding fields
├── constants/        # Shared constants, HTTP status helpers, nav items, and image paths
├── context/          # React context providers for admin auth and toast state
├── hooks/            # Reusable data-fetching and behavior hooks
├── mappers/          # Response-shaping helpers that normalize API payloads
├── molecules/        # Small composed UI blocks
├── organisms/        # Larger landing-page sections and modal assemblies
├── pages/            # Route-level screens
├── store/            # Redux store and slices
├── templates/        # Layout shells and reusable page wrappers
├── test/             # Vitest setup and test utilities
├── ui/               # Shared UI helpers and lightweight presentational components
├── utils/            # Axios clients, cookies, logging, validation, and formatting helpers
├── App.jsx           # Router, top-level providers, and route wiring
├── index.css         # Global styles and Tailwind entry styles
└── main.jsx          # App bootstrap and global error wiring
```

## Prerequisites

Before running the frontend, make sure:

- Node.js 18 or newer is installed
- The backend server is running and reachable

## Installation

```bash
cd Leapmentor-frontend
npm install
```

## Environment Variables

Create a `.env` file in the frontend root with values in the following format.

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
VITE_API_SOCKET_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_VAPID_PUBLIC_KEY=your-vapid-public-key
VITE_LOGTAIL_SOURCE_TOKEN=your-logtail-source-token
```

`VITE_API_BASE_URL` is used by the main authenticated axios client. `VITE_SOCKET_URL` is documented in the app setup, while `src/hooks/useSocketToast.js` currently reads `VITE_API_SOCKET_URL`; keep both consistent until the code is normalized.

`VITE_GOOGLE_CLIENT_ID`, `VITE_VAPID_PUBLIC_KEY`, and `VITE_LOGTAIL_SOURCE_TOKEN` are feature-dependent values that must come from the API/auth, push-notification, and logging owners respectively.

## Run Locally

```bash
npm run dev
```

The development server will typically start at `http://localhost:5173`.

`npm start` is also available and runs the same Vite dev server as `npm run dev`.

## Build

```bash
npm run build
```

This produces the production bundle in `dist/`.

## Linting

```bash
npm run lint
```

## Testing

```bash
npm test
npm run test:watch
npm run test:coverage
```

Vitest is configured in [vitest.config.js](vitest.config.js) to use the `jsdom` environment, globals, the `src/test/setup.js` setup file, and V8 coverage reporting.

## Path Aliases

The Vite and Vitest configs both expose these aliases:

- `@atoms` → `src/atoms`
- `@molecules` → `src/molecules`
- `@organisms` → `src/organisms`
- `@templates` → `src/templates`
- `@pages` → `src/pages`
- `@hooks` → `src/hooks`
- `@utils` → `src/utils`
- `@api` → `src/api`
- `@store` → `src/store`
- `@context` → `src/context`
- `@components` → `src/components`
- `@mappers` → `src/mappers`
- `@constants` → `src/constants`

## Notes

- Do not commit real API keys or secrets in the frontend environment file.
- The frontend expects the backend to be available on the configured API and socket URLs.

## Scripts

- `npm run dev` or `npm start` - start the Vite dev server
- `npm run build` - create the production bundle in `dist/`
- `npm run preview` - preview the built app locally
- `npm run lint` - run ESLint across the project
- `npm test` - run the Vitest suite once
- `npm run test:watch` - run Vitest in watch mode
- `npm run test:coverage` - run Vitest with coverage output
