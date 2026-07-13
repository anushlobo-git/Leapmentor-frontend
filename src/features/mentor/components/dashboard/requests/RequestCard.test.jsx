import { render, screen, fireEvent } from "@testing-library/react";
import RequestCard from "./RequestCard";

describe("RequestCard Component", () => {
  const mockOnViewProfile = vi.fn();

  const defaultRequest = {
    _id: "req1",
    mentee: {
      name: "John Doe",
      email: "john@example.com",
    },
    message: "Hi! Help me build something.",
    selectedSlots: [
      { day: "Wednesday", date: "2026-07-15", startTime: "09:00", endTime: "10:00" },
      { day: "Thursday", date: "2026-07-16", startTime: "14:00", endTime: "15:00" },
    ],
    status: "pending",
    requestedAt: "2026-07-12T10:00:00Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders pending request card correctly", () => {
    render(
      <RequestCard request={defaultRequest} onViewProfile={mockOnViewProfile} />
    );

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(screen.getByText('"Hi! Help me build something."')).toBeInTheDocument();

    // Check display slot (first slot)
    expect(screen.getByText("Wednesday, Jul 15, 2026")).toBeInTheDocument();
    expect(screen.getByText(/09:00 AM/)).toBeInTheDocument();
    expect(screen.getByText(/10:00 AM/)).toBeInTheDocument();

    // Extra slots indicator
    expect(screen.getByText("+1")).toBeInTheDocument();

    // Actions
    const respondBtn = screen.getByRole("button", { name: "Respond" });
    fireEvent.click(respondBtn);
    expect(mockOnViewProfile).toHaveBeenCalledWith(defaultRequest);
  });

  it("shows detail modal when Details/Extra slots button clicked", () => {
    render(
      <RequestCard request={defaultRequest} onViewProfile={mockOnViewProfile} />
    );

    const detailBtn = screen.getByRole("button", { name: "View Details" });
    fireEvent.click(detailBtn);

    // Modal is opened
    expect(screen.getByText("Proposed Slots")).toBeInTheDocument();
    expect(screen.getByText("Thursday, Jul 16, 2026")).toBeInTheDocument();

    // Close details
    const closeBtn = screen.getByRole("button", { name: "Close" });
    fireEvent.click(closeBtn);
    expect(screen.queryByText("Proposed Slots")).not.toBeInTheDocument();
  });

  it("handles referredBy and referredOut status layouts", () => {
    const referredRequest = {
      ...defaultRequest,
      status: "referred",
      referredBy: {
        name: "Jane Advisor",
        email: "jane@advisor.com",
      },
      referredByProfile: {
        currentRole: "Advisor",
        company: "Co",
        industry: "Finance",
        bio: "Bio",
        avgRating: 4.8,
        skills: ["Strategy"],
      },
    };

    render(
      <RequestCard request={referredRequest} onViewProfile={mockOnViewProfile} />
    );

    expect(screen.getByText("Referred")).toBeInTheDocument();
    expect(screen.getByText("Referred to another mentor")).toBeInTheDocument();
    expect(screen.getByText(/Referred by/i)).toBeInTheDocument();
    expect(screen.getByText("Jane Advisor")).toBeInTheDocument();
  });

  it("renders accepted status card with confirmed slot", () => {
    const acceptedRequest = {
      ...defaultRequest,
      status: "accepted",
      confirmedSlot: {
        day: "Thursday",
        date: "2026-07-16",
        startTime: "14:00",
        endTime: "15:00",
      },
    };

    render(
      <RequestCard request={acceptedRequest} onViewProfile={mockOnViewProfile} />
    );

    expect(screen.getByText("Accepted")).toBeInTheDocument();
    // Confirmed slot displayed instead of proposed
    expect(screen.getByText("Thursday, Jul 16, 2026")).toBeInTheDocument();
    expect(screen.getByText(/02:00 PM/)).toBeInTheDocument();
    expect(screen.getByText(/03:00 PM/)).toBeInTheDocument();
  });

  it("covers format functions fallbacks", () => {
    const sparseRequest = {
      _id: "req2",
      status: "unknown_status",
      requestedAt: "invalid_date",
    };

    render(
      <RequestCard request={sparseRequest} onViewProfile={mockOnViewProfile} />
    );

    expect(screen.getByText("?")).toBeInTheDocument();
    // Status fallback is Pending
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("covers click on extra slots and referredBy details flows, and missing name fallback (lines 141, 360, 377, 478)", () => {
    const edgeRequest = {
      ...defaultRequest,
      referredBy: {
        name: "", // empty name covers line 141 fallback "?"
        email: "jane@advisor.com",
      },
      referredByProfile: {
        currentRole: "Advisor",
      },
    };

    render(
      <RequestCard request={edgeRequest} onViewProfile={mockOnViewProfile} />
    );

    // Click the '+1 more' button (line 360)
    const plusBtn = screen.getByRole("button", { name: /\+1\s*more/i });
    fireEvent.click(plusBtn);

    // SlotsModal initials fallback "?" check (line 141)
    expect(screen.getAllByText("?").length).toBeGreaterThan(0);

    // Close SlotsModal
    const closeSlotsBtn = screen.getByRole("button", { name: "Close" });
    fireEvent.click(closeSlotsBtn);

    // Click referredBy banner button (line 377)
    const referredBtn = screen.getByRole("button", { name: /Referred by/i });
    fireEvent.click(referredBtn);

    // ReferredByProfileModal is open
    expect(screen.getByText("This mentor referred this request to you")).toBeInTheDocument();

    // Close ReferredByProfileModal (covers line 478 onClose logic)
    const closeProfileBtn = screen.getByRole("button", { name: "Close" });
    fireEvent.click(closeProfileBtn);
    expect(screen.queryByText("This mentor referred this request to you")).not.toBeInTheDocument();
  });

  it("shows confirmed session in SlotsModal for accepted requests (line 160)", () => {
    const acceptedRequest = {
      ...defaultRequest,
      status: "accepted",
      confirmedSlot: {
        day: "Thursday",
        date: "2026-07-16",
        startTime: "14:00",
        endTime: "15:00",
      },
    };

    render(
      <RequestCard request={acceptedRequest} onViewProfile={mockOnViewProfile} />
    );

    // Open SlotsModal via View Details
    const detailBtn = screen.getByRole("button", { name: "View Details" });
    fireEvent.click(detailBtn);

    // Confirmed Session section should render (line 160)
    expect(screen.getByText("Confirmed Session")).toBeInTheDocument();
    // Date appears in both the card slot and the SlotsModal, so use getAllByText
    expect(screen.getAllByText(/Jul 16, 2026/).length).toBeGreaterThanOrEqual(1);

    // Close SlotsModal
    const closeBtn = screen.getByRole("button", { name: "Close" });
    fireEvent.click(closeBtn);
  });

  it("covers SlotsModal name fallback when mentee name is missing (line 96)", () => {
    const noNameRequest = {
      ...defaultRequest,
      mentee: { email: "anon@example.com" },
    };

    render(
      <RequestCard request={noNameRequest} onViewProfile={mockOnViewProfile} />
    );

    // Open SlotsModal
    const detailBtn = screen.getByRole("button", { name: "View Details" });
    fireEvent.click(detailBtn);

    // The name fallback should render "—" (line 96)
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);

    // Close SlotsModal
    const closeBtn = screen.getByRole("button", { name: "Close" });
    fireEvent.click(closeBtn);
  });

  it("covers formatTime PM branch, midnight h%12||12, and formatDate null/invalid guards", () => {
    const branchRequest = {
      _id: "reqTimeBranch",
      mentee: { name: "Time Test" },
      selectedSlots: [
        { day: "Friday", date: "2026-08-01", startTime: "14:30", endTime: "15:00" }, // PM
        { day: "Saturday", date: "2026-08-02", startTime: "00:15", endTime: "12:00" }, // midnight + noon
        { day: "", date: "", startTime: "", endTime: "" }, // falsy guards → formatDate returns "—", formatTime returns ""
      ],
      status: "pending",
      requestedAt: "", // covers formatDate returning "—" for falsy dateStr
    };

    render(
      <RequestCard request={branchRequest} onViewProfile={mockOnViewProfile} />
    );

    // PM time should render
    expect(screen.getByText(/02:30 PM/)).toBeInTheDocument();

    // Open SlotsModal to exercise all slots (including the null/empty one)
    const detailBtn = screen.getByRole("button", { name: "View Details" });
    fireEvent.click(detailBtn);

    // Midnight 00:15 → "12:15 AM" (h%12=0, ||12 kicks in)
    expect(screen.getByText(/12:15 AM/)).toBeInTheDocument();
    // Noon 12:00 → "12:00 PM" (h%12=0, ||12 kicks in, h>=12 → PM)
    expect(screen.getByText(/12:00 PM/)).toBeInTheDocument();
    // The "—" fallback for empty date
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);

    // Close SlotsModal
    const closeBtn = screen.getByRole("button", { name: "Close" });
    fireEvent.click(closeBtn);
  });

  it("covers referredByMentor || fallback branches when referredByProfile fields are missing (lines 259-260)", () => {
    const sparseReferralRequest = {
      ...defaultRequest,
      referredBy: {
        name: "Mentor",
        // no email → || "" fallback triggers
      },
      // no referredByProfile → all ?. chains return undefined, || "" fallback triggers
    };

    render(
      <RequestCard request={sparseReferralRequest} onViewProfile={mockOnViewProfile} />
    );

    // The referredBy banner should still render
    expect(screen.getByRole("button", { name: /Referred by/i })).toBeInTheDocument();

    // Click to open ReferredByProfileModal and confirm it renders with fallback values
    const referredBtn = screen.getByRole("button", { name: /Referred by/i });
    fireEvent.click(referredBtn);

    // Modal should open with fallback values
    expect(screen.getByText("This mentor referred this request to you")).toBeInTheDocument();

    // Close modal
    const closeBtn = screen.getByRole("button", { name: "Close" });
    fireEvent.click(closeBtn);
  });

  it("covers formatDate with date containing T (ISO date)", () => {
    const isoDateRequest = {
      _id: "reqISO",
      mentee: { name: "ISO Test" },
      selectedSlots: [
        { day: "Monday", date: "2026-08-01T10:00:00Z", startTime: "09:00", endTime: "10:00" },
      ],
      status: "pending",
      requestedAt: "2026-07-12T10:00:00Z",
    };

    render(
      <RequestCard request={isoDateRequest} onViewProfile={mockOnViewProfile} />
    );

    // Should render the formatted date (not "—")
    expect(screen.getByText(/Aug 1, 2026/)).toBeInTheDocument();
  });
});
