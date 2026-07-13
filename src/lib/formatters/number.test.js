import { describe, expect, it } from "vitest";
import { formatDecimal } from "./number";

describe("number formatters", () => {
  it("formats numbers with two decimal places and thousand separators", () => {
    expect(formatDecimal(1234.5)).toBe("1,234.50");
    expect(formatDecimal("2500")).toBe("2,500.00");
  });

  it("falls back to zero for falsy values", () => {
    expect(formatDecimal(0)).toBe("0.00");
    expect(formatDecimal(null)).toBe("0.00");
    expect(formatDecimal(undefined)).toBe("0.00");
  });
});
