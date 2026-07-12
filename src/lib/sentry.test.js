/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import * as Sentry from "@sentry/react";

vi.mock("@sentry/react", () => ({
  init: vi.fn(),
}));

describe("sentry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not initialize Sentry in development mode", async () => {
    vi.stubEnv("DEV", true);
    vi.stubEnv("MODE", "development");

    const { initializeSentry } = await import("./sentry");
    initializeSentry();
    expect(Sentry.init).not.toHaveBeenCalled();
  });

  it("should initialize Sentry in production mode", async () => {
    vi.stubEnv("DEV", false);
    vi.stubEnv("MODE", "production");

    const { initializeSentry } = await import("./sentry");
    initializeSentry();
    expect(Sentry.init).toHaveBeenCalledWith({
      dsn: "https://fb4accd47575799b807ef1b990ab5ebb@o4511471540240384.ingest.de.sentry.io/4511471555575888",
      sendDefaultPii: true,
      environment: "production",
    });
  });

  it("should use MODE environment when available", async () => {
    vi.stubEnv("DEV", false);
    vi.stubEnv("MODE", "staging");

    const { initializeSentry } = await import("./sentry");
    initializeSentry();
    expect(Sentry.init).toHaveBeenCalledWith({
      dsn: "https://fb4accd47575799b807ef1b990ab5ebb@o4511471540240384.ingest.de.sentry.io/4511471555575888",
      sendDefaultPii: true,
      environment: "staging",
    });
  });

  it("should default to production when MODE is not set", async () => {
    vi.stubEnv("DEV", false);
    vi.stubEnv("MODE", undefined);

    const { initializeSentry } = await import("./sentry");
    initializeSentry();
    expect(Sentry.init).toHaveBeenCalledWith({
      dsn: "https://fb4accd47575799b807ef1b990ab5ebb@o4511471540240384.ingest.de.sentry.io/4511471555575888",
      sendDefaultPii: true,
      environment: "production",
    });
  });
});
