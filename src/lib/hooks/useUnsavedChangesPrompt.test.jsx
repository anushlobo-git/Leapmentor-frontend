import { describe, it, expect } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider, useNavigate } from "react-router-dom";
import { useUnsavedChangesPrompt } from "./useUnsavedChangesPrompt";
import UnsavedChangesDialog from "@components/shared/UnsavedChangesDialog";

const Form = ({ dirty }) => {
  const navigate = useNavigate();
  const blocker = useUnsavedChangesPrompt(dirty);
  return (
    <div>
      <button onClick={() => navigate("/other")}>go</button>
      <UnsavedChangesDialog blocker={blocker} />
    </div>
  );
};

const setup = (dirty) => {
  const router = createMemoryRouter(
    [
      { path: "/form", element: <Form dirty={dirty} /> },
      { path: "/other", element: <div>other page</div> },
    ],
    { initialEntries: ["/form"] },
  );
  render(<RouterProvider router={router} />);
  return router;
};

describe("useUnsavedChangesPrompt + UnsavedChangesDialog", () => {
  it("navigates freely when clean", async () => {
    setup(false);
    await userEvent.click(screen.getByText("go"));
    expect(await screen.findByText("other page")).toBeInTheDocument();
  });

  it("blocks when dirty and Stay keeps the user on the form", async () => {
    const router = setup(true);
    await userEvent.click(screen.getByText("go"));
    expect(await screen.findByText("Leave without saving?")).toBeInTheDocument();
    await userEvent.click(screen.getByText("Stay"));
    await waitFor(() => expect(screen.queryByText("Leave without saving?")).toBeNull());
    expect(router.state.location.pathname).toBe("/form");
  });

  it("Leave proceeds with the navigation", async () => {
    setup(true);
    await userEvent.click(screen.getByText("go"));
    await userEvent.click(await screen.findByText("Leave"));
    expect(await screen.findByText("other page")).toBeInTheDocument();
  });

  it("registers beforeunload only while dirty", () => {
    setup(true);
    const evt = new Event("beforeunload", { cancelable: true });
    act(() => { window.dispatchEvent(evt); });
    expect(evt.defaultPrevented).toBe(true);
  });
});
