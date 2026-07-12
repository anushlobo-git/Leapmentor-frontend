/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import DashboardTopbar from "./DashboardTopbar";

// Mock dependencies
vi.mock("@features/auth/api/auth.api", () => ({
  logoutRequest: vi.fn(),
}));

vi.mock("@lib/cookies", () => ({
  clearAuthRole: vi.fn(),
}));

vi.mock("@constants/images", () => ({
  IMAGES: {
    LOGO: "/logo.png",
  },
}));

import { logoutRequest } from "@features/auth/api/auth.api";
import { clearAuthRole } from "@lib/cookies";

describe("DashboardTopbar", () => {
  let store;
  let onMenuToggle;
  let onLogoClick;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: () => ({ user: { id: "1" } }),
      },
    });
    onMenuToggle = vi.fn();
    onLogoClick = vi.fn();
    vi.clearAllMocks();
  });

  it("should render hamburger button", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <DashboardTopbar
            onMenuToggle={onMenuToggle}
            onLogoClick={onLogoClick}
            logoutRedirectPath="/"
          />
        </BrowserRouter>
      </Provider>
    );
    const hamburger = screen.getByLabelText("Open menu");
    expect(hamburger).toBeInTheDocument();
  });

  it("should render logo", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <DashboardTopbar
            onMenuToggle={onMenuToggle}
            onLogoClick={onLogoClick}
            logoutRedirectPath="/"
          />
        </BrowserRouter>
      </Provider>
    );
    const logo = screen.getByAltText("LeapMentor logo");
    expect(logo).toBeInTheDocument();
  });

  it("should render brand name", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <DashboardTopbar
            onMenuToggle={onMenuToggle}
            onLogoClick={onLogoClick}
            logoutRedirectPath="/"
          />
        </BrowserRouter>
      </Provider>
    );
    expect(screen.getByText("LeapMentor")).toBeInTheDocument();
  });

  it("should render logout button", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <DashboardTopbar
            onMenuToggle={onMenuToggle}
            onLogoClick={onLogoClick}
            logoutRedirectPath="/"
          />
        </BrowserRouter>
      </Provider>
    );
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });

  it("should call onMenuToggle when hamburger is clicked", async () => {
    const user = userEvent.setup();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <DashboardTopbar
            onMenuToggle={onMenuToggle}
            onLogoClick={onLogoClick}
            logoutRedirectPath="/"
          />
        </BrowserRouter>
      </Provider>
    );
    
    const hamburger = screen.getByLabelText("Open menu");
    await user.click(hamburger);
    
    expect(onMenuToggle).toHaveBeenCalledTimes(1);
  });

  it("should call onLogoClick when logo button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <DashboardTopbar
            onMenuToggle={onMenuToggle}
            onLogoClick={onLogoClick}
            logoutRedirectPath="/"
          />
        </BrowserRouter>
      </Provider>
    );
    
    const logoButton = screen.getByLabelText("Go to Home");
    await user.click(logoButton);
    
    expect(onLogoClick).toHaveBeenCalledTimes(1);
  });

  it("should handle logout on button click", async () => {
    const user = userEvent.setup();
    logoutRequest.mockResolvedValue({});
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <DashboardTopbar
            onMenuToggle={onMenuToggle}
            onLogoClick={onLogoClick}
            logoutRedirectPath="/login"
          />
        </BrowserRouter>
      </Provider>
    );
    
    const logoutButton = screen.getByText("Logout");
    await user.click(logoutButton);
    
    expect(logoutRequest).toHaveBeenCalled();
    expect(clearAuthRole).toHaveBeenCalled();
  });

  it("should handle logout even if API request fails", async () => {
    const user = userEvent.setup();
    logoutRequest.mockRejectedValue(new Error("API Error"));
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <DashboardTopbar
            onMenuToggle={onMenuToggle}
            onLogoClick={onLogoClick}
            logoutRedirectPath="/login"
          />
        </BrowserRouter>
      </Provider>
    );
    
    const logoutButton = screen.getByText("Logout");
    await user.click(logoutButton);
    
    expect(logoutRequest).toHaveBeenCalled();
    expect(clearAuthRole).toHaveBeenCalled();
  });

  it("should have header element", () => {
    const { container } = render(
      <Provider store={store}>
        <BrowserRouter>
          <DashboardTopbar
            onMenuToggle={onMenuToggle}
            onLogoClick={onLogoClick}
            logoutRedirectPath="/"
          />
        </BrowserRouter>
      </Provider>
    );
    const header = container.querySelector("header");
    expect(header).toBeInTheDocument();
  });

  it("should have header classes", () => {
    const { container } = render(
      <Provider store={store}>
        <BrowserRouter>
          <DashboardTopbar
            onMenuToggle={onMenuToggle}
            onLogoClick={onLogoClick}
            logoutRedirectPath="/"
          />
        </BrowserRouter>
      </Provider>
    );
    const header = container.querySelector("header");
    expect(header).toHaveClass("h-14");
    expect(header).toHaveClass("bg-white");
    expect(header).toHaveClass("border-b");
    expect(header).toHaveClass("border-slate-100");
  });
});
