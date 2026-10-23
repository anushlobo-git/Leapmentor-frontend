import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProfessionalDetailsSection from "./ProfessionalDetailsSection";

describe("ProfessionalDetailsSection", () => {
  const baseForm = {
    currentRole: "QA Engineer",
    company: "Google",
    yearsOfExperience: "1-3 Years",
    industry: "Technology",
  };

  const mockHandleChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders inputs with default form values", () => {
    render(
      <ProfessionalDetailsSection
        form={baseForm}
        handleChange={mockHandleChange}
        errors={{}}
      />
    );

    expect(screen.getByLabelText(/Current Role/i)).toHaveValue("QA Engineer");
    expect(screen.getByLabelText(/Company \/ Organization/i)).toHaveValue("Google");
    expect(screen.getByLabelText(/Years of Experience/i)).toHaveValue("1-3 Years");
    expect(screen.getByLabelText(/Industry/i)).toHaveValue("Technology");
  });

  it("handles nullish/missing experience and industry defaults", () => {
    const sparseForm = {
      currentRole: "Designer",
      company: "",
      yearsOfExperience: null,
      industry: undefined,
    };

    render(
      <ProfessionalDetailsSection
        form={sparseForm}
        handleChange={mockHandleChange}
        errors={{}}
      />
    );

    expect(screen.getByLabelText(/Years of Experience/i)).toHaveValue("");
    expect(screen.getByLabelText(/Industry/i)).toHaveValue("");
  });

  it("calls handleChange on form input changes", async () => {
    const user = userEvent.setup();
    render(
      <ProfessionalDetailsSection
        form={baseForm}
        handleChange={mockHandleChange}
        errors={{}}
      />
    );

    const companyInput = screen.getByLabelText(/Company \/ Organization/i);
    await user.clear(companyInput);
    await user.type(companyInput, "Meta");

    expect(mockHandleChange).toHaveBeenCalled();
  });

  it("shows error styling and error messages when errors are passed", () => {
    const emptyForm = {
      currentRole: "",
      company: "",
      yearsOfExperience: "",
      industry: "",
    };

    const errors = {
      currentRole: true,
      yearsOfExperience: true,
      industry: true,
    };

    render(
      <ProfessionalDetailsSection
        form={emptyForm}
        handleChange={mockHandleChange}
        errors={errors}
      />
    );

    expect(screen.getByText("Current role is required.")).toBeInTheDocument();
    expect(screen.getByText("Please select your experience.")).toBeInTheDocument();
    expect(screen.getByText("Please select an industry.")).toBeInTheDocument();
  });
});
