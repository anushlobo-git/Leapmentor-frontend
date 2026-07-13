/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import { IMAGES } from "./images";

describe("images", () => {
  it("should export IMAGES object", () => {
    expect(IMAGES).toBeDefined();
    expect(typeof IMAGES).toBe("object");
  });

  it("should have LOGO property", () => {
    expect(IMAGES.LOGO).toBe("/images/logo.webp");
  });

  it("should have LOGO_PNG property", () => {
    expect(IMAGES.LOGO_PNG).toBe("/images/logo.png");
  });

  it("should have LOGIN property", () => {
    expect(IMAGES.LOGIN).toBe("/images/login.webp");
  });

  it("should have VERIFY_EMAIL property", () => {
    expect(IMAGES.VERIFY_EMAIL).toBe("/images/imageverify.webp");
  });

  it("should have all expected image paths", () => {
    expect(Object.keys(IMAGES)).toEqual([
      "LOGO",
      "LOGO_PNG",
      "LOGIN",
      "VERIFY_EMAIL",
    ]);
  });
});
