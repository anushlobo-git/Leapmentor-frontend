import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";

vi.mock("@components/layout/PublicLayout", () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="public-layout">{children}</div>,
}));
vi.mock("@features/marketing/components/Hero", () => ({
  __esModule: true,
  default: () => <div>Hero</div>,
}));
vi.mock("@features/marketing/components/Missions", () => ({
  __esModule: true,
  default: () => <div>Missions</div>,
}));
vi.mock("@features/marketing/components/Testimonials", () => ({
  __esModule: true,
  default: () => <div>Testimonials</div>,
}));

import Home from "./Home";
import * as authSlice from "@features/auth/store/authSlice";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({ useNavigate: () => mockNavigate }));

let selectorImpl = (fn) => {
  if (fn === authSlice.selectIsAuthenticated) return false;
  return { roles: ["mentee"] };
};

vi.mock("react-redux", () => ({
  useSelector: (fn) => selectorImpl(fn),
}));

describe("Home page", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it("renders PublicLayout and child sections when unauthenticated", () => {
    render(<Home />);
    expect(
      document.querySelector('[data-testid="public-layout"]'),
    ).toBeTruthy();
    expect(document.body.textContent).toContain("Hero");
    expect(document.body.textContent).toContain("Missions");
    expect(document.body.textContent).toContain("Testimonials");
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("navigates to mentee dashboard when authenticated as mentee", () => {
    selectorImpl = (fn) => {
      if (fn === authSlice.selectIsAuthenticated) return true;
      return { roles: ["mentee"] };
    };

    render(<Home />);
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/mentee", {
      replace: true,
    });
  });

  it("navigates to mentor dashboard when authenticated as mentor", () => {
    selectorImpl = (fn) => {
      if (fn === authSlice.selectIsAuthenticated) return true;
      return { roles: ["mentor"] };
    };

    render(<Home />);
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/mentor", {
      replace: true,
    });
  });
});
