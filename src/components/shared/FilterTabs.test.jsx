/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FilterTabs from "./FilterTabs";

describe("FilterTabs", () => {
  const tabs = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "completed", label: "Completed" },
  ];

  it("should render all tabs", () => {
    render(<FilterTabs tabs={tabs} activeTab="all" onChange={() => {}} />);
    expect(screen.getByText("All")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
  });

  it("should highlight active tab", () => {
    render(<FilterTabs tabs={tabs} activeTab="active" onChange={() => {}} />);
    const activeButton = screen.getByText("Active");
    expect(activeButton).toHaveClass("text-blue-900");
    expect(activeButton).toHaveClass("border-blue-900");
  });

  it("should call onChange when tab is clicked", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<FilterTabs tabs={tabs} activeTab="all" onChange={handleChange} />);
    
    await user.click(screen.getByText("Active"));
    expect(handleChange).toHaveBeenCalledWith("active");
  });

  it("should render count badges when counts are provided", () => {
    render(
      <FilterTabs 
        tabs={tabs} 
        activeTab="all" 
        onChange={() => {}} 
        counts={{ all: 10, active: 5, completed: 3 }} 
      />
    );
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("should not render badge when count is 0", () => {
    render(
      <FilterTabs 
        tabs={tabs} 
        activeTab="all" 
        onChange={() => {}} 
        counts={{ all: 0, active: 5 }} 
      />
    );
    const allButton = screen.getByText("All");
    expect(allButton.textContent).not.toContain("0");
  });

  it("should not render badge when count is not provided", () => {
    render(<FilterTabs tabs={tabs} activeTab="all" onChange={() => {}} />);
    const allButton = screen.getByText("All");
    expect(allButton.textContent).toBe("All");
  });

  it("should use default badge class", () => {
    render(
      <FilterTabs 
        tabs={tabs} 
        activeTab="active" 
        onChange={() => {}} 
        counts={{ active: 5 }} 
      />
    );
    const badge = screen.getByText("5");
    expect(badge).toHaveClass("bg-blue-900");
    expect(badge).toHaveClass("text-white");
  });

  it("should use custom badge class function", () => {
    const customBadgeClass = vi.fn(() => "bg-red-500 text-white");
    render(
      <FilterTabs 
        tabs={tabs} 
        activeTab="active" 
        onChange={() => {}} 
        counts={{ active: 5 }} 
        getBadgeClass={customBadgeClass} 
      />
    );
    expect(customBadgeClass).toHaveBeenCalledWith("active", "active");
  });

  it("should render scrollable when scrollable is true", () => {
    const { container } = render(
      <FilterTabs 
        tabs={tabs} 
        activeTab="all" 
        onChange={() => {}} 
        scrollable={true} 
      />
    );
    const containerDiv = container.querySelector(".overflow-x-auto");
    expect(containerDiv).toBeInTheDocument();
  });

  it("should not render scrollable when scrollable is false", () => {
    const { container } = render(
      <FilterTabs 
        tabs={tabs} 
        activeTab="all" 
        onChange={() => {}} 
        scrollable={false} 
      />
    );
    const containerDiv = container.querySelector(".overflow-x-auto");
    expect(containerDiv).not.toBeInTheDocument();
  });

  it("should have base container classes", () => {
    const { container } = render(
      <FilterTabs tabs={tabs} activeTab="all" onChange={() => {}} />
    );
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass("w-full");
    expect(wrapper).toHaveClass("border-b");
    expect(wrapper).toHaveClass("border-slate-100");
  });

  it("should have inactive tab styling", () => {
    render(<FilterTabs tabs={tabs} activeTab="all" onChange={() => {}} />);
    const inactiveButton = screen.getByText("Active");
    expect(inactiveButton).toHaveClass("text-slate-700");
    expect(inactiveButton).toHaveClass("border-transparent");
  });

  it("should have hover classes for inactive tabs", () => {
    render(<FilterTabs tabs={tabs} activeTab="all" onChange={() => {}} />);
    const inactiveButton = screen.getByText("Active");
    expect(inactiveButton).toHaveClass("hover:text-blue-900");
    expect(inactiveButton).toHaveClass("hover:bg-slate-50");
  });
});
