import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PreferencesSection from "./PreferencesSection";

// ── Mock Subcomponent to Intercept Callback Props ──────────────────────────
vi.mock("../../../../components/shared/form/MentorshipPreferencesCard", () => ({
  default: vi.fn(
    ({
      onToggleCommunication,
      onToggleLanguage,
      onRemoveLanguage,
      selectedCommunication,
      selectedLanguages,
    }) => (
      <div data-testid="mock-preferences-card">
        <button onClick={() => onToggleCommunication("Video Call")}>
          Toggle Video Call
        </button>
        <button onClick={() => onToggleCommunication("Chat")}>
          Toggle Chat
        </button>
        <button onClick={() => onToggleLanguage("English")}>
          Toggle English
        </button>
        <button onClick={() => onToggleLanguage("Spanish")}>
          Toggle Spanish
        </button>
        <button onClick={() => onRemoveLanguage("French")}>
          Remove French
        </button>
        <div data-testid="selected-comm">{selectedCommunication.join(",")}</div>
        <div data-testid="selected-lang">{selectedLanguages.join(",")}</div>
      </div>
    ),
  ),
}));

describe("PreferencesSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Baseline Parsing and Fallback Branch Coverages ────────────────────────
  it("should fall back gracefully to empty arrays when communication and language entries are missing", () => {
    const mockForm = {}; // Undefined preferences and languages triggers fallback branches
    render(<PreferencesSection form={mockForm} onChange={vi.fn()} />);

    expect(screen.getByTestId("selected-comm")).toHaveTextContent("");
    expect(screen.getByTestId("selected-lang")).toHaveTextContent("");
  });

  it("should process language preferences cleanly when provided as a pre-formed array structure", () => {
    const mockForm = {
      communicationPreferences: ["Video Call"],
      languages: ["English", "Hindi"],
    };
    render(<PreferencesSection form={mockForm} onChange={vi.fn()} />);

    expect(screen.getByTestId("selected-comm")).toHaveTextContent("Video Call");
    expect(screen.getByTestId("selected-lang")).toHaveTextContent(
      "English,Hindi",
    );
  });

  it("should parse legacy comma-separated string languages formatting correctly, removing empty items", () => {
    const mockForm = {
      communicationPreferences: [],
      languages: "English, French, , German", // Contains spaces and extra commas to test split/filter branch
    };
    render(<PreferencesSection form={mockForm} onChange={vi.fn()} />);

    expect(screen.getByTestId("selected-lang")).toHaveTextContent(
      "English,French,German",
    );
  });

  // ── Communication Toggle Pipelines Coverage ────────────────────────────────
  it("should append a preference value to form tracking when a new communication channel is toggled on", async () => {
    const user = userEvent.setup();
    const handleOnChange = vi.fn();
    const mockForm = {
      communicationPreferences: ["Video Call"],
    };

    render(<PreferencesSection form={mockForm} onChange={handleOnChange} />);

    await user.click(screen.getByRole("button", { name: "Toggle Chat" }));

    expect(handleOnChange).toHaveBeenCalledWith({
      target: {
        name: "communicationPreferences",
        value: ["Video Call", "Chat"],
      },
    });
  });

  it("should extract a preference value from form tracking when an existing communication channel is toggled off", async () => {
    const user = userEvent.setup();
    const handleOnChange = vi.fn();
    const mockForm = {
      communicationPreferences: ["Video Call", "Chat"],
    };

    render(<PreferencesSection form={mockForm} onChange={handleOnChange} />);

    await user.click(screen.getByRole("button", { name: "Toggle Video Call" }));

    expect(handleOnChange).toHaveBeenCalledWith({
      target: {
        name: "communicationPreferences",
        value: ["Chat"],
      },
    });
  });

  // ── Language Toggle Pipelines Coverage ─────────────────────────────────────
  it("should append a language value to form tracking when a new language selection is toggled on", async () => {
    const user = userEvent.setup();
    const handleOnChange = vi.fn();
    const mockForm = {
      languages: ["English"],
    };

    render(<PreferencesSection form={mockForm} onChange={handleOnChange} />);

    await user.click(screen.getByRole("button", { name: "Toggle Spanish" }));

    expect(handleOnChange).toHaveBeenCalledWith({
      target: {
        name: "languages",
        value: ["English", "Spanish"],
      },
    });
  });

  it("should extract a language value from form tracking when an active language selection is toggled off", async () => {
    const user = userEvent.setup();
    const handleOnChange = vi.fn();
    const mockForm = {
      languages: ["English", "Spanish"],
    };

    render(<PreferencesSection form={mockForm} onChange={handleOnChange} />);

    await user.click(screen.getByRole("button", { name: "Toggle English" }));

    expect(handleOnChange).toHaveBeenCalledWith({
      target: {
        name: "languages",
        value: ["Spanish"],
      },
    });
  });

  // ── Language Removal Action Coverage ──────────────────────────────────────
  it("should remove target language selections directly when the removal cross action fires", async () => {
    const user = userEvent.setup();
    const handleOnChange = vi.fn();
    const mockForm = {
      languages: ["French", "German"],
    };

    render(<PreferencesSection form={mockForm} onChange={handleOnChange} />);

    await user.click(screen.getByRole("button", { name: "Remove French" }));

    expect(handleOnChange).toHaveBeenCalledWith({
      target: {
        name: "languages",
        value: ["German"],
      },
    });
  });
});
