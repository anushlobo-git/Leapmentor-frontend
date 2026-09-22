import { describe, it, expect } from "vitest";
import {
  EyeIconSVG,
  EyeOffIconSVG,
  getPasswordToggleIcon,
} from "./passwordIconUtils.js";

describe("passwordIconUtils.js re-exports", () => {
  it("re-exports the eye icons and toggle helper", () => {
    expect(EyeIconSVG).toBeTruthy();
    expect(EyeOffIconSVG).toBeTruthy();
    expect(getPasswordToggleIcon(true)).toBe(EyeOffIconSVG);
    expect(getPasswordToggleIcon(false)).toBe(EyeIconSVG);
  });
});
