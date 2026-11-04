# LeapMentor Frontend

The LeapMentor frontend is a React 19, TypeScript, and Vite single-page
application. It provides the browser UI for mentors, mentees, and
administrators. Backend APIs and realtime services run separately.

## Requirements

- Node.js `>=18 <23`
- npm `>=9`

## Run locally with Vite

Install dependencies and start the development server:

```bash
npm ci
npm run dev
```

Open the URL Vite prints, normally [http://localhost:5173](http://localhost:5173).
The frontend does not start the backend. When using the local microservices
gateway, configure the API and Socket.IO URLs to point to
`http://localhost:8080`; setup and container instructions are in
[`../services/CONTAINER_BUILD.md`](../services/CONTAINER_BUILD.md).

## Configure the frontend

Copy [`.env.example`](./.env.example) to `.env` and set values for the local
environment. Vite exposes `VITE_*` values in the browser bundle, so only put
public configuration here—never backend secrets, private API keys, or signing
credentials.

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | API base URL, including `/api/v1`; defaults to `http://localhost:5000/api/v1`. |
| `VITE_ADMIN_API_BASE_URL` | Optional admin API base URL; defaults to `VITE_API_BASE_URL`. |
| `VITE_API_URL` | Compatibility build argument accepted by the Dockerfile; the frontend's current HTTP clients use `VITE_API_BASE_URL`. |
| `VITE_API_SOCKET_URL` | Socket.IO endpoint; defaults in the app to `http://localhost:5000`. Use `/` when the frontend and gateway share an origin. |
| `VITE_GOOGLE_CLIENT_ID` | Public Google OAuth client ID; optional unless enabling Google sign-in. |
| `VITE_VAPID_PUBLIC_KEY` | Public VAPID key for web push subscriptions. |
| `VITE_SENTRY_DSN` | Optional browser error reporting configuration. |
| `VITE_LOGTAIL_SOURCE_TOKEN` | Optional browser log shipping configuration. |
| `VITE_APP_BASE_URL` | Public app URL included in the environment template for browser-facing integrations. |

For Vite development with the local microservices gateway, set
`VITE_API_BASE_URL=http://localhost:8080/api/v1` and
`VITE_API_SOCKET_URL=http://localhost:8080`. Relative values `/api/v1` and `/`
are appropriate when the frontend is served on the same origin as the gateway,
as in the container deployment. Vite reads environment values when it starts,
so restart the dev server after changing `.env`.

## Production build

Build and preview the static production bundle:

```bash
npm run typecheck
npm run build
npm run preview
```

The build is written to `dist/`. Vite preview normally serves it at
`http://localhost:4173`.

The frontend Dockerfile builds the Vite bundle and serves it with
unprivileged NGINX on port `8080`. Its default API settings are same-origin,
which is appropriate when a gateway routes frontend and API requests together.
Browser configuration is embedded at image build time; pass only public
`VITE_*` values as Docker build arguments. See
[`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) and
[`../services/CONTAINER_BUILD.md`](../services/CONTAINER_BUILD.md).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` / `npm start` | Start the Vite development server |
| `npm run build` | Create the production bundle in `dist/` |
| `npm run preview` | Serve the built bundle locally |
| `npm run typecheck` | Run TypeScript checks without emitting files |
| `npm run lint` | Run ESLint |
| `npm test` | Run Vitest once |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run test:coverage` | Run tests with coverage |
| `npm run analyze` | Analyze built JavaScript bundle sizes |

## Project layout

```text
src/
├── app/          # App bootstrap and top-level providers
├── components/   # Shared presentational components
├── config/       # Application configuration
├── constants/    # Shared constants
├── features/     # Auth, mentor, mentee, sessions, admin, and other features
├── lib/          # HTTP, monitoring, mapping, and shared utilities
├── store/        # Redux store and feature slices
├── ui/           # Reusable UI primitives
└── main.tsx      # Browser entry point
docs/             # Setup, architecture, testing, debugging, and deployment guides
```

## Tests and further documentation

Tests use Vitest, jsdom, and Testing Library. Run `npm test` for a single
complete test run. See [`docs/TESTING.md`](./docs/TESTING.md) for test guidance.

- [Setup guide](./docs/SETUP.md)
- [Project structure](./docs/PROJECT_STRUCTURE.md)
- [Testing](./docs/TESTING.md)
- [Debugging](./docs/DEBUGGING.md)
- [Deployment](./docs/DEPLOYMENT.md)
- [Onboarding](./docs/ONBOARDING.md)
- [Branching and Git flow](./docs/BRANCHING.md)
