import { render, screen, fireEvent, act } from "@testing-library/react";
import ReferModal from "./ReferModal";
import {
  getSimilarMentors,
  referRequest,
} from "@features/mentor/api/mentor.api";

vi.mock("@features/mentor/api/mentor.api");

describe("ReferModal Component", () => {
  const mockOnClose = vi.fn();
  const mockOnReferred = vi.fn();

  const defaultRequest = {
    _id: "req123",
    mentee: {
      name: "John Doe",
      email: "john@example.com",
    },
  };

  const defaultMentors = [
    {
      _id: "m1",
      user: {
        _id: "u1",
        name: "Jane Smith",
      },
      skills: ["React", "Node.js"],
      avgRating: 4.5,
      currentRole: "Tech Lead",
      company: "Google",
      profilePicture: "jane.jpg",
    },
    {
      _id: "m2",
      user: {
        _id: "u2",
        name: "Bob Johnson",
      },
      skills: ["Java", "Spring"],
      avgRating: 0,
      currentRole: "Backend Dev",
      company: "",
      profilePicture: "",
    },
  ];

  const defaultMySkills = ["React", "CSS"];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loader and then lists similar mentors", async () => {
    getSimilarMentors.mockResolvedValueOnce({
      data: {
        mentors: defaultMentors,
        mySkills: defaultMySkills,
      },
    });

    render(
      <ReferModal
        request={defaultRequest}
        onClose={mockOnClose}
        onReferred={mockOnReferred}
      />,
    );

    expect(screen.getByText("Finding similar mentors...")).toBeInTheDocument();

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("Bob Johnson")).toBeInTheDocument();
    expect(screen.getByText("⭐ 4.5")).toBeInTheDocument();
    // Check matching skill (React matches)
    expect(screen.getByText("React")).toBeInTheDocument();
  });

  it("handles empty state when no similar mentors are found", async () => {
    getSimilarMentors.mockResolvedValueOnce({
      data: {
        mentors: [],
        mySkills: [],
      },
    });

    render(
      <ReferModal
        request={defaultRequest}
        onClose={mockOnClose}
        onReferred={mockOnReferred}
      />,
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByText("No similar mentors found")).toBeInTheDocument();
  });

  it("displays fetch error message if similar mentors fetch fails", async () => {
    const errorResponse = {
      response: {
        data: {
          message: "Database fetch failed",
        },
      },
    };
    getSimilarMentors.mockRejectedValueOnce(errorResponse);

    render(
      <ReferModal
        request={defaultRequest}
        onClose={mockOnClose}
        onReferred={mockOnReferred}
      />,
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByText("Database fetch failed")).toBeInTheDocument();
  });

  it("allows selecting a mentor and referring successfully", async () => {
    getSimilarMentors.mockResolvedValueOnce({
      data: {
        mentors: defaultMentors,
        mySkills: defaultMySkills,
      },
    });
    referRequest.mockResolvedValueOnce({ data: { success: true } });

    render(
      <ReferModal
        request={defaultRequest}
        onClose={mockOnClose}
        onReferred={mockOnReferred}
      />,
    );

    await act(async () => {
      await Promise.resolve();
    });

    // Select Jane Smith
    const janeBtn = screen.getByRole("button", { name: /Jane Smith/i });
    fireEvent.click(janeBtn);

    // Click Refer Request button
    const referBtn = screen.getByRole("button", { name: "Refer Request" });
    fireEvent.click(referBtn);

    expect(screen.getByText("Referring...")).toBeInTheDocument();

    await act(async () => {
      await Promise.resolve();
    });

    expect(referRequest).toHaveBeenCalledWith("req123", "u1");
    expect(mockOnReferred).toHaveBeenCalledWith("req123", "referred");

    // Success screen
    expect(screen.getByText("Request Referred!")).toBeInTheDocument();

    // Close success screen
    const backBtn = screen.getByRole("button", { name: "Back to Requests" });
    fireEvent.click(backBtn);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("handles submit referral failures", async () => {
    getSimilarMentors.mockResolvedValueOnce({
      data: {
        mentors: defaultMentors,
        mySkills: defaultMySkills,
      },
    });
    referRequest.mockRejectedValueOnce(new Error("Network Error"));

    render(
      <ReferModal
        request={defaultRequest}
        onClose={mockOnClose}
        onReferred={mockOnReferred}
      />,
    );

    await act(async () => {
      await Promise.resolve();
    });

    const janeBtn = screen.getByRole("button", { name: /Jane Smith/i });
    fireEvent.click(janeBtn);

    const referBtn = screen.getByRole("button", { name: "Refer Request" });
    fireEvent.click(referBtn);

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByText("Failed to refer request.")).toBeInTheDocument();
  });

  it("covers fallback initials, singular labels, and >4 matching skills (lines 58, 110, 117, 179)", async () => {
    // 1 mentor (covers line 110: "1 mentor with similar skills")
    // skills list has 5 elements all in mySkills (covers line 179: "+1 more")
    // mentor.user.name is empty (covers line 117-124 fallback initials)
    const edgeMentors = [
      {
        _id: "m_edge",
        user: { _id: "u_edge", name: "" }, // empty name
        skills: ["React", "CSS", "HTML", "JS", "Git"],
        avgRating: 4.0,
        currentRole: "Lead",
        company: "Google",
        profilePicture: "",
      },
    ];

    getSimilarMentors.mockResolvedValueOnce({
      data: {
        mentors: edgeMentors,
        mySkills: ["React", "CSS", "HTML", "JS", "Git"],
      },
    });

    const edgeRequest = {
      _id: "req_edge",
      mentee: null, // empty mentee to cover line 58 initials fallback "?"
    };

    render(
      <ReferModal
        request={edgeRequest}
        onClose={mockOnClose}
        onReferred={mockOnReferred}
      />,
    );

    await act(async () => {
      await Promise.resolve();
    });

    // Singular check
    expect(
      screen.getByText("1 mentor with similar skills"),
    ).toBeInTheDocument();

    // Mentor initials fallback "?"
    expect(screen.getAllByText("?").length).toBeGreaterThan(0);

    // Skills +1 more
    expect(screen.getByText("+1 more")).toBeInTheDocument();
  });

  it("covers null mentors/mySkills fallback in response data (lines 28-29)", async () => {
    getSimilarMentors.mockResolvedValueOnce({
      data: {
        mentors: null,
        mySkills: null,
      },
    });

    render(
      <ReferModal
        request={defaultRequest}
        onClose={mockOnClose}
        onReferred={mockOnReferred}
      />,
    );

    await act(async () => {
      await Promise.resolve();
    });

    // With null mentors falling back to [], the empty state should show
    expect(screen.getByText("No similar mentors found")).toBeInTheDocument();
  });

  it("covers generic error fallback when getSimilarMentors fails without response.data.message (line 32)", async () => {
    getSimilarMentors.mockRejectedValueOnce(new Error("Network Error"));

    render(
      <ReferModal
        request={defaultRequest}
        onClose={mockOnClose}
        onReferred={mockOnReferred}
      />,
    );

    await act(async () => {
      await Promise.resolve();
    });

    // Falls through to the generic fallback message
    expect(
      screen.getByText("Failed to load similar mentors."),
    ).toBeInTheDocument();
  });

  it("covers referRequest error with response.data.message (line 51 left branch)", async () => {
    getSimilarMentors.mockResolvedValueOnce({
      data: {
        mentors: defaultMentors,
        mySkills: defaultMySkills,
      },
    });
    const apiError = {
      response: {
        data: {
          message: "Referral quota exceeded",
        },
      },
    };
    referRequest.mockRejectedValueOnce(apiError);

    render(
      <ReferModal
        request={defaultRequest}
        onClose={mockOnClose}
        onReferred={mockOnReferred}
      />,
    );

    await act(async () => {
      await Promise.resolve();
    });

    const janeBtn = screen.getByRole("button", { name: /Jane Smith/i });
    fireEvent.click(janeBtn);

    const referBtn = screen.getByRole("button", { name: "Refer Request" });
    fireEvent.click(referBtn);

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByText("Referral quota exceeded")).toBeInTheDocument();
  });
});
