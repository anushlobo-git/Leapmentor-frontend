import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import AdminSettings from "./AdminSettings";

vi.mock("@features/admin/components/AdminLayout", () => ({
  default: ({ children }) => <div>{children}</div>,
}));

const mockGetCommissionSettings = vi.fn();
const mockUpdateCommissionSettings = vi.fn();
const mockAddAdmin = vi.fn();

vi.mock("@features/admin/api/admin.api", () => ({
  getCommissionSettings: (...args) => mockGetCommissionSettings(...args),
  updateCommissionSettings: (...args) => mockUpdateCommissionSettings(...args),
  addAdmin: (...args) => mockAddAdmin(...args),
}));

describe("AdminSettings", () => {
  afterEach(() => vi.resetAllMocks());

  it("loads commission settings and displays value", async () => {
    mockGetCommissionSettings.mockResolvedValue({
      data: { commissionRate: 12 },
    });
    mockUpdateCommissionSettings.mockResolvedValue({});

    render(<AdminSettings />);

    await waitFor(() => expect(mockGetCommissionSettings).toHaveBeenCalled());

    // Commission input should show value (formatted as number)
    const input = screen.getByPlaceholderText("e.g. 10");
    expect(input).toHaveValue(12);
  });

  it("submits commission and shows success toast", async () => {
    mockGetCommissionSettings.mockResolvedValue({
      data: { commissionRate: 5 },
    });
    mockUpdateCommissionSettings.mockResolvedValue({});

    render(<AdminSettings />);
    await waitFor(() => expect(mockGetCommissionSettings).toHaveBeenCalled());

    const input = screen.getByPlaceholderText("e.g. 10");
    fireEvent.change(input, { target: { value: "9" } });

    fireEvent.click(screen.getByRole("button", { name: /Save Rate/i }));

    await waitFor(() =>
      expect(mockUpdateCommissionSettings).toHaveBeenCalled(),
    );
    expect(screen.getByText(/Commission rate set to/)).toBeInTheDocument();
  });

  it("handles add admin success and displays temp password", async () => {
    mockGetCommissionSettings.mockResolvedValue({
      data: { commissionRate: 0 },
    });
    mockAddAdmin.mockResolvedValue({ data: { tempPassword: "pw-123" } });

    render(<AdminSettings />);
    await waitFor(() => expect(mockGetCommissionSettings).toHaveBeenCalled());

    const name = screen.getByPlaceholderText("e.g. Sarah Admin");
    const email = screen.getByPlaceholderText("admin@leapmentor.com");

    fireEvent.change(name, { target: { value: "New Admin" } });
    fireEvent.change(email, { target: { value: "new@admin.com" } });

    fireEvent.click(
      screen.getByRole("button", { name: /Create Admin Account/i }),
    );

    await waitFor(() => expect(mockAddAdmin).toHaveBeenCalled());

    expect(screen.getByText("pw-123")).toBeInTheDocument();
  });

  it("shows error toast when commission settings fail to load", async () => {
    mockGetCommissionSettings.mockRejectedValue(new Error("Load failed"));

    render(<AdminSettings />);

    expect(
      await screen.findByText(/Failed to load settings/i),
    ).toBeInTheDocument();
  });

  it("shows error toast when updating commission fails", async () => {
    mockGetCommissionSettings.mockResolvedValue({
      data: { commissionRate: 5 },
    });
    mockUpdateCommissionSettings.mockRejectedValue({
      response: { data: { message: "Update broken" } },
    });

    render(<AdminSettings />);
    await waitFor(() => expect(mockGetCommissionSettings).toHaveBeenCalled());

    fireEvent.change(screen.getByPlaceholderText("e.g. 10"), {
      target: { value: "11" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Save Rate/i }));

    expect(await screen.findByText(/Update broken/i)).toBeInTheDocument();
  });

  it("shows error toast when add admin fails", async () => {
    mockGetCommissionSettings.mockResolvedValue({
      data: { commissionRate: 0 },
    });
    mockAddAdmin.mockRejectedValue({
      response: { data: { message: "Creation failed" } },
    });

    render(<AdminSettings />);
    await waitFor(() => expect(mockGetCommissionSettings).toHaveBeenCalled());

    fireEvent.change(screen.getByPlaceholderText("e.g. Sarah Admin"), {
      target: { value: "New Name" },
    });
    fireEvent.change(screen.getByPlaceholderText("admin@leapmentor.com"), {
      target: { value: "new@admin.com" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /Create Admin Account/i }),
    );

    expect(await screen.findByText(/Creation failed/i)).toBeInTheDocument();
  });

  it("does not submit invalid admin form values", async () => {
    mockGetCommissionSettings.mockResolvedValue({
      data: { commissionRate: 5 },
    });

    render(<AdminSettings />);
    await waitFor(() => expect(mockGetCommissionSettings).toHaveBeenCalled());

    fireEvent.click(
      screen.getByRole("button", { name: /Create Admin Account/i }),
    );

    expect(mockAddAdmin).not.toHaveBeenCalled();
    expect(await screen.findAllByRole("alert")).toHaveLength(2);
  });
});
