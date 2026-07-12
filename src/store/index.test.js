/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect, vi } from "vitest";
import store from "./index";

describe("Redux Store Configuration", () => {
  it("should have a store instance", () => {
    expect(store).toBeDefined();
    expect(typeof store).toBe("object");
  });

  it("should have a dispatch function", () => {
    expect(store.dispatch).toBeDefined();
    expect(typeof store.dispatch).toBe("function");
  });

  it("should have a getState function", () => {
    expect(store.getState).toBeDefined();
    expect(typeof store.getState).toBe("function");
  });

  it("should have a subscribe function", () => {
    expect(store.subscribe).toBeDefined();
    expect(typeof store.subscribe).toBe("function");
  });

  it("should have correct reducer structure", () => {
    const state = store.getState();
    expect(state).toHaveProperty("auth");
    expect(state).toHaveProperty("menteeOnboarding");
    expect(state).toHaveProperty("mentorOnboarding");
    expect(state).toHaveProperty("sharedDashboard");
    expect(state).toHaveProperty("dashboardUser");
  });

  it("should return initial state", () => {
    const state = store.getState();
    expect(state).toBeDefined();
    expect(typeof state).toBe("object");
  });
});
