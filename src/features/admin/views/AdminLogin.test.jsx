import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import AdminLogin from "@features/admin/views/AdminLogin";
import authReducer from "@features/auth/models/authSlice";
import { adminLogin } from "@features/admin/models/admin.api";

vi.mock("@features/admin/models/admin.api", () => ({
  adminLogin: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

const renderWithStore = () => {
  const store = configureStore({ reducer: { auth: authReducer } });
  render(
    <Provider store={store}>
      <AdminLogin />
    </Provider>,
  );
  return store;
};

describe("AdminLogin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("submits credentials, stores the admin session in Redux, and navigates to the admin users page", async () => {
    const user = userEvent.setup();
    adminLogin.mockResolvedValue({ data: { admin: { name: "Admin" } } });

    const store = renderWithStore();

    await user.type(screen.getByLabelText(/email/i), "admin@leapmentor.com");
    await user.type(screen.getByLabelText(/password/i), "secret123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(adminLogin).toHaveBeenCalledWith(
      "admin@leapmentor.com",
      "secret123",
    );

    const state = store.getState().auth;
    expect(state.role).toBe("admin");
    expect(state.user).toEqual({ name: "Admin" });
  });

  it("shows an error message when login fails", async () => {
    const user = userEvent.setup();
    adminLogin.mockRejectedValueOnce({
      response: { data: { message: "Invalid credentials" } },
    });

    renderWithStore();

    await user.type(screen.getByLabelText(/email/i), "bad@example.com");
    await user.type(screen.getByLabelText(/password/i), "wrong");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
  });
});
