/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import * as Sentry from "@sentry/react";

export const initializeSentry = () => {
  if (import.meta.env.DEV) return;

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    sendDefaultPii: true,
    environment: import.meta.env.MODE || "production",
  });
};

export default initializeSentry;
