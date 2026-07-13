/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import { slotShape } from "./sessionCardPropTypes";

describe("sessionCardPropTypes", () => {
  describe("slotShape", () => {
    it("should export slotShape as a PropTypes shape", () => {
      expect(slotShape).toBeDefined();
      expect(typeof slotShape).toBe("function");
    });

    it("should be a callable validator function", () => {
      expect(typeof slotShape).toBe("function");
      // PropTypes validators are functions that can be called
      // We just verify it's a function
    });
  });
});
