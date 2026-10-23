import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import InterestedFieldsSection from "./InterestedFieldsSection";

describe("InterestedFieldsSection", () => {
  const baseForm = {
    interestedFields: ["Design", "AI"],
    skills: ["Figma"],
  };

  const mockHandleChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("handles empty / undefined arrays fallback logic", async () => {
    const user = userEvent.setup();
    render(
      <InterestedFieldsSection
        form={{}}
        handleChange={mockHandleChange}
        errors={{}}
      />,
    );

    const fieldsInput = screen.getByPlaceholderText(
      "Add fields e.g. AI, Growth, Design...",
    );
    await user.type(fieldsInput, "Growth{Enter}");

    expect(mockHandleChange).toHaveBeenCalledWith({
      target: {
        name: "interestedFields",
        value: ["Growth"],
      },
    });

    vi.clearAllMocks();

    const skillsInput = screen.getByPlaceholderText(
      "Add skills e.g. Figma, Python, Leadership...",
    );
    await user.type(skillsInput, "Python{Enter}");

    expect(mockHandleChange).toHaveBeenCalledWith({
      target: {
        name: "skills",
        value: ["Python"],
      },
    });
  });

  it("renders tag inputs and lists existing tags", () => {
    render(
      <InterestedFieldsSection
        form={baseForm}
        handleChange={mockHandleChange}
        errors={{}}
      />,
    );

    expect(screen.getByText("Interested Fields")).toBeInTheDocument();
    expect(screen.getByText("Design")).toBeInTheDocument();
    expect(screen.getByText("AI")).toBeInTheDocument();
    expect(screen.getByText("Figma")).toBeInTheDocument();
  });

  it("triggers handleChange with correct payload when adding a tag via Enter key", async () => {
    const user = userEvent.setup();
    render(
      <InterestedFieldsSection
        form={baseForm}
        handleChange={mockHandleChange}
        errors={{}}
      />,
    );

    const fieldsInput = screen.getByPlaceholderText(
      "Add fields e.g. AI, Growth, Design...",
    );
    await user.type(fieldsInput, "Marketing{Enter}");

    expect(mockHandleChange).toHaveBeenCalledWith({
      target: {
        name: "interestedFields",
        value: ["Design", "AI", "Marketing"],
      },
    });
  });

  it("triggers handleChange with correct payload when adding a tag via Blur event", async () => {
    const user = userEvent.setup();
    render(
      <InterestedFieldsSection
        form={baseForm}
        handleChange={mockHandleChange}
        errors={{}}
      />,
    );

    const skillsInput = screen.getByPlaceholderText(
      "Add skills e.g. Figma, Python, Leadership...",
    );
    await user.type(skillsInput, "Python");
    fireEvent.blur(skillsInput);

    expect(mockHandleChange).toHaveBeenCalledWith({
      target: {
        name: "skills",
        value: ["Figma", "Python"],
      },
    });
  });

  it("prevents adding empty or duplicate tags", async () => {
    const user = userEvent.setup();
    render(
      <InterestedFieldsSection
        form={baseForm}
        handleChange={mockHandleChange}
        errors={{}}
      />,
    );

    const fieldsInput = screen.getByPlaceholderText(
      "Add fields e.g. AI, Growth, Design...",
    );
    // Add empty
    await user.type(fieldsInput, " {Enter}");
    expect(mockHandleChange).not.toHaveBeenCalled();

    // Add duplicate
    await user.type(fieldsInput, "Design{Enter}");
    expect(mockHandleChange).not.toHaveBeenCalled();
  });

  it("triggers handleChange on tag removal click (interestedFields)", async () => {
    const user = userEvent.setup();
    render(
      <InterestedFieldsSection
        form={baseForm}
        handleChange={mockHandleChange}
        errors={{}}
      />,
    );

    // Remove Design tag
    const removeBtn = screen.getAllByRole("button", { name: "×" })[0];
    await user.click(removeBtn);

    expect(mockHandleChange).toHaveBeenCalledWith({
      target: {
        name: "interestedFields",
        value: ["AI"],
      },
    });
  });

  it("triggers handleChange on tag removal click (skills)", async () => {
    const user = userEvent.setup();
    render(
      <InterestedFieldsSection
        form={baseForm}
        handleChange={mockHandleChange}
        errors={{}}
      />,
    );

    // Remove Figma tag
    const removeBtn = screen.getAllByRole("button", { name: "×" })[2]; // Design is 0, AI is 1, Figma is 2
    await user.click(removeBtn);

    expect(mockHandleChange).toHaveBeenCalledWith({
      target: {
        name: "skills",
        value: [],
      },
    });
  });

  it("displays error messages when validation fails", () => {
    const emptyForm = {
      interestedFields: [],
      skills: [],
    };

    render(
      <InterestedFieldsSection
        form={emptyForm}
        handleChange={mockHandleChange}
        errors={{ interestedFields: true, skills: true }}
      />,
    );

    expect(
      screen.getByText("Add at least one field of interest."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Add at least one skill of interest."),
    ).toBeInTheDocument();
  });
});
