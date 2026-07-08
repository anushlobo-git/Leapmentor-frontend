# Deployment

This repository ships a frontend build only. There is no CI/CD workflow checked in.

## Build

```bash
npm run build
```

The build output goes to `dist/`.

## Runtime And Build Environment Variables

Values observed in the codebase via `import.meta.env`:

- `VITE_API_BASE_URL`
- `VITE_SOCKET_URL`
- `VITE_API_SOCKET_URL`
- `VITE_GOOGLE_CLIENT_ID`
- `VITE_VAPID_PUBLIC_KEY`
- `VITE_LOGTAIL_SOURCE_TOKEN`

The repo does not document real values for these. Any non-local deployment needs those values from the API, identity, push, and logging owners.

## Dockerfile

The root `Dockerfile` does the following:

1. Starts from `node:20-alpine`.
2. Sets `/app` as the working directory.
3. Copies `package*.json` and runs `npm ci`.
4. Copies the rest of the repository into the image.
5. Sets `NODE_ENV=production`.
6. Runs `npm run build` to produce the frontend bundle.
7. Exposes port `5173`.
8. Starts the preview server with `npm run preview -- --host 0.0.0.0 --port 5173`.

## CI/CD

No CI/CD configuration is present in the repository tree provided here. There is no `.github/workflows` directory or equivalent pipeline config checked in.
