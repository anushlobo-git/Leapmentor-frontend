import { render, screen } from "@testing-library/react";
import MenteeDashboard from "./MenteeDashboard";

vi.mock("@features/mentee/components/dashboard/DashboardLayout", () => ({
  default: () => <div data-testid="dashboard-layout">DashboardLayout</div>,
}));

describe("MenteeDashboard", () => {
  it("renders DashboardLayout", () => {
    render(<MenteeDashboard />);
    expect(screen.getByTestId("dashboard-layout")).toBeInTheDocument();
  });
});
