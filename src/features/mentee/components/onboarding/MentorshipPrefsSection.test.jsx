import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MentorshipPrefsSection from "./MentorshipPrefsSection";

vi.mock("../../../../components/shared/form/MentorshipPreferencesCard", () => ({
  default: ({ onToggleCommunication, onToggleLanguage, onRemoveLanguage }) => (
    <div data-testid="preferences-card">
      <button onClick={() => onToggleCommunication("Chat")}>Toggle Chat</button>
      <button onClick={() => onToggleLanguage("English")}>
        Toggle English
      </button>
      <button onClick={() => onRemoveLanguage("French")}>Remove French</button>
    </div>
  ),
}));

describe("MentorshipPrefsSection", () => {
  const baseForm = {
    communicationPreferences: ["Email"],
    languages: ["French"],
  };

  const mockHandleChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("handles fallback to empty arrays when options are undefined", () => {
    const sparseForm = {};
    render(
      <MentorshipPrefsSection
        form={sparseForm}
        handleChange={mockHandleChange}
      />,
    );
    expect(screen.getByTestId("preferences-card")).toBeInTheDocument();
  });

  it("handles adding a communication preference when not already selected", async () => {
    const user = userEvent.setup();
    render(
      <MentorshipPrefsSection
        form={baseForm}
        handleChange={mockHandleChange}
      />,
    );

    const toggleChatBtn = screen.getByRole("button", { name: "Toggle Chat" });
    await user.click(toggleChatBtn);

    expect(mockHandleChange).toHaveBeenCalledWith({
      target: {
        name: "communicationPreferences",
        value: ["Email", "Chat"],
      },
    });
  });

  it("handles removing a communication preference when already selected", async () => {
    const user = userEvent.setup();
    render(
      <MentorshipPrefsSection
        form={{ communicationPreferences: ["Chat", "Email"], languages: [] }}
        handleChange={mockHandleChange}
      />,
    );

    const toggleChatBtn = screen.getByRole("button", { name: "Toggle Chat" });
    await user.click(toggleChatBtn);

    expect(mockHandleChange).toHaveBeenCalledWith({
      target: {
        name: "communicationPreferences",
        value: ["Email"],
      },
    });
  });

  it("handles adding a language preference when not already selected", async () => {
    const user = userEvent.setup();
    render(
      <MentorshipPrefsSection
        form={baseForm}
        handleChange={mockHandleChange}
      />,
    );

    const toggleLangBtn = screen.getByRole("button", {
      name: "Toggle English",
    });
    await user.click(toggleLangBtn);

    expect(mockHandleChange).toHaveBeenCalledWith({
      target: {
        name: "languages",
        value: ["French", "English"],
      },
    });
  });

  it("handles removing a language preference when already selected via toggle", async () => {
    const user = userEvent.setup();
    render(
      <MentorshipPrefsSection
        form={{
          communicationPreferences: [],
          languages: ["French", "English"],
        }}
        handleChange={mockHandleChange}
      />,
    );

    const toggleLangBtn = screen.getByRole("button", {
      name: "Toggle English",
    });
    await user.click(toggleLangBtn);

    expect(mockHandleChange).toHaveBeenCalledWith({
      target: {
        name: "languages",
        value: ["French"],
      },
    });
  });

  it("handles removing language directly", async () => {
    const user = userEvent.setup();
    render(
      <MentorshipPrefsSection
        form={baseForm}
        handleChange={mockHandleChange}
      />,
    );

    const removeBtn = screen.getByRole("button", { name: "Remove French" });
    await user.click(removeBtn);

    expect(mockHandleChange).toHaveBeenCalledWith({
      target: {
        name: "languages",
        value: [],
      },
    });
  });
});
