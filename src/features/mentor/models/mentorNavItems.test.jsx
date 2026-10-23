/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import { MENTOR_NAV_ITEMS } from "./mentorNavItems.jsx";

describe("mentorNavItems", () => {
  it("should export MENTOR_NAV_ITEMS array with correct structure", () => {
    expect(MENTOR_NAV_ITEMS).toBeDefined();
    expect(Array.isArray(MENTOR_NAV_ITEMS)).toBe(true);
    expect(MENTOR_NAV_ITEMS).toHaveLength(7);
  });

  it("should have all required nav items with correct keys", () => {
    const keys = MENTOR_NAV_ITEMS.map((item) => item.key);
    expect(keys).toEqual([
      "home",
      "profile",
      "availability",
      "notifications",
      "requests",
      "connects",
      "earnings",
    ]);
  });

  it("should have all required nav items with correct labels", () => {
    const labels = MENTOR_NAV_ITEMS.map((item) => item.label);
    expect(labels).toEqual([
      "Home",
      "Profile",
      "Availability",
      "Notifications",
      "Requests",
      "Connects",
      "Track Earnings",
    ]);
  });

  it("should have icon property for each nav item", () => {
    MENTOR_NAV_ITEMS.forEach((item) => {
      expect(item).toHaveProperty("icon");
      expect(item.icon).toBeDefined();
    });
  });

  it("should have home item with correct properties", () => {
    const homeItem = MENTOR_NAV_ITEMS[0];
    expect(homeItem.key).toBe("home");
    expect(homeItem.label).toBe("Home");
    expect(homeItem.icon).toBeDefined();
  });

  it("should have profile item with correct properties", () => {
    const profileItem = MENTOR_NAV_ITEMS[1];
    expect(profileItem.key).toBe("profile");
    expect(profileItem.label).toBe("Profile");
    expect(profileItem.icon).toBeDefined();
  });

  it("should have availability item with correct properties", () => {
    const availabilityItem = MENTOR_NAV_ITEMS[2];
    expect(availabilityItem.key).toBe("availability");
    expect(availabilityItem.label).toBe("Availability");
    expect(availabilityItem.icon).toBeDefined();
  });

  it("should have notifications item with correct properties", () => {
    const notificationsItem = MENTOR_NAV_ITEMS[3];
    expect(notificationsItem.key).toBe("notifications");
    expect(notificationsItem.label).toBe("Notifications");
    expect(notificationsItem.icon).toBeDefined();
  });

  it("should have requests item with correct properties", () => {
    const requestsItem = MENTOR_NAV_ITEMS[4];
    expect(requestsItem.key).toBe("requests");
    expect(requestsItem.label).toBe("Requests");
    expect(requestsItem.icon).toBeDefined();
  });

  it("should have connects item with correct properties", () => {
    const connectsItem = MENTOR_NAV_ITEMS[5];
    expect(connectsItem.key).toBe("connects");
    expect(connectsItem.label).toBe("Connects");
    expect(connectsItem.icon).toBeDefined();
  });

  it("should have earnings item with correct properties", () => {
    const earningsItem = MENTOR_NAV_ITEMS[6];
    expect(earningsItem.key).toBe("earnings");
    expect(earningsItem.label).toBe("Track Earnings");
    expect(earningsItem.icon).toBeDefined();
  });
});
