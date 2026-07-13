/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import PeopleIcon from "./PeopleIcon";

describe("PeopleIcon", () => {
  it("should render with default size", () => {
    const { container } = render(<PeopleIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "14");
    expect(svg).toHaveAttribute("height", "14");
  });

  it("should render with custom size", () => {
    const { container } = render(<PeopleIcon size={20} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "20");
    expect(svg).toHaveAttribute("height", "20");
  });

  it("should have correct viewBox", () => {
    const { container } = render(<PeopleIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
  });

  it("should have fill none", () => {
    const { container } = render(<PeopleIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("fill", "none");
  });

  it("should have stroke white", () => {
    const { container } = render(<PeopleIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("stroke", "white");
  });

  it("should have correct strokeWidth", () => {
    const { container } = render(<PeopleIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("stroke-width", "2.5");
  });

  it("should render path elements", () => {
    const { container } = render(<PeopleIcon />);
    const paths = container.querySelectorAll("path");
    expect(paths).toHaveLength(3);
  });

  it("should render circle element", () => {
    const { container } = render(<PeopleIcon />);
    const circle = container.querySelector("circle");
    expect(circle).toBeInTheDocument();
    expect(circle).toHaveAttribute("cx", "9");
    expect(circle).toHaveAttribute("cy", "7");
    expect(circle).toHaveAttribute("r", "4");
  });

  it("should have correct first path", () => {
    const { container } = render(<PeopleIcon />);
    const paths = container.querySelectorAll("path");
    expect(paths[0]).toHaveAttribute("d", "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2");
  });
});
