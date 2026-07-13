import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import SkillsSection from "./SkillsSection";

describe("SkillsSection", () => {
  it("should render default state with placeholder instruction when no skills are present", () => {
    render(
      <SkillsSection form={{ skills: [] }} onChange={vi.fn()} errors={{}} />,
    );

    expect(screen.getByLabelText(/Core Skills/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Type a skill and press enter..."),
    ).toHaveValue("");
    expect(
      screen.getByText("Press Enter or click Add to add a skill"),
    ).toBeInTheDocument();
  });

  it("should render the error state block correctly when validation flags skills failure", () => {
    const { container } = render(
      <SkillsSection
        form={{ skills: undefined }}
        onChange={vi.fn()}
        errors={{ skills: true }}
      />,
    );

    expect(
      screen.getByText("Please add at least one skill."),
    ).toBeInTheDocument();

    // Validate style modifier transitions
    const inputElement = screen.getByPlaceholderText(
      "Type a skill and press enter...",
    );
    expect(inputElement).toHaveClass("border-red-400 bg-red-50");
  });

  it("should list active skill badges correctly when a skill array is provided in the form object", () => {
    render(
      <SkillsSection
        form={{ skills: ["React", "TypeScript"] }}
        onChange={vi.fn()}
        errors={{}}
      />,
    );

    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
  });

  it("should fire onChange event mapping list modifications when adding a unique skill label via Add button", async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();

    render(
      <SkillsSection
        form={{ skills: ["Git"] }}
        onChange={mockOnChange}
        errors={{}}
      />,
    );

    const inputField = screen.getByPlaceholderText(
      "Type a skill and press enter...",
    );
    const addButton = screen.getByRole("button", { name: "Add" });

    await user.type(inputField, "Docker");
    await user.click(addButton);

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith({
      target: {
        name: "skills",
        value: ["Git", "Docker"],
      },
    });
    // Form input should reset cleanly to an empty string post-submission
    expect(inputField).toHaveValue("");
  });

  it("should escape addition pipeline if input string consists entirely of blank white spaces", async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();

    render(
      <SkillsSection
        form={{ skills: [] }}
        onChange={mockOnChange}
        errors={{}}
      />,
    );

    const inputField = screen.getByPlaceholderText(
      "Type a skill and press enter...",
    );
    const addButton = screen.getByRole("button", { name: "Add" });

    await user.type(inputField, "    ");
    await user.click(addButton);

    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it("should clear the input buffer without triggering onChange callbacks when a duplicate skill is typed", async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();

    render(
      <SkillsSection
        form={{ skills: ["Node.js"] }}
        onChange={mockOnChange}
        errors={{}}
      />,
    );

    const inputField = screen.getByPlaceholderText(
      "Type a skill and press enter...",
    );
    const addButton = screen.getByRole("button", { name: "Add" });

    await user.type(inputField, "Node.js");
    await user.click(addButton);

    expect(mockOnChange).not.toHaveBeenCalled();
    expect(inputField).toHaveValue("");
  });

  it("should trigger adding a skill seamlessly on blur input event execution loops", async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();

    render(
      <SkillsSection
        form={{ skills: [] }}
        onChange={mockOnChange}
        errors={{}}
      />,
    );

    const inputField = screen.getByPlaceholderText(
      "Type a skill and press enter...",
    );
    await user.type(inputField, "GraphQL");

    // Fire dynamic blurring sequence loop
    fireEvent.blur(inputField);

    expect(mockOnChange).toHaveBeenCalledWith({
      target: { name: "skills", value: ["GraphQL"] },
    });
  });

  it("should intercept and trigger addSkill workflow when hitting the Enter key down action inside the field", async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();

    render(
      <SkillsSection
        form={{ skills: [] }}
        onChange={mockOnChange}
        errors={{}}
      />,
    );

    const inputField = screen.getByPlaceholderText(
      "Type a skill and press enter...",
    );
    await user.type(inputField, "Next.js");

    // Simulate Enter key submission pipeline
    fireEvent.keyDown(inputField, { key: "Enter", code: "Enter" });

    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it("should ignore alternative irrelevant keydown inputs inside input fields completely", async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();

    render(
      <SkillsSection
        form={{ skills: [] }}
        onChange={mockOnChange}
        errors={{}}
      />,
    );

    const inputField = screen.getByPlaceholderText(
      "Type a skill and press enter...",
    );
    await user.type(inputField, "Python");

    fireEvent.keyDown(inputField, { key: "Escape", code: "Escape" });

    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it("should invoke onChange omitting the selected item when clicking the cross removal token badge button", async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();

    render(
      <SkillsSection
        form={{ skills: ["AWS", "CSS"] }}
        onChange={mockOnChange}
        errors={{}}
      />,
    );

    // Look up the clear token associated with AWS badge
    const deleteButtons = screen.getAllByRole("button", { name: "×" });
    await user.click(deleteButtons[0]);

    expect(mockOnChange).toHaveBeenCalledWith({
      target: {
        name: "skills",
        value: ["CSS"],
      },
    });
  });

  it("should attach forwardRef properly onto the root configuration shell node wrapper element", () => {
    const testRef = React.createRef();

    render(
      <SkillsSection
        form={{ skills: [] }}
        onChange={vi.fn()}
        errors={{}}
        ref={testRef}
      />,
    );

    expect(testRef.current).not.toBeNull();
    expect(testRef.current.getAttribute("data-field")).toBe("skills");
  });
});
