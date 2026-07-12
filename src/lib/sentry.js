/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import * as Sentry from "@sentry/react";

export const initializeSentry = () => {
  if (import.meta.env.DEV) return;

  Sentry.init({
    dsn: "https://fb4accd47575799b807ef1b990ab5ebb@o4511471540240384.ingest.de.sentry.io/4511471555575888",
    sendDefaultPii: true,
    environment: import.meta.env.MODE || "production",
  });
};

export default initializeSentry;
