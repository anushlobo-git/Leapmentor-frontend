import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  SlotRow,
  PendingContent,
  AcceptedContent,
  CompletedContent,
  RejectedContent,
} from "./RequestStatusViews";

describe("RequestStatusViews", () => {
  // Use ISO format for times since formatTime (formatTimeString) expects real date-time strings
  const baseSlot = {
    day: "Monday",
    date: "2026-07-20",
    startTime: "2026-07-20T09:00:00.000Z",
    endTime: "2026-07-20T10:00:00.000Z",
  };

  const mockOnDelete = vi.fn();
  const mockOnClose = vi.fn();
  const mockOnPayClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("SlotRow", () => {
    it("renders unconfirmed slot style", () => {
      const { container } = render(
        <SlotRow slot={baseSlot} isConfirmed={false} />,
      );
      expect(screen.getByText("Monday, Jul 20")).toBeInTheDocument();
      // Match timezone-independent dash separator
      expect(screen.getByText(/–/)).toBeInTheDocument();
      expect(container.querySelector(".bg-slate-50")).toBeInTheDocument();
    });

    it("renders confirmed slot style", () => {
      const { container } = render(
        <SlotRow slot={baseSlot} isConfirmed={true} />,
      );
      expect(container.querySelector(".bg-emerald-50")).toBeInTheDocument();
    });
  });

  describe("PendingContent", () => {
    it("renders sent dates, slots, message, and triggers delete", async () => {
      const user = userEvent.setup();
      const mockRequest = {
        requestedAt: "2026-07-19T10:00:00Z",
        selectedSlots: [baseSlot],
        message: "Hello mentor",
      };

      render(<PendingContent request={mockRequest} onDelete={mockOnDelete} />);

      expect(screen.getByText("Sent on Jul 19, 2026")).toBeInTheDocument();
      expect(screen.getByText("Proposed Times")).toBeInTheDocument();
      expect(screen.getByText('"Hello mentor"')).toBeInTheDocument();

      const cancelBtn = screen.getByRole("button", { name: /Cancel Request/i });
      await user.click(cancelBtn);
      expect(mockOnDelete).toHaveBeenCalled();
    });

    it("does not render message card if message is empty", () => {
      const mockRequest = {
        requestedAt: "2026-07-19T10:00:00Z",
        selectedSlots: [baseSlot],
        message: "",
      };

      render(<PendingContent request={mockRequest} onDelete={mockOnDelete} />);
      expect(screen.queryByText("Your Message")).not.toBeInTheDocument();
    });
  });

  describe("AcceptedContent", () => {
    it("renders confirmed slots, triggers payment and close callbacks", async () => {
      const user = userEvent.setup();
      const mockRequest = {
        selectedSlots: [baseSlot],
        message: "Please pay",
      };

      render(
        <AcceptedContent
          request={mockRequest}
          onClose={mockOnClose}
          onPayClick={mockOnPayClick}
        />,
      );

      expect(screen.getByText("Confirmed Sessions (1)")).toBeInTheDocument();

      const payBtn = screen.getByRole("button", { name: /Make Payment/i });
      await user.click(payBtn);
      expect(mockOnPayClick).toHaveBeenCalled();

      const closeBtn = screen.getByRole("button", { name: "Close" });
      await user.click(closeBtn);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe("CompletedContent", () => {
    it("renders completed information and triggers close", async () => {
      const user = userEvent.setup();
      const mockRequest = {
        totalAmount: 100,
        confirmedSlot: baseSlot,
        completedAt: "2026-07-21T12:00:00Z",
      };

      render(<CompletedContent request={mockRequest} onClose={mockOnClose} />);

      expect(screen.getByText("Session Completed")).toBeInTheDocument();
      expect(
        screen.getByText("100 tokens released to mentor"),
      ).toBeInTheDocument();
      expect(screen.getByText("Monday, Jul 20, 2026")).toBeInTheDocument();
      expect(screen.getByText("Completed on Jul 21, 2026")).toBeInTheDocument();

      const closeBtn = screen.getByRole("button", { name: "Close" });
      await user.click(closeBtn);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe("RejectedContent", () => {
    it("renders rejected dates and triggers close", async () => {
      const user = userEvent.setup();
      const mockRequest = {
        respondedAt: "2026-07-20T15:00:00Z",
        selectedSlots: [baseSlot],
        message: "Rejected request msg",
      };

      render(<RejectedContent request={mockRequest} onClose={mockOnClose} />);

      expect(screen.getByText("Declined on Jul 20, 2026")).toBeInTheDocument();
      expect(screen.getByText('"Rejected request msg"')).toBeInTheDocument();

      const closeBtn = screen.getByRole("button", { name: "Close" });
      await user.click(closeBtn);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
