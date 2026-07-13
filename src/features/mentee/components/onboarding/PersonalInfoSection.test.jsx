import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PersonalInfoSection from "./PersonalInfoSection";
import { uploadProfilePicture } from "@features/mentee/api/mentee.api";
import { validateImageFile } from "@lib/validation/schemas";

// 1. Setup strict external mocks for api endpoints and validation schemas
vi.mock("@features/mentee/api/mentee.api", () => ({
  uploadProfilePicture: vi.fn(),
}));

vi.mock("@lib/validation/schemas", () => ({
  validateImageFile: vi.fn(),
}));

describe("PersonalInfoSection", () => {
  let mockForm;
  let mockHandleChange;

  beforeEach(() => {
    vi.clearAllMocks();
    mockHandleChange = vi.fn();
    mockForm = {
      profilePicture: "",
      bio: "Aspiring software engineer looking for advice.",
    };
    // Default valid image check return behavior
    validateImageFile.mockReturnValue({ valid: true, error: "" });
  });

  it("should render default section structures, bio text, and fallback vector icon when no picture exists", () => {
    const { container } = render(
      <PersonalInfoSection form={mockForm} handleChange={mockHandleChange} />,
    );

    expect(
      screen.getByRole("heading", { name: /Profile Picture & Bio/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Bio/i)).toHaveValue(
      "Aspiring software engineer looking for advice.",
    );

    // Target the first button (avatar container) to locate the placeholder SVG
    const avatarButton = screen.getAllByRole("button")[0];
    expect(avatarButton.querySelector("svg")).toBeInTheDocument();
  });

  it("should render an image element when profilePicture source string is provided", () => {
    mockForm.profilePicture = "https://cdn.leapmentor.com/avatar123.jpg";
    render(
      <PersonalInfoSection form={mockForm} handleChange={mockHandleChange} />,
    );

    const renderedImg = screen.getByAltText("Profile");
    expect(renderedImg).toBeInTheDocument();
    expect(renderedImg).toHaveAttribute(
      "src",
      "https://cdn.leapmentor.com/avatar123.jpg",
    );
  });

  it("should toggle fallback profile vector rules if structural image source triggers error events", () => {
    mockForm.profilePicture = "https://cdn.leapmentor.com/broken-link.jpg";
    render(
      <PersonalInfoSection form={mockForm} handleChange={mockHandleChange} />,
    );

    const renderedImg = screen.getByAltText("Profile");
    expect(renderedImg).toBeInTheDocument();

    // Fire synthetic error event to force broken image branch mapping layout
    fireEvent.error(renderedImg);

    expect(renderedImg).not.toBeInTheDocument();

    // Target the first button (avatar container) to locate the fallback SVG
    const avatarButton = screen.getAllByRole("button")[0];
    expect(avatarButton.querySelector("svg")).toBeInTheDocument();
  });

  it("should terminate file handling early if selection procedures yield empty file arrays", () => {
    const { container } = render(
      <PersonalInfoSection form={mockForm} handleChange={mockHandleChange} />,
    );
    const hiddenInput = container.querySelector("input[type='file']");

    // Fire empty change action directly on target DOM node element
    fireEvent.change(hiddenInput, { target: { files: [] } });

    expect(validateImageFile).not.toHaveBeenCalled();
    expect(uploadProfilePicture).not.toHaveBeenCalled();
  });

  it("should halt uploads and output error messages when file validations reject the selection", async () => {
    validateImageFile.mockReturnValueOnce({
      valid: false,
      error: "File exceeds 5MB limit rule.",
    });
    const { container } = render(
      <PersonalInfoSection form={mockForm} handleChange={mockHandleChange} />,
    );

    const hiddenInput = container.querySelector("input[type='file']");
    const testFile = new File(["dummyContent"], "large-pic.png", {
      type: "image/png",
    });

    fireEvent.change(hiddenInput, { target: { files: [testFile] } });

    expect(validateImageFile).toHaveBeenCalledWith(testFile, 5);
    expect(
      screen.getByText("File exceeds 5MB limit rule."),
    ).toBeInTheDocument();
    expect(uploadProfilePicture).not.toHaveBeenCalled();
  });

  it("should successfully execute sequential mappers and trigger change events upon finished network uploads", async () => {
    const fakeSuccessResponse = {
      data: {
        url: "https://cdn.leapmentor.com/new-upload.png",
        fileName: "new-upload.png",
      },
    };

    // Simulate progress tracker interactions explicitly using captured parameters inside mock calls
    uploadProfilePicture.mockImplementationOnce(
      (formData, onUploadProgress) => {
        if (onUploadProgress) {
          onUploadProgress({ loaded: 50, total: 100 });
        }
        return Promise.resolve(fakeSuccessResponse);
      },
    );

    const { container } = render(
      <PersonalInfoSection form={mockForm} handleChange={mockHandleChange} />,
    );
    const hiddenInput = container.querySelector("input[type='file']");
    const testFile = new File(["validPng"], "profile.png", {
      type: "image/png",
    });

    fireEvent.change(hiddenInput, { target: { files: [testFile] } });

    // Verify loading indicator values display during intermediate phases
    expect(screen.getByText(/Uploading/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(uploadProfilePicture).toHaveBeenCalledTimes(1);
    });

    // Check parent state modification events trigger cleanly matching backend mappers
    expect(mockHandleChange).toHaveBeenNthCalledWith(1, {
      target: {
        name: "profilePicture",
        value: "https://cdn.leapmentor.com/new-upload.png",
      },
    });
    expect(mockHandleChange).toHaveBeenNthCalledWith(2, {
      target: { name: "profilePictureFileName", value: "new-upload.png" },
    });

    // Ensure target input node values wipe cleanly for consecutive operations
    expect(hiddenInput.value).toBe("");
  });

  it("should log appropriate network rejection responses if servers return connection failures", async () => {
    const errorResponse = {
      response: {
        data: {
          message: "Cloud storage service currently unreachable.",
        },
      },
    };
    uploadProfilePicture.mockRejectedValueOnce(errorResponse);

    const { container } = render(
      <PersonalInfoSection form={mockForm} handleChange={mockHandleChange} />,
    );
    const hiddenInput = container.querySelector("input[type='file']");
    const testFile = new File(["validPng"], "profile.png", {
      type: "image/png",
    });

    fireEvent.change(hiddenInput, { target: { files: [testFile] } });

    await waitFor(() => {
      expect(
        screen.getByText("Cloud storage service currently unreachable."),
      ).toBeInTheDocument();
    });
  });

  it("should present generic failure text when api exceptions throw containing no server message", async () => {
    uploadProfilePicture.mockRejectedValueOnce(
      new Error("Generic Network Drop"),
    );

    const { container } = render(
      <PersonalInfoSection form={mockForm} handleChange={mockHandleChange} />,
    );
    const hiddenInput = container.querySelector("input[type='file']");
    const testFile = new File(["validPng"], "profile.png", {
      type: "image/png",
    });

    fireEvent.change(hiddenInput, { target: { files: [testFile] } });

    await waitFor(() => {
      expect(
        screen.getByText("Failed to upload image. Please try again."),
      ).toBeInTheDocument();
    });
  });

  it("should invoke internal file picker dialog routes when clicking upload text markup elements", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <PersonalInfoSection form={mockForm} handleChange={mockHandleChange} />,
    );

    const hiddenInput = container.querySelector("input[type='file']");
    const clickSpy = vi.spyOn(hiddenInput, "click");

    const uploadTextBtn = screen.getByRole("button", { name: "Upload Photo" });
    await user.click(uploadTextBtn);

    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it("should capture form updates when typing into the bio textbox container", async () => {
    const user = userEvent.setup();
    render(
      <PersonalInfoSection form={mockForm} handleChange={mockHandleChange} />,
    );

    const bioTextarea = screen.getByLabelText(/Bio/i);
    await user.type(bioTextarea, " Adding info.");

    expect(mockHandleChange).toHaveBeenCalled();
  });
});
