/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { TokenIcon, LockIcon } from "./PaymentIcons";

describe("PaymentIcons", () => {
  describe("TokenIcon", () => {
    it("should render with default size", () => {
      const { container } = render(<TokenIcon />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("width", "13");
      expect(svg).toHaveAttribute("height", "13");
    });

    it("should render with custom size", () => {
      const { container } = render(<TokenIcon size={20} />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("width", "20");
      expect(svg).toHaveAttribute("height", "20");
    });

    it("should have correct viewBox", () => {
      const { container } = render(<TokenIcon />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
    });

    it("should have fill none", () => {
      const { container } = render(<TokenIcon />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("fill", "none");
    });

    it("should have stroke currentColor", () => {
      const { container } = render(<TokenIcon />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("stroke", "currentColor");
    });

    it("should have correct strokeWidth", () => {
      const { container } = render(<TokenIcon />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("stroke-width", "2");
    });

    it("should render circle element", () => {
      const { container } = render(<TokenIcon />);
      const circle = container.querySelector("circle");
      expect(circle).toBeInTheDocument();
      expect(circle).toHaveAttribute("cx", "12");
      expect(circle).toHaveAttribute("cy", "12");
      expect(circle).toHaveAttribute("r", "10");
    });

    it("should render path elements", () => {
      const { container } = render(<TokenIcon />);
      const paths = container.querySelectorAll("path");
      expect(paths).toHaveLength(1);
    });
  });

  describe("LockIcon", () => {
    it("should render with default size", () => {
      const { container } = render(<LockIcon />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("width", "13");
      expect(svg).toHaveAttribute("height", "13");
    });

    it("should render with custom size", () => {
      const { container } = render(<LockIcon size={20} />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("width", "20");
      expect(svg).toHaveAttribute("height", "20");
    });

    it("should have correct viewBox", () => {
      const { container } = render(<LockIcon />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
    });

    it("should have fill none", () => {
      const { container } = render(<LockIcon />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("fill", "none");
    });

    it("should have stroke currentColor", () => {
      const { container } = render(<LockIcon />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("stroke", "currentColor");
    });

    it("should have correct strokeWidth", () => {
      const { container } = render(<LockIcon />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("stroke-width", "2");
    });

    it("should render rect element", () => {
      const { container } = render(<LockIcon />);
      const rect = container.querySelector("rect");
      expect(rect).toBeInTheDocument();
      expect(rect).toHaveAttribute("x", "3");
      expect(rect).toHaveAttribute("y", "11");
    });

    it("should render path element", () => {
      const { container } = render(<LockIcon />);
      const path = container.querySelector("path");
      expect(path).toBeInTheDocument();
      expect(path).toHaveAttribute("d", "M7 11V7a5 5 0 0 1 10 0v4");
    });
  });
});
