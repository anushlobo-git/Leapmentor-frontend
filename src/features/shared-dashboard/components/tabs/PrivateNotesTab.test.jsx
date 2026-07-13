/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import PrivateNotesTab from "./PrivateNotesTab";

vi.mock(
  "@features/shared-dashboard/components/tabs/private-notes/PrivateFilesSection",
  () => ({
    default: () => <div data-testid="private-files-section">Files Section</div>,
  }),
);

vi.mock(
  "@features/shared-dashboard/components/tabs/private-notes/NotepadSection",
  () => ({
    default: ({ connectId, isCompleted }) => (
      <div data-testid="notepad-section">
        Notepad Section - connectId: {String(connectId)}, isCompleted:{" "}
        {String(isCompleted)}
      </div>
    ),
  }),
);

const makeStore = (connect) =>
  configureStore({
    reducer: {
      sharedDashboard: () => ({ connect }),
    },
  });

const renderWithStore = (connect = null) =>
  render(
    <Provider store={makeStore(connect)}>
      <PrivateNotesTab />
    </Provider>,
  );

describe("PrivateNotesTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the private workspace banner", () => {
    renderWithStore();

    expect(screen.getByText("Private Workspace")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Your files and notes here are only visible to you/i,
      ),
    ).toBeInTheDocument();
  });

  it("should default to the Files sub-tab and render PrivateFilesSection", () => {
    renderWithStore();

    expect(screen.getByTestId("private-files-section")).toBeInTheDocument();
    expect(screen.queryByTestId("notepad-section")).not.toBeInTheDocument();
  });

  it("should switch to the Notepad sub-tab when clicked", async () => {
    const user = userEvent.setup();
    renderWithStore({ _id: "connect-42", status: "active" });

    await user.click(screen.getByRole("button", { name: /Notepad/i }));

    expect(screen.getByTestId("notepad-section")).toBeInTheDocument();
    expect(screen.queryByTestId("private-files-section")).not.toBeInTheDocument();
  });

  it("should pass connectId and isCompleted=false to NotepadSection for an active connect", async () => {
    const user = userEvent.setup();
    renderWithStore({ _id: "connect-42", status: "active" });

    await user.click(screen.getByRole("button", { name: /Notepad/i }));

    const notepad = screen.getByTestId("notepad-section");
    expect(notepad).toHaveTextContent("connectId: connect-42");
    expect(notepad).toHaveTextContent("isCompleted: false");
  });

  it("should pass isCompleted=true to NotepadSection when connect status is completed", async () => {
    const user = userEvent.setup();
    renderWithStore({ _id: "connect-42", status: "completed" });

    await user.click(screen.getByRole("button", { name: /Notepad/i }));

    const notepad = screen.getByTestId("notepad-section");
    expect(notepad).toHaveTextContent("isCompleted: true");
  });

  it("should switch back to the Files sub-tab after viewing Notepad", async () => {
    const user = userEvent.setup();
    renderWithStore({ _id: "connect-42", status: "active" });

    await user.click(screen.getByRole("button", { name: /Notepad/i }));
    expect(screen.getByTestId("notepad-section")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Files/i }));
    expect(screen.getByTestId("private-files-section")).toBeInTheDocument();
    expect(screen.queryByTestId("notepad-section")).not.toBeInTheDocument();
  });

  it("should apply the active styling to the Files button by default", () => {
    renderWithStore();

    const filesButton = screen.getByRole("button", { name: /Files/i });
    expect(filesButton.className).toContain("bg-white");
  });

  it("should apply the active styling to the Notepad button once selected", async () => {
    const user = userEvent.setup();
    renderWithStore();

    const notepadButton = screen.getByRole("button", { name: /Notepad/i });
    await user.click(notepadButton);

    expect(notepadButton.className).toContain("bg-white");
  });

  it("should handle a missing connect in the store without crashing", () => {
    renderWithStore(null);

    expect(screen.getByText("Private Workspace")).toBeInTheDocument();
    expect(screen.getByTestId("private-files-section")).toBeInTheDocument();
  });
});
