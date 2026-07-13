/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import MentorshipPreferencesCard from "./MentorshipPreferencesCard";

describe("MentorshipPreferencesCard", () => {
  const defaultProps = {
    title: "Test Title",
    idPrefix: "test",
    communicationOptions: [
      { value: "email", label: "Email", icon: "📧" },
      { value: "chat", label: "Chat", icon: "💬" },
    ],
    languageOptions: ["English", "Spanish", "French"],
    selectedCommunication: [],
    selectedLanguages: [],
    onToggleCommunication: vi.fn(),
    onToggleLanguage: vi.fn(),
    onRemoveLanguage: vi.fn(),
  };

  it("should render title", () => {
    render(<MentorshipPreferencesCard {...defaultProps} />);
    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });

  it("should render communication options", () => {
    const { container } = render(<MentorshipPreferencesCard {...defaultProps} />);
    expect(container.querySelector("#test-email")).toBeInTheDocument();
    expect(container.querySelector("#test-chat")).toBeInTheDocument();
  });

  it("should render language dropdown button", () => {
    render(<MentorshipPreferencesCard {...defaultProps} />);
    expect(screen.getByText("Select languages...")).toBeInTheDocument();
  });

  it("should render communication label", () => {
    const { container } = render(<MentorshipPreferencesCard {...defaultProps} />);
    const label = container.querySelector(".text-xs.font-semibold.text-slate-500");
    expect(label).toBeInTheDocument();
  });

  it("should render selected language count", () => {
    render(
      <MentorshipPreferencesCard
        {...defaultProps}
        selectedLanguages={["English", "Spanish"]}
      />
    );
    expect(screen.getByText("2 selected")).toBeInTheDocument();
  });

  it("should render selected language badges", () => {
    render(
      <MentorshipPreferencesCard
        {...defaultProps}
        selectedLanguages={["English", "Spanish"]}
      />
    );
    expect(screen.getByText("English")).toBeInTheDocument();
    expect(screen.getByText("Spanish")).toBeInTheDocument();
  });

  it("should call onToggleCommunication when checkbox is clicked", () => {
    const { container } = render(<MentorshipPreferencesCard {...defaultProps} />);
    const emailCheckbox = container.querySelector("#test-email");
    fireEvent.click(emailCheckbox);
    expect(defaultProps.onToggleCommunication).toHaveBeenCalledWith("email");
  });

  it("should call onRemoveLanguage when remove button is clicked", () => {
    render(
      <MentorshipPreferencesCard
        {...defaultProps}
        selectedLanguages={["English"]}
      />
    );
    const removeButton = screen.getByText("×");
    fireEvent.click(removeButton);
    expect(defaultProps.onRemoveLanguage).toHaveBeenCalledWith("English");
  });

  it("should open dropdown when button is clicked", () => {
    render(<MentorshipPreferencesCard {...defaultProps} />);
    const dropdownButton = screen.getByText("Select languages...");
    fireEvent.click(dropdownButton);
    expect(screen.getByText("English")).toBeInTheDocument();
    expect(screen.getByText("Spanish")).toBeInTheDocument();
    expect(screen.getByText("French")).toBeInTheDocument();
  });

  it("should call onToggleLanguage when language option is clicked", () => {
    render(<MentorshipPreferencesCard {...defaultProps} />);
    const dropdownButton = screen.getByText("Select languages...");
    fireEvent.click(dropdownButton);
    const englishOption = screen.getByText("English");
    fireEvent.click(englishOption);
    expect(defaultProps.onToggleLanguage).toHaveBeenCalledWith("English");
  });

  it("should close dropdown when clicking outside", () => {
    render(<MentorshipPreferencesCard {...defaultProps} />);
    const dropdownButton = screen.getByText("Select languages...");
    fireEvent.click(dropdownButton);

    fireEvent.mouseDown(document.body);

    expect(screen.queryByText("English")).not.toBeInTheDocument();
  });

  it("should have base card classes", () => {
    const { container } = render(<MentorshipPreferencesCard {...defaultProps} />);
    const card = container.firstChild;
    expect(card).toHaveClass("bg-white");
    expect(card).toHaveClass("rounded-2xl");
    expect(card).toHaveClass("border");
    expect(card).toHaveClass("border-blue-100");
  });

  it("should have header classes", () => {
    const { container } = render(<MentorshipPreferencesCard {...defaultProps} />);
    const header = container.querySelector(".bg-blue-50");
    expect(header).toHaveClass("flex");
    expect(header).toHaveClass("items-center");
    expect(header).toHaveClass("gap-3");
  });

  it("should render header icon", () => {
    const { container } = render(<MentorshipPreferencesCard {...defaultProps} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should render checked checkbox state", () => {
    const { container } = render(
      <MentorshipPreferencesCard
        {...defaultProps}
        selectedCommunication={["email"]}
      />
    );
    const emailCheckbox = container.querySelector("#test-email");
    expect(emailCheckbox).toBeChecked();
  });

  it("should render unchecked checkbox state", () => {
    const { container } = render(<MentorshipPreferencesCard {...defaultProps} />);
    const emailCheckbox = container.querySelector("#test-email");
    expect(emailCheckbox).not.toBeChecked();
  });

  it("should show checkmark for selected language in dropdown", () => {
    const { container } = render(
      <MentorshipPreferencesCard
        {...defaultProps}
        selectedLanguages={["English"]}
      />
    );
    const dropdownButton = screen.getByText("1 selected");
    fireEvent.click(dropdownButton);
    const checkmark = container.querySelector("path[stroke='#2563eb']");
    expect(checkmark).toBeInTheDocument();
  });
});
