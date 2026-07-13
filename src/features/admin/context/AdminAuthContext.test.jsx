import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminAuthProvider, useAdminAuth } from "./AdminAuthContext";
import adminAxiosInstance from "@lib/adminAxiosInstance";
import logger from "@lib/logger";

vi.mock("@lib/adminAxiosInstance", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock("@lib/logger", () => ({
  default: {
    error: vi.fn(),
  },
}));

const TestConsumer = () => {
  const { admin, loading, login, logout, isAuthenticated, setAdmin } =
    useAdminAuth();

  return (
    <div>
      <div data-testid="loading">{String(loading)}</div>
      <div data-testid="is-authenticated">{String(isAuthenticated)}</div>
      <div data-testid="admin-name">{admin?.name || "none"}</div>
      <button
        onClick={() => login({ name: "Test Admin", email: "admin@test.com" })}
      >
        Login
      </button>
      <button onClick={logout}>Logout</button>
      <button onClick={() => setAdmin({ name: "Updated Admin" })}>
        Set Admin
      </button>
    </div>
  );
};

describe("AdminAuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should provide initial loading state and check auth status on mount", async () => {
    adminAxiosInstance.get.mockResolvedValueOnce({
      data: { admin: { name: "John Admin", email: "john@admin.com" } },
    });

    render(
      <AdminAuthProvider>
        <TestConsumer />
      </AdminAuthProvider>,
    );

    expect(screen.getByTestId("loading")).toHaveTextContent("true");

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    expect(screen.getByTestId("admin-name")).toHaveTextContent("John Admin");
    expect(screen.getByTestId("is-authenticated")).toHaveTextContent("true");
  });

  it("should handle auth check failure and set admin to null", async () => {
    adminAxiosInstance.get.mockRejectedValueOnce(new Error("Unauthorized"));

    render(
      <AdminAuthProvider>
        <TestConsumer />
      </AdminAuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    expect(screen.getByTestId("admin-name")).toHaveTextContent("none");
    expect(screen.getByTestId("is-authenticated")).toHaveTextContent("false");
  });

  it("should allow login and update admin state", async () => {
    const user = userEvent.setup();
    adminAxiosInstance.get.mockResolvedValueOnce({ data: {} });

    render(
      <AdminAuthProvider>
        <TestConsumer />
      </AdminAuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    const loginBtn = screen.getByRole("button", { name: /Login/i });
    await user.click(loginBtn);

    expect(screen.getByTestId("admin-name")).toHaveTextContent("Test Admin");
    expect(screen.getByTestId("is-authenticated")).toHaveTextContent("true");
  });

  it("should handle logout successfully and clear admin state", async () => {
    const user = userEvent.setup();
    adminAxiosInstance.get.mockResolvedValueOnce({
      data: { admin: { name: "John Admin" } },
    });
    adminAxiosInstance.post.mockResolvedValueOnce({});

    render(
      <AdminAuthProvider>
        <TestConsumer />
      </AdminAuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("admin-name")).toHaveTextContent("John Admin");
    });

    const logoutBtn = screen.getByRole("button", { name: /Logout/i });
    await user.click(logoutBtn);

    await waitFor(() => {
      expect(screen.getByTestId("admin-name")).toHaveTextContent("none");
    });

    expect(screen.getByTestId("is-authenticated")).toHaveTextContent("false");
    expect(adminAxiosInstance.post).toHaveBeenCalledWith("/admin/auth/logout");
  });

  it("should handle logout API failure and still clear admin state", async () => {
    const user = userEvent.setup();
    const logoutError = new Error("Logout failed");
    adminAxiosInstance.get.mockResolvedValueOnce({
      data: { admin: { name: "John Admin" } },
    });
    adminAxiosInstance.post.mockRejectedValueOnce(logoutError);

    render(
      <AdminAuthProvider>
        <TestConsumer />
      </AdminAuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("admin-name")).toHaveTextContent("John Admin");
    });

    const logoutBtn = screen.getByRole("button", { name: /Logout/i });
    await user.click(logoutBtn);

    await waitFor(() => {
      expect(screen.getByTestId("admin-name")).toHaveTextContent("none");
    });

    expect(logger.error).toHaveBeenCalledWith("Admin logout failed", {
      error: logoutError.message,
    });
  });

  it("should allow setAdmin to update admin state directly", async () => {
    const user = userEvent.setup();
    adminAxiosInstance.get.mockResolvedValueOnce({ data: {} });

    render(
      <AdminAuthProvider>
        <TestConsumer />
      </AdminAuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    const setAdminBtn = screen.getByRole("button", { name: /Set Admin/i });
    await user.click(setAdminBtn);

    expect(screen.getByTestId("admin-name")).toHaveTextContent("Updated Admin");
  });

  it("should skip auth check if didLogout ref is true", async () => {
    const user = userEvent.setup();
    adminAxiosInstance.get.mockResolvedValueOnce({
      data: { admin: { name: "John Admin" } },
    });
    adminAxiosInstance.post.mockResolvedValueOnce({});

    render(
      <AdminAuthProvider>
        <TestConsumer />
      </AdminAuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("admin-name")).toHaveTextContent("John Admin");
    });

    const logoutBtn = screen.getByRole("button", { name: /Logout/i });
    await user.click(logoutBtn);

    await waitFor(() => {
      expect(screen.getByTestId("admin-name")).toHaveTextContent("none");
    });

    expect(adminAxiosInstance.get).toHaveBeenCalledTimes(1);
  });
});

/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */
