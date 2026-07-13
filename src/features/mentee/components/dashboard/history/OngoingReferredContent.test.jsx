import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OngoingContent, ReferredContent } from "./OngoingReferredContent";
import { downloadInvoice } from "@features/mentee/api/mentee.api";

// Mock external systems
vi.mock("@features/mentee/api/mentee.api", () => ({
  downloadInvoice: vi.fn(),
}));

vi.mock(
  "@features/mentee/components/dashboard/history/RequestStatusViews",
  () => ({
    SlotRow: ({ slot }) => (
      <div data-testid="slot-row">
        {slot.day} {slot.startTime}
      </div>
    ),
  }),
);

vi.mock(
  "@features/mentee/components/dashboard/findMentors/MentorProfileModal",
  () => ({
    default: ({ mentor, onClose }) => (
      <div data-testid="mentor-profile-modal">
        Modal for {mentor.user.name}
        <button onClick={onClose}>Close Profile</button>
      </div>
    ),
  }),
);

vi.mock("@lib/logger", () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

describe("OngoingReferredContent", () => {
  beforeAll(() => {
    globalThis.URL.createObjectURL = vi.fn(() => "blob:url");
    globalThis.URL.revokeObjectURL = vi.fn();
    globalThis.alert = vi.fn();
  });

  afterAll(() => {
    delete globalThis.URL.createObjectURL;
    delete globalThis.URL.revokeObjectURL;
    delete globalThis.alert;
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("OngoingContent", () => {
    const request = {
      _id: "req1",
      totalAmount: 100,
      sessionRate: 50,
      sessionCount: 2,
      paidAt: "2026-07-20T10:00:00Z",
      confirmedSlot: {
        day: "Monday",
        date: "2026-07-20",
        startTime: "09:00",
        endTime: "10:00",
      },
    };

    const mockOnClose = vi.fn();

    it("renders payment summary and confirmed slot information", () => {
      render(<OngoingContent request={request} onClose={mockOnClose} />);

      expect(
        screen.getByText("100 tokens secured in escrow"),
      ).toBeInTheDocument();
      expect(screen.getByText(/Monday, Jul 20, 2026/i)).toBeInTheDocument();
      expect(screen.getByText("09:00 AM – 10:00 AM")).toBeInTheDocument();
      expect(screen.getByText("Rate per session")).toBeInTheDocument();
      expect(screen.getByText("50 tokens")).toBeInTheDocument();
      expect(screen.getByText("Total locked")).toBeInTheDocument();
      expect(screen.getByText("Paid on Jul 20, 2026")).toBeInTheDocument();
    });

    it("downloads invoice successfully on button click", async () => {
      const user = userEvent.setup();
      downloadInvoice.mockResolvedValueOnce({ data: new Blob() });

      render(<OngoingContent request={request} onClose={mockOnClose} />);

      const dlBtn = screen.getByRole("button", { name: /Download Invoice/i });
      await user.click(dlBtn);

      expect(downloadInvoice).toHaveBeenCalledWith("req1");
      expect(globalThis.URL.createObjectURL).toHaveBeenCalled();
      expect(globalThis.URL.revokeObjectURL).toHaveBeenCalledWith("blob:url");
    });

    it("handles invoice download API rejection", async () => {
      const user = userEvent.setup();
      downloadInvoice.mockRejectedValueOnce(new Error("Download Timeout"));

      render(<OngoingContent request={request} onClose={mockOnClose} />);

      const dlBtn = screen.getByRole("button", { name: /Download Invoice/i });
      await user.click(dlBtn);

      expect(globalThis.alert).toHaveBeenCalledWith(
        "Failed to download invoice. Please try again.",
      );
    });

    it("triggers onClose", async () => {
      const user = userEvent.setup();
      render(<OngoingContent request={request} onClose={mockOnClose} />);

      const closeBtn = screen.getByRole("button", { name: "Close" });
      await user.click(closeBtn);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe("ReferredContent", () => {
    const request = {
      _id: "req2",
      mentor: { name: "Alice" },
      referredTo: {
        _id: "referredMentor123",
        name: "Bob",
        email: "bob@example.com",
      },
      referredToProfile: {
        currentRole: "Lead UX Designer",
        company: "Apple",
        industry: "Design",
        bio: "Designing clean interfaces.",
        hourlyRate: 80,
        avgRating: 4.9,
        yearsOfExperience: 8,
        profilePicture: "https://example.com/bob.jpg",
        skills: ["Figma", "UI", "UX"],
      },
      selectedSlots: [
        {
          day: "Tuesday",
          date: "2026-07-21",
          startTime: "10:00",
          endTime: "11:00",
        },
      ],
      message: "Hey, looking for Design mentoring",
    };

    const mockOnDelete = vi.fn();

    it("renders referral path and details", () => {
      render(<ReferredContent request={request} onDelete={mockOnDelete} />);

      expect(screen.getByText("Original Mentor")).toBeInTheDocument();
      expect(screen.getByText("Alice")).toBeInTheDocument();
      expect(screen.getByText("Referred To")).toBeInTheDocument();
      expect(screen.getByText("Bob")).toBeInTheDocument();
      expect(screen.getByText("Lead UX Designer")).toBeInTheDocument();
      expect(screen.getByTestId("slot-row")).toBeInTheDocument();
      expect(
        screen.getByText('"Hey, looking for Design mentoring"'),
      ).toBeInTheDocument();
    });

    it("opens and closes Referred Mentor Profile Modal", async () => {
      const user = userEvent.setup();
      render(<ReferredContent request={request} onDelete={mockOnDelete} />);

      const viewBtn = screen.getByRole("button", {
        name: /View Referred Mentor Profile/i,
      });
      await user.click(viewBtn);

      expect(screen.getByTestId("mentor-profile-modal")).toBeInTheDocument();
      expect(screen.getByText("Modal for Bob")).toBeInTheDocument();

      const closeBtn = screen.getByRole("button", { name: "Close Profile" });
      await user.click(closeBtn);

      expect(
        screen.queryByTestId("mentor-profile-modal"),
      ).not.toBeInTheDocument();
    });

    it("triggers delete click", async () => {
      const user = userEvent.setup();
      render(<ReferredContent request={request} onDelete={mockOnDelete} />);

      const delBtn = screen.getByRole("button", { name: /Delete Request/i });
      await user.click(delBtn);

      expect(mockOnDelete).toHaveBeenCalled();
    });
  });
});
