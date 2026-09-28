/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import SessionSkeleton from "./SessionSkeleton";

describe("SessionSkeleton", () => {
  it("should render the default (non-compact) skeleton with the button placeholder", () => {
    const { container } = render(<SessionSkeleton />);

    expect(container.querySelector(".w-11.h-14")).not.toBeNull();
    expect(container.querySelector(".h-8.w-24")).not.toBeNull();
    expect(container.firstChild.className).toContain("px-4 py-3.5");
  });

  it("should render the compact skeleton without the button placeholder", () => {
    const { container } = render(<SessionSkeleton size="compact" />);

    expect(container.querySelector(".w-9.h-11")).not.toBeNull();
    expect(container.querySelector(".h-8.w-24")).toBeNull();
    expect(container.firstChild.className).toContain("px-3 py-2.5");
  });

  it("should default to the non-compact layout when no size prop is passed", () => {
    const { container } = render(<SessionSkeleton />);

    expect(container.querySelector(".w-11.h-14")).not.toBeNull();
  });
});
