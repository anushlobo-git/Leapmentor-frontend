import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminLogin from "@features/admin/pages/AdminLogin";
import { useAdminAuth } from "@features/admin/context/AdminAuthContext";
import { adminLogin } from "@features/admin/api/admin.api";

vi.mock("@features/admin/api/admin.api", () => ({
  adminLogin: vi.fn(),
}));

vi.mock("@features/admin/context/AdminAuthContext", () => ({
  useAdminAuth: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe("AdminLogin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAdminAuth.mockReturnValue({ login: vi.fn() });
  });

  it("submits credentials and navigates to the admin users page", async () => {
    const user = userEvent.setup();
    const login = vi.fn();
    useAdminAuth.mockReturnValue({ login });
    adminLogin.mockResolvedValue({ data: { admin: { name: "Admin" } } });

    render(<AdminLogin />);

    await user.type(screen.getByLabelText(/email/i), "admin@leapmentor.com");
    await user.type(screen.getByLabelText(/password/i), "secret123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(adminLogin).toHaveBeenCalledWith(
      "admin@leapmentor.com",
      "secret123",
    );
    expect(login).toHaveBeenCalled();
  });

  it("shows an error message when login fails", async () => {
    const user = userEvent.setup();
    adminLogin.mockRejectedValueOnce({
      response: { data: { message: "Invalid credentials" } },
    });

    render(<AdminLogin />);

    await user.type(screen.getByLabelText(/email/i), "bad@example.com");
    await user.type(screen.getByLabelText(/password/i), "wrong");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
  });
});
