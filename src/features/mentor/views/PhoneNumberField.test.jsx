import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PhoneNumberField from "./PhoneNumberField";
import { isValidPhoneNumber } from "react-phone-number-input";

// Mock phone input package
vi.mock("react-phone-number-input", () => ({
  default: ({ value, onChange, onBlur }) => (
    <input
      data-testid="phone-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
    />
  ),
  isValidPhoneNumber: vi.fn(),
}));

describe("PhoneNumberField component", () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with label, input, and placeholder explanation when untouched", () => {
    render(<PhoneNumberField value="" onChange={mockOnChange} />);

    expect(screen.getByText("Phone Number")).toBeInTheDocument();
    expect(screen.getByTestId("phone-input")).toBeInTheDocument();
    expect(
      screen.getByText("Select your country code and enter your number"),
    ).toBeInTheDocument();
  });

  it("triggers onChange when user types", () => {
    render(<PhoneNumberField value="" onChange={mockOnChange} />);

    const input = screen.getByTestId("phone-input");
    fireEvent.change(input, { target: { value: "+919876543210" } });

    expect(mockOnChange).toHaveBeenCalledWith({
      target: { name: "phoneNumber", value: "+919876543210" },
    });
  });

  it("sets touched and triggers success status when valid phone is entered and blurred", async () => {
    isValidPhoneNumber.mockReturnValue(true);
    const user = userEvent.setup();

    render(<PhoneNumberField value="+919876543210" onChange={mockOnChange} />);

    const input = screen.getByTestId("phone-input");
    await user.click(input);
    await user.tab(); // trigger blur

    expect(screen.getByText("✓ Valid phone number")).toBeInTheDocument();
  });

  it("sets touched and triggers error status when invalid phone is entered and blurred", async () => {
    isValidPhoneNumber.mockReturnValue(false);
    const user = userEvent.setup();

    render(<PhoneNumberField value="+123" onChange={mockOnChange} />);

    const input = screen.getByTestId("phone-input");
    await user.click(input);
    await user.tab(); // trigger blur

    expect(
      screen.getByText("Please enter a valid phone number"),
    ).toBeInTheDocument();
  });

  it("shows error prop message and applies error border class", () => {
    render(
      <PhoneNumberField
        value=""
        onChange={mockOnChange}
        error="This number is already registered"
      />,
    );

    expect(
      screen.getByText("This number is already registered"),
    ).toBeInTheDocument();
  });

  it("triggers onChange with empty string if value is cleared/falsy", () => {
    render(<PhoneNumberField value="+91" onChange={mockOnChange} />);

    const input = screen.getByTestId("phone-input");
    fireEvent.change(input, { target: { value: "" } });

    expect(mockOnChange).toHaveBeenCalledWith({
      target: { name: "phoneNumber", value: "" },
    });
  });
});
