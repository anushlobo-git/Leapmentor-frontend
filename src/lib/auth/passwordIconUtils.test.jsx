/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import {
  EyeIconSVG,
  EyeOffIconSVG,
  getPasswordToggleIcon,
} from "./passwordIconUtils";

describe("passwordIconUtils", () => {
  describe("EyeIconSVG", () => {
    it("should render eye icon SVG", () => {
      const { container } = render(EyeIconSVG);
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute("width", "16");
      expect(svg).toHaveAttribute("height", "16");
      expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
      expect(svg).toHaveAttribute("fill", "none");
      expect(svg).toHaveAttribute("stroke", "currentColor");
      expect(svg).toHaveAttribute("stroke-width", "2");
    });

    it("should have correct path and circle elements", () => {
      const { container } = render(EyeIconSVG);
      const paths = container.querySelectorAll("path");
      expect(paths).toHaveLength(1);
      const circles = container.querySelectorAll("circle");
      expect(circles).toHaveLength(1);
    });
  });

  describe("EyeOffIconSVG", () => {
    it("should render eye off icon SVG", () => {
      const { container } = render(EyeOffIconSVG);
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute("width", "16");
      expect(svg).toHaveAttribute("height", "16");
      expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
      expect(svg).toHaveAttribute("fill", "none");
      expect(svg).toHaveAttribute("stroke", "currentColor");
      expect(svg).toHaveAttribute("stroke-width", "2");
    });

    it("should have correct path and line elements", () => {
      const { container } = render(EyeOffIconSVG);
      const paths = container.querySelectorAll("path");
      expect(paths).toHaveLength(2);
      const lines = container.querySelectorAll("line");
      expect(lines).toHaveLength(1);
    });
  });

  describe("getPasswordToggleIcon", () => {
    it("should return EyeOffIconSVG when isVisible is true", () => {
      const result = getPasswordToggleIcon(true);
      expect(result).toBe(EyeOffIconSVG);
    });

    it("should return EyeIconSVG when isVisible is false", () => {
      const result = getPasswordToggleIcon(false);
      expect(result).toBe(EyeIconSVG);
    });

    it("should return EyeIconSVG when isVisible is undefined", () => {
      const result = getPasswordToggleIcon(undefined);
      expect(result).toBe(EyeIconSVG);
    });

    it("should return EyeIconSVG when isVisible is null", () => {
      const result = getPasswordToggleIcon(null);
      expect(result).toBe(EyeIconSVG);
    });

    it("should return EyeIconSVG when isVisible is 0", () => {
      const result = getPasswordToggleIcon(0);
      expect(result).toBe(EyeIconSVG);
    });

    it("should return EyeOffIconSVG when isVisible is 1", () => {
      const result = getPasswordToggleIcon(1);
      expect(result).toBe(EyeOffIconSVG);
    });

    it("should return EyeIconSVG when isVisible is empty string", () => {
      const result = getPasswordToggleIcon("");
      expect(result).toBe(EyeIconSVG);
    });

    it("should return EyeOffIconSVG when isVisible is non-empty string", () => {
      const result = getPasswordToggleIcon("true");
      expect(result).toBe(EyeOffIconSVG);
    });
  });
});
