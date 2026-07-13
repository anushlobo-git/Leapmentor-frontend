
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EmptyState, RequestRow, Toast } from "./WalletRequestTable";

vi.mock("./WalletStatusBadge", () => ({
  default: ({ status }) => <span data-testid="status-badge">{status}</span>,
}));

vi.mock("../../pages/walletRequests.utils", () => ({
  getInitials: vi.fn((name) => name.charAt(0)),
  getAvatarColor: vi.fn(() => ({ bg: "#000", text: "#fff" })),
  formatDate: vi.fn((date) => date || "—"),
}));

describe("WalletRequestTable Components", () => {
  describe("EmptyState", () => {
    it("should render empty state with provided label", () => {
      render(<EmptyState label="No requests found" />);

      expect(screen.getByText("No requests found")).toBeInTheDocument();
    });
  });

  describe("RequestRow", () => {
    const mockRequest = {
      _id: "req-1",
      mentee: {
        name: "Jane Doe",
        email: "jane@test.com",
        profilePicture: null,
      },
      currentBalance: 1500,
      createdAt: "2026-07-12",
      status: "pending",
    };

    it("should render request row with mentee details and pending actions", () => {
      const onApprove = vi.fn();
      const onReject = vi.fn();
      const onViewHistory = vi.fn();

      render(
        <table>
          <tbody>
            <RequestRow
              req={mockRequest}
              onApprove={onApprove}
              onReject={onReject}
              actionLoading={null}
              onViewHistory={onViewHistory}
            />
          </tbody>
        </table>,
      );

      expect(screen.getByText("Jane Doe")).toBeInTheDocument();
      expect(screen.getByText("jane@test.com")).toBeInTheDocument();
      expect(screen.getByText("1,500 LP")).toBeInTheDocument();
      expect(screen.getByTestId("status-badge")).toHaveTextContent("pending");
    });

    it("should call onApprove when approve button is clicked", async () => {
      const user = userEvent.setup();
      const onApprove = vi.fn();
      const onReject = vi.fn();
      const onViewHistory = vi.fn();

      render(
        <table>
          <tbody>
            <RequestRow
              req={mockRequest}
              onApprove={onApprove}
              onReject={onReject}
              actionLoading={null}
              onViewHistory={onViewHistory}
            />
          </tbody>
        </table>,
      );

      const approveBtn = screen.getByRole("button", { name: /Approve \+500 LP/i });
      await user.click(approveBtn);

      expect(onApprove).toHaveBeenCalledWith("req-1");
    });

    it("should call onReject when reject button is clicked", async () => {
      const user = userEvent.setup();
      const onApprove = vi.fn();
      const onReject = vi.fn();
      const onViewHistory = vi.fn();

      render(
        <table>
          <tbody>
            <RequestRow
              req={mockRequest}
              onApprove={onApprove}
              onReject={onReject}
              actionLoading={null}
              onViewHistory={onViewHistory}
            />
          </tbody>
        </table>,
      );

      const rejectBtn = screen.getByRole("button", { name: /Reject/i });
      await user.click(rejectBtn);

      expect(onReject).toHaveBeenCalledWith("req-1");
    });

    it("should call onViewHistory when history button is clicked", async () => {
      const user = userEvent.setup();
      const onApprove = vi.fn();
      const onReject = vi.fn();
      const onViewHistory = vi.fn();

      render(
        <table>
          <tbody>
            <RequestRow
              req={mockRequest}
              onApprove={onApprove}
              onReject={onReject}
              actionLoading={null}
              onViewHistory={onViewHistory}
            />
          </tbody>
        </table>,
      );

      const historyBtn = screen.getByRole("button", { name: /History/i });
      await user.click(historyBtn);

      expect(onViewHistory).toHaveBeenCalledWith(mockRequest.mentee);
    });

    it("should disable buttons and show processing text when actionLoading matches request id", () => {
      const onApprove = vi.fn();
      const onReject = vi.fn();
      const onViewHistory = vi.fn();

      render(
        <table>
          <tbody>
            <RequestRow
              req={mockRequest}
              onApprove={onApprove}
              onReject={onReject}
              actionLoading="req-1"
              onViewHistory={onViewHistory}
            />
          </tbody>
        </table>,
      );

      expect(screen.getByText("Processing…")).toBeInTheDocument();
      const approveBtn = screen.getByRole("button", { name: /Processing…/i });
      expect(approveBtn).toBeDisabled();
    });

    it("should show approved message when status is approved", () => {
      const onApprove = vi.fn();
      const onReject = vi.fn();
      const onViewHistory = vi.fn();

      render(
        <table>
          <tbody>
            <RequestRow
              req={{ ...mockRequest, status: "approved" }}
              onApprove={onApprove}
              onReject={onReject}
              actionLoading={null}
              onViewHistory={onViewHistory}
            />
          </tbody>
        </table>,
      );

      expect(screen.getByText("500 LP added ✓")).toBeInTheDocument();
    });

    it("should show rejected message when status is rejected", () => {
      const onApprove = vi.fn();
      const onReject = vi.fn();
      const onViewHistory = vi.fn();

      render(
        <table>
          <tbody>
            <RequestRow
              req={{ ...mockRequest, status: "rejected" }}
              onApprove={onApprove}
              onReject={onReject}
              actionLoading={null}
              onViewHistory={onViewHistory}
            />
          </tbody>
        </table>,
      );

      expect(screen.getByText("Request rejected")).toBeInTheDocument();
    });

    it("should render profile picture when available", () => {
      const onApprove = vi.fn();
      const onReject = vi.fn();
      const onViewHistory = vi.fn();

      render(
        <table>
          <tbody>
            <RequestRow
              req={{
                ...mockRequest,
                mentee: {
                  ...mockRequest.mentee,
                  profilePicture: "https://example.com/pic.jpg",
                },
              }}
              onApprove={onApprove}
              onReject={onReject}
              actionLoading={null}
              onViewHistory={onViewHistory}
            />
          </tbody>
        </table>,
      );

      const img = screen.getByAltText("Jane Doe");
      expect(img).toHaveAttribute("src", "https://example.com/pic.jpg");
    });

    it("should handle missing mentee data gracefully", () => {
      const onApprove = vi.fn();
      const onReject = vi.fn();
      const onViewHistory = vi.fn();

      render(
        <table>
          <tbody>
            <RequestRow
              req={{ ...mockRequest, mentee: null }}
              onApprove={onApprove}
              onReject={onReject}
              actionLoading={null}
              onViewHistory={onViewHistory}
            />
          </tbody>
        </table>,
      );

      expect(screen.getByText("Unknown")).toBeInTheDocument();
      expect(screen.getByText("—")).toBeInTheDocument();
    });
  });

  describe("Toast", () => {
    it("should render success toast with message", () => {
      render(<Toast toast={{ message: "Success!", type: "success" }} />);

      expect(screen.getByText("Success!")).toBeInTheDocument();
    });

    it("should render error toast with message", () => {
      render(<Toast toast={{ message: "Error occurred", type: "error" }} />);

      expect(screen.getByText("Error occurred")).toBeInTheDocument();
    });

    it("should render nothing when toast is null", () => {
      const { container } = render(<Toast toast={null} />);

      expect(container).toBeEmptyDOMElement();
    });
  });
});

/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */
