# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# These values are public browser configuration, not private credentials. The
# defaults keep the image usable behind a same-origin ingress. Override them at
# build time for a deployment with a different public route.
ARG VITE_API_BASE_URL=/api/v1
ARG VITE_ADMIN_API_BASE_URL=/api/v1
ARG VITE_API_URL=/api/v1
ARG VITE_API_SOCKET_URL=/
ARG VITE_GOOGLE_CLIENT_ID=
ARG VITE_VAPID_PUBLIC_KEY=
ARG VITE_SENTRY_DSN=
ARG VITE_LOGTAIL_SOURCE_TOKEN=

ENV NODE_ENV=production \
    VITE_API_BASE_URL=${VITE_API_BASE_URL} \
    VITE_ADMIN_API_BASE_URL=${VITE_ADMIN_API_BASE_URL} \
    VITE_API_URL=${VITE_API_URL} \
    VITE_API_SOCKET_URL=${VITE_API_SOCKET_URL} \
    VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID} \
    VITE_VAPID_PUBLIC_KEY=${VITE_VAPID_PUBLIC_KEY} \
    VITE_SENTRY_DSN=${VITE_SENTRY_DSN} \
    VITE_LOGTAIL_SOURCE_TOKEN=${VITE_LOGTAIL_SOURCE_TOKEN}

RUN npm run build

FROM docker.io/nginxinc/nginx-unprivileged:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html

USER 101
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:8080/health/live || exit 1

CMD ["nginx", "-g", "daemon off;"]
