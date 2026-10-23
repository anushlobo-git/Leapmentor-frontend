import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import ProfessionalInfoSection from "./ProfessionalInfoSection";

describe("ProfessionalInfoSection", () => {
  const defaultForm = {
    currentRole: "",
    industry: "",
    company: "",
    education: "",
    yearsOfExperience: "",
    hourlyRate: "",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render default form inputs cleanly when form values are empty", () => {
    render(
      <ProfessionalInfoSection
        form={defaultForm}
        onChange={vi.fn()}
        errors={{}}
      />,
    );

    expect(screen.getByLabelText(/Current Role/i)).toHaveValue("");
    expect(screen.getByLabelText(/Industry/i)).toHaveValue("");
    expect(screen.getByLabelText(/Company/i)).toHaveValue("");
    expect(screen.getByLabelText(/Educational Qualifications/i)).toHaveValue(
      "",
    );
    expect(screen.getByLabelText(/Years of Experience/i)).toHaveValue(null);
    expect(screen.getByLabelText(/Session Rate/i)).toHaveValue(null);

    // Verify select placeholder styling class without choice value (text-slate-400 color path branch)
    const selectElement = screen.getByLabelText(/Industry/i);
    expect(selectElement).toHaveClass("text-slate-400");
    expect(selectElement).not.toHaveClass("text-slate-800");
  });

  it("should render populated input data fields with correct value text alignments", () => {
    const filledForm = {
      currentRole: "Staff Researcher",
      industry: "Healthcare",
      company: "LeapMed Labs",
      education: "Ph.D. in Bio-informatics",
      yearsOfExperience: 12,
      hourlyRate: 75,
    };

    render(
      <ProfessionalInfoSection
        form={filledForm}
        onChange={vi.fn()}
        errors={{}}
      />,
    );

    expect(screen.getByLabelText(/Current Role/i)).toHaveValue(
      "Staff Researcher",
    );
    expect(screen.getByLabelText(/Industry/i)).toHaveValue("Healthcare");
    expect(screen.getByLabelText(/Company/i)).toHaveValue("LeapMed Labs");
    expect(screen.getByLabelText(/Educational Qualifications/i)).toHaveValue(
      "Ph.D. in Bio-informatics",
    );
    expect(screen.getByLabelText(/Years of Experience/i)).toHaveValue(12);
    expect(screen.getByLabelText(/Session Rate/i)).toHaveValue(75);

    // Verify select styling changes text color to active mode value when chosen
    const selectElement = screen.getByLabelText(/Industry/i);
    expect(selectElement).toHaveClass("text-slate-800");
  });

  it("should output specific textual validation banners and apply error layout styling states when errors exist", () => {
    const activeErrors = {
      currentRole: true,
      industry: true,
      yearsOfExperience: true,
    };

    render(
      <ProfessionalInfoSection
        form={defaultForm}
        onChange={vi.fn()}
        errors={activeErrors}
      />,
    );

    // Assert literal error messages are outputted onto the viewport canvas layout
    expect(screen.getByText("Current role is required.")).toBeInTheDocument();
    expect(screen.getByText("Please select an industry.")).toBeInTheDocument();
    expect(
      screen.getByText("Years of experience is required."),
    ).toBeInTheDocument();

    // Verify color state modifications attach style classes properly
    expect(screen.getByLabelText(/Current Role/i)).toHaveClass(
      "border-red-400 bg-red-50",
    );
    expect(screen.getByLabelText(/Industry/i)).toHaveClass(
      "border-red-400 bg-red-50",
    );
    expect(screen.getByLabelText(/Years of Experience/i)).toHaveClass(
      "border-red-400 bg-red-50",
    );
  });

  it("should invoke onChange callbacks correctly with matching event keys when text inputs capture keyboard entry changes", async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();

    render(
      <ProfessionalInfoSection
        form={defaultForm}
        onChange={mockOnChange}
        errors={{}}
      />,
    );

    const inputRoleField = screen.getByLabelText(/Current Role/i);
    await user.type(inputRoleField, "A");

    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it("should trigger onChange cleanly when an individual selects option choice combinations within the drop-down list", async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();

    render(
      <ProfessionalInfoSection
        form={defaultForm}
        onChange={mockOnChange}
        errors={{}}
      />,
    );

    const selectElement = screen.getByLabelText(/Industry/i);
    await user.selectOptions(selectElement, "Technology");

    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it("should attach forwarded ref hooks cleanly to the bounding shell wrapper container structural node element", () => {
    const sampleRef = React.createRef();

    render(
      <ProfessionalInfoSection
        form={defaultForm}
        onChange={vi.fn()}
        errors={{}}
        ref={sampleRef}
      />,
    );

    expect(sampleRef.current).not.toBeNull();
    expect(sampleRef.current).toHaveClass(
      "bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden",
    );
  });
});
