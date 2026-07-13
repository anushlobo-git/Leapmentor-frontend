//src/features/mentee/components/dashboard/findMentors/MentorProfileModal.test.jsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MentorProfileModal from "./MentorProfileModal";
import { getMentorAvailability } from "@features/mentee/api/mentee.api";
import useConnectRequest from "@features/connects/hooks/useConnectRequest";
import useSlotLock from "@features/sessions/hooks/useSlotLock";

// Mock external dependencies
vi.mock("@features/mentee/api/mentee.api", () => ({
  getMentorAvailability: vi.fn(),
}));

const mockSendRequest = vi.fn();
const mockReset = vi.fn();
vi.mock("@features/connects/hooks/useConnectRequest", () => ({
  default: vi.fn(() => ({
    sending: false,
    error: null,
    sendRequest: mockSendRequest,
    reset: mockReset,
  })),
}));

const mockLockSlot = vi.fn();
const mockUnlockSlot = vi.fn();
const mockUnlockAll = vi.fn();
vi.mock("@features/sessions/hooks/useSlotLock", () => ({
  default: vi.fn(() => ({
    lockSlot: mockLockSlot,
    unlockSlot: mockUnlockSlot,
    unlockAll: mockUnlockAll,
  })),
}));

vi.mock(
  "@features/mentee/components/dashboard/findMentors/ConnectSucessModal",
  () => ({
    default: ({ onBackToDashboard, mentorName }) => (
      <div data-testid="success-modal">
        Success for {mentorName}
        <button onClick={onBackToDashboard}>Back to Dashboard</button>
      </div>
    ),
  }),
);

describe("MentorProfileModal", () => {
  const mentorData = {
    user: { _id: "mentor123", name: "John Doe" },
    currentRole: "Lead Architect",
    company: "Netflix",
    industry: "Streaming",
    bio: "I build massive distributed systems.",
    hourlyRate: 100,
    avgRating: 5.0,
    reviewCount: 15,
    yearsOfExperience: 10,
    profilePicture: "https://example.com/john.jpg",
    location: "California, USA",
    totalSessions: 50,
  };

  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    getMentorAvailability.mockResolvedValue({
      data: {
        slots: [
          {
            date: "2026-07-20",
            day: "Monday",
            displayDate: "Mon, Jul 20",
            slots: [
              { startTime: "09:00", endTime: "10:00", isBooked: false },
              { startTime: "10:00", endTime: "11:00", isBooked: false },
            ],
          },
          {
            date: "2026-07-21",
            day: "Tuesday",
            displayDate: "Tue, Jul 21",
            slots: [{ startTime: "09:00", endTime: "10:00", isBooked: false }],
          },
        ],
        sessionDurations: [30, 60],
      },
    });
    mockLockSlot.mockResolvedValue({ ok: true });
    mockUnlockSlot.mockResolvedValue(true);
    mockUnlockAll.mockResolvedValue(true);
    mockSendRequest.mockResolvedValue(true);
  });

  it("renders mentor profile information and badges", async () => {
    render(<MentorProfileModal mentor={mentorData} onClose={mockOnClose} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Lead Architect at Netflix")).toBeInTheDocument();
    expect(
      screen.getByText("I build massive distributed systems."),
    ).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("(15 reviews)")).toBeInTheDocument();
    expect(screen.getByText("Streaming")).toBeInTheDocument();
    expect(screen.getByText("10 Years")).toBeInTheDocument();
    expect(screen.getByText("California, USA")).toBeInTheDocument();

    // Check loading skeleton disappears
    await waitFor(() => {
      expect(screen.queryByText(/No available slots/i)).not.toBeInTheDocument();
    });
  });

  it("handles profile picture img load error and falls back to initials", () => {
    render(<MentorProfileModal mentor={mentorData} onClose={mockOnClose} />);
    const img = screen.getByRole("img", { name: "John Doe" });
    fireEvent.error(img);
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("fetches availability slots on render and displays them", async () => {
    render(<MentorProfileModal mentor={mentorData} onClose={mockOnClose} />);

    expect(getMentorAvailability).toHaveBeenCalledWith("mentor123", 60);

    // Wait for the slot pill to render
    const slotPill = await screen.findByRole("button", { name: /09:00/i });
    expect(slotPill).toBeInTheDocument();
  });

  it("handles slot fetch error cleanly", async () => {
    getMentorAvailability.mockRejectedValueOnce(new Error("Network Error"));
    render(<MentorProfileModal mentor={mentorData} onClose={mockOnClose} />);

    const errMsg = await screen.findByText("Failed to load available slots.");
    expect(errMsg).toBeInTheDocument();
  });

  it("updates slots when duration is changed", async () => {
    const user = userEvent.setup();
    render(<MentorProfileModal mentor={mentorData} onClose={mockOnClose} />);

    await screen.findByRole("button", { name: /09:00/i });

    const durBtn = screen.getByRole("button", { name: "30 min" });
    await user.click(durBtn);

    expect(getMentorAvailability).toHaveBeenCalledWith("mentor123", 30);
  });

  it("sets fallback duration when returned sessionDurations does not include current duration", async () => {
    getMentorAvailability.mockResolvedValueOnce({
      data: {
        slots: [],
        sessionDurations: [45],
      },
    });

    render(<MentorProfileModal mentor={mentorData} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(getMentorAvailability).toHaveBeenCalledWith("mentor123", 60);
    });
  });

  it("allows selecting, toggling, and removing slots", async () => {
    const user = userEvent.setup();
    render(<MentorProfileModal mentor={mentorData} onClose={mockOnClose} />);

    const slotPill = await screen.findByRole("button", { name: /09:00/i });
    await user.click(slotPill);

    expect(mockLockSlot).toHaveBeenCalledWith("2026-07-20", "09:00", "10:00");
    expect(screen.getByText("Your selections")).toBeInTheDocument();
    expect(screen.getAllByText("Mon, Jul 20").length).toBeGreaterThan(0);

    // Toggle same slot again to deselect
    await user.click(slotPill);
    expect(mockUnlockSlot).toHaveBeenCalledWith("2026-07-20", "09:00", "10:00");
  });

  it("handles lock slot failure gracefully", async () => {
    mockLockSlot.mockResolvedValueOnce({ ok: false, code: "SLOT_BOOKED" });
    const user = userEvent.setup();
    render(<MentorProfileModal mentor={mentorData} onClose={mockOnClose} />);

    const slotPill = await screen.findByRole("button", { name: /09:00/i });
    await user.click(slotPill);

    const errorBanner = await screen.findByText(
      /This slot was just booked by someone/i,
    );
    expect(errorBanner).toBeInTheDocument();
  });

  it("handles hold slot failure gracefully", async () => {
    mockLockSlot.mockResolvedValueOnce({ ok: false, code: "SLOT_HELD" });
    const user = userEvent.setup();
    render(<MentorProfileModal mentor={mentorData} onClose={mockOnClose} />);

    const slotPill = await screen.findByRole("button", { name: /09:00/i });
    await user.click(slotPill);

    const errorBanner = await screen.findByText(
      /This slot is temporarily held/i,
    );
    expect(errorBanner).toBeInTheDocument();
  });

  it("allows removing selected slot via the selection list remove button", async () => {
    const user = userEvent.setup();
    render(<MentorProfileModal mentor={mentorData} onClose={mockOnClose} />);

    const slotPill = await screen.findByRole("button", { name: /09:00/i });
    await user.click(slotPill);

    const removeBtn = screen.getByTitle("Remove slot");
    await user.click(removeBtn);

    expect(screen.queryByText("Your selections")).not.toBeInTheDocument();
  });

  it("allows clearing all slots at once", async () => {
    const user = userEvent.setup();
    render(<MentorProfileModal mentor={mentorData} onClose={mockOnClose} />);

    const slotPills = await screen.findAllByRole("button", {
      name: /09:00|10:00/i,
    });
    await user.click(slotPills[0]);

    const clearAllBtn = screen.getByRole("button", { name: /Clear all/i });
    await user.click(clearAllBtn);

    expect(screen.queryByText("Your selections")).not.toBeInTheDocument();
  });

  it("enforces max slot selection limits", async () => {
    // Return many slots
    getMentorAvailability.mockResolvedValue({
      data: {
        slots: [
          {
            date: "2026-07-20",
            day: "Monday",
            displayDate: "Mon, Jul 20",
            slots: [
              { startTime: "09:00", endTime: "10:00", isBooked: false },
              { startTime: "10:00", endTime: "11:00", isBooked: false },
              { startTime: "11:00", endTime: "12:00", isBooked: false },
              { startTime: "12:00", endTime: "13:00", isBooked: false },
              { startTime: "13:00", endTime: "14:00", isBooked: false },
              { startTime: "14:00", endTime: "15:00", isBooked: false },
            ],
          },
        ],
      },
    });

    const user = userEvent.setup();
    render(<MentorProfileModal mentor={mentorData} onClose={mockOnClose} />);

    const slotPills = await screen.findAllByRole("button", { name: /:/i });
    // Click 5 slots
    await user.click(slotPills[0]);
    await user.click(slotPills[1]);
    await user.click(slotPills[2]);
    await user.click(slotPills[3]);
    await user.click(slotPills[4]);

    expect(screen.getByText("5/5")).toBeInTheDocument();

    // Click 6th slot (should be disabled or not call lockSlot)
    await user.click(slotPills[5]);
    expect(mockLockSlot).toHaveBeenCalledTimes(5);
  });

  it("submits request with custom message and displays Success Modal", async () => {
    const user = userEvent.setup();
    render(<MentorProfileModal mentor={mentorData} onClose={mockOnClose} />);

    const slotPill = await screen.findByRole("button", { name: /09:00/i });
    await user.click(slotPill);

    const textInput = screen.getByPlaceholderText(
      /I'm looking for guidance on/i,
    );
    await user.type(textInput, "Hello world");

    const submitBtn = screen.getByRole("button", {
      name: /Send Connect Request/i,
    });
    await user.click(submitBtn);

    expect(mockSendRequest).toHaveBeenCalledWith({
      mentorId: "mentor123",
      message: "Hello world",
      selectedSlots: [
        {
          day: "Monday",
          date: "2026-07-20",
          startTime: "09:00",
          endTime: "10:00",
        },
      ],
    });

    const successModal = await screen.findByTestId("success-modal");
    expect(successModal).toBeInTheDocument();

    // Click back to dashboard
    const backBtn = screen.getByRole("button", { name: "Back to Dashboard" });
    await user.click(backBtn);

    expect(mockReset).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("handles cancel/close click and calls unlockAll", async () => {
    const user = userEvent.setup();
    render(<MentorProfileModal mentor={mentorData} onClose={mockOnClose} />);

    const cancelBtn = screen.getByRole("button", { name: "Cancel" });
    await user.click(cancelBtn);

    expect(mockUnlockAll).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("switches active day index on day tab click", async () => {
    const user = userEvent.setup();
    render(<MentorProfileModal mentor={mentorData} onClose={mockOnClose} />);

    // Mon tab is default active. Let's find and click Tue tab.
    const tueTab = await screen.findByRole("button", { name: /Tue/i });
    await user.click(tueTab);

    // Confirm that it displays the slot from Tuesday
    expect(
      await screen.findByRole("button", { name: /09:00/i }),
    ).toBeInTheDocument();
  });

  it("handles close cross button click at the top right", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <MentorProfileModal mentor={mentorData} onClose={mockOnClose} />,
    );

    // Click the top right cross close button
    const crossBtn = container.querySelector("button.w-8.h-8");
    expect(crossBtn).toBeInTheDocument();

    await user.click(crossBtn);
    expect(mockUnlockAll).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });
});
