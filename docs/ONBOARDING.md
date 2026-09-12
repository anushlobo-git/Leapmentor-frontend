# Onboarding

This covers technical setup only. Team processes, tool access, and communication channels are out of scope and must be added by a team member. The production frontend is TypeScript-based; see [TYPESCRIPT_MIGRATION.md](TYPESCRIPT_MIGRATION.md) for migration boundaries and compiler policy.

## Clone And Install

```bash
git clone <repo-url>
cd Leapmentor-frontend
npm install
```

## Environment Variables

Create a `.env` file in the frontend root.

| Variable                    | Used by                                                                                        | Notes                                                                                                                                                        |
| --------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `VITE_API_BASE_URL`         | `src/lib/axiosInstance.ts`, `src/lib/adminAxiosInstance.ts`, most feature `api/*.api.ts` files | Base URL for the backend API. Not documented in the repo beyond the default localhost fallback, so the real value needs input from whoever runs the backend. |
| `VITE_ADMIN_API_BASE_URL`   | `src/lib/axiosInstance.ts`, admin `api/*.api.ts` files | Optional override for cookie-authenticated admin API traffic. It must include the version prefix when applicable (for example `http://localhost:5000/api/v1`). Defaults to `VITE_API_BASE_URL`. |
| `VITE_SOCKET_URL`           | Mentioned in the README and app setup docs                                                     | Socket endpoint expected by the app documentation.                                                                                                           |
| `VITE_API_SOCKET_URL`       | `src/features/notifications/hooks/useSocketToast.ts`                                           | The code currently reads this name, so it should be kept in sync with `VITE_SOCKET_URL` or normalized in a later code pass.                                  |
| `VITE_GOOGLE_CLIENT_ID`     | `src/features/auth/hooks/useGoogleAuth.ts`                                                     | Google OAuth client ID. Needs input from the identity-provider owner.                                                                                        |
| `VITE_VAPID_PUBLIC_KEY`     | `src/features/notifications/hooks/usePushNotification.ts`                                      | Push notification public key. Needs input from whoever manages web push.                                                                                     |
| `VITE_LOGTAIL_SOURCE_TOKEN` | `src/lib/logger.ts`                                                                            | Logtail browser source token. Needs input from the logging owner.                                                                                            |

## Run

```bash
npm run dev
```

`npm start` does the same thing as `npm run dev`; both start the Vite dev server.

## Test

```bash
npm test
npm run test:watch
npm run test:coverage
```

Vitest uses `jsdom`, global test APIs, `src/test/setup.ts`, and V8 coverage reporting.

## Lint

```bash
npm run lint
```

## Build

```bash
npm run build
```

The production bundle is emitted into `dist/`.

## Path Aliases

Use the aliases from `vite.config.ts` and the TypeScript configuration instead of hand-writing long relative paths. As of the feature-based restructure, aliases map to top-level folders rather than the old Atomic Design tiers:

- `@app` → `src/app`
- `@features` → `src/features`
- `@components` → `src/components`
- `@lib` → `src/lib`
- `@store` → `src/store`
- `@constants` → `src/constants`
- `@config` → `src/config`
- `@test` → `src/test`

For anything inside a feature, import through `@features/<feature>/...`, e.g. `@features/mentee/hooks/useMenteeDashboard`, `@features/admin/api/admin.api`. The old `@atoms`, `@molecules`, `@organisms`, `@templates`, `@pages`, `@hooks`, `@utils`, `@api`, `@context`, and `@mappers` aliases no longer exist — every import that used them has been migrated to the new scheme.

## Auth State Architecture

Mentor and mentee auth state lives in Redux (`src/store/index.ts`, `src/features/auth/store/authSlice.ts`). The app rehydrates access state on startup in `src/app/App.tsx` using the HttpOnly refresh cookie, and the axios interceptor can refresh the access token on 401 responses.

Admin auth state lives in React context (`src/features/admin/context/AdminAuthContext.tsx`) instead of Redux. That context boots from `/admin/auth/me`, keeps admin-only session state local to the admin shell, and avoids mixing the admin session model with the mentor/mentee session model.

## Where To Look Next

- `src/app/App.tsx` for route wiring and refresh-on-load behavior
- `src/features/auth/components/ProtectedRoute.tsx` for mentor/mentee access checks
- `src/features/admin/components/AdminRoute.tsx` for admin access checks
- `src/lib/axiosInstance.ts` for refresh-token retry logic
- `docs/PROJECT_STRUCTURE.md` for the full feature-by-feature folder breakdown
