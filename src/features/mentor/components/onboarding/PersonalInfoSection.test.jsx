import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import PersonalInfoSection from "./PersonalInfoSection";
import { uploadMentorProfilePicture } from "@features/mentor/api/mentor.api";
import { validateImageFile } from "@lib/validation/schemas";

vi.mock("@features/mentor/api/mentor.api", () => ({
  uploadMentorProfilePicture: vi.fn(),
}));

vi.mock("@lib/validation/schemas", () => ({
  validateImageFile: vi.fn(),
}));

describe("PersonalInfoSection", () => {
  let form;
  let onChange;

  beforeEach(() => {
    vi.clearAllMocks();
    form = { profilePicture: "", bio: "Mentor bio" };
    onChange = vi.fn();
    validateImageFile.mockReturnValue({ valid: true, error: "" });
  });

  it("renders the profile and bio section", () => {
    render(<PersonalInfoSection form={form} onChange={onChange} />);

    expect(
      screen.getByRole("heading", { name: /Profile Picture & Bio/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Professional Bio/i)).toHaveValue(
      "Mentor bio",
    );
  });

  it("uploads a selected image and updates the form state", async () => {
    uploadMentorProfilePicture.mockResolvedValue({
      data: {
        url: "https://cdn.example.com/avatar.png",
        fileName: "avatar.png",
      },
    });

    const { container } = render(
      <PersonalInfoSection form={form} onChange={onChange} />,
    );
    const input = container.querySelector("input[type='file']");
    const file = new File(["avatar"], "avatar.png", { type: "image/png" });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(uploadMentorProfilePicture).toHaveBeenCalledTimes(1);
    });

    expect(onChange).toHaveBeenNthCalledWith(1, {
      target: {
        name: "profilePicture",
        value: "https://cdn.example.com/avatar.png",
      },
    });
    expect(onChange).toHaveBeenNthCalledWith(2, {
      target: { name: "profilePictureFileName", value: "avatar.png" },
    });
  });
});
