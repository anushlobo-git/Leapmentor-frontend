/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/hooks/__tests__/usePrivateNotes.test.js
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import usePrivateNotes from "./usePrivateNotes";
import {
  createPrivateNote as apiCreate,
  getPrivateNotes as apiGetAll,
  updatePrivateNote as apiUpdate,
  deletePrivateNote as apiDelete,
} from "@features/notes/api/privateNotes.api";

// Mock dependencies
vi.mock("@features/notes/api/privateNotes.api", () => ({
  createPrivateNote: vi.fn(),
  getPrivateNotes: vi.fn(),
  updatePrivateNote: vi.fn(),
  deletePrivateNote: vi.fn(),
}));

const CONNECT_REQUEST_ID = "connect-456";

const buildNote = (overrides = {}) => ({
  _id: "note-1",
  title: "Untitled Note",
  content: "",
  ...overrides,
});

describe("usePrivateNotes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("initial fetch", () => {
    it("does nothing when connectRequestId is falsy", () => {
      renderHook(() => usePrivateNotes(undefined));
      expect(apiGetAll).not.toHaveBeenCalled();
    });

    it("fetches notes on mount and updates state", async () => {
      apiGetAll.mockResolvedValue({ notes: [buildNote({ _id: "n1" })] });

      const { result } = renderHook(() => usePrivateNotes(CONNECT_REQUEST_ID));

      expect(result.current.loading).toBe(true);
      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(apiGetAll).toHaveBeenCalledWith(CONNECT_REQUEST_ID);
      expect(result.current.notes).toEqual([buildNote({ _id: "n1" })]);
      expect(result.current.error).toBeNull();
    });

    it("defaults to an empty array when the API response has no notes field", async () => {
      apiGetAll.mockResolvedValue({});

      const { result } = renderHook(() => usePrivateNotes(CONNECT_REQUEST_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.notes).toEqual([]);
    });

    it("sets an error message when the fetch fails", async () => {
      apiGetAll.mockRejectedValue({
        response: { data: { message: "Boom" } },
      });

      const { result } = renderHook(() => usePrivateNotes(CONNECT_REQUEST_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.error).toBe("Boom");
    });

    it("falls back to a generic message when the error has no response message", async () => {
      apiGetAll.mockRejectedValue(new Error("network down"));

      const { result } = renderHook(() => usePrivateNotes(CONNECT_REQUEST_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.error).toBe("Failed to load notes.");
    });
  });

  describe("createNote", () => {
    const setupResolved = () => apiGetAll.mockResolvedValue({ notes: [] });

    it("does nothing when connectRequestId is missing", async () => {
      const { result } = renderHook(() => usePrivateNotes(undefined));

      let response;
      await act(async () => {
        response = await result.current.createNote("Title", "Body");
      });

      expect(response).toBeUndefined();
      expect(apiCreate).not.toHaveBeenCalled();
    });

    it("creates a note with defaults and prepends it to notes", async () => {
      setupResolved();
      const newNote = buildNote({ _id: "new-1" });
      apiCreate.mockResolvedValue({ note: newNote });

      const { result } = renderHook(() => usePrivateNotes(CONNECT_REQUEST_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      let response;
      await act(async () => {
        response = await result.current.createNote();
      });

      expect(apiCreate).toHaveBeenCalledWith(
        CONNECT_REQUEST_ID,
        "Untitled Note",
        "",
      );
      expect(response).toEqual({ success: true, note: newNote });
      expect(result.current.notes[0]).toEqual(newNote);
      expect(result.current.saving).toBe(false);
    });

    it("creates a note with the given title and content", async () => {
      setupResolved();
      const newNote = buildNote({
        _id: "new-2",
        title: "My Note",
        content: "hello",
      });
      apiCreate.mockResolvedValue({ note: newNote });

      const { result } = renderHook(() => usePrivateNotes(CONNECT_REQUEST_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.createNote("My Note", "hello");
      });

      expect(apiCreate).toHaveBeenCalledWith(
        CONNECT_REQUEST_ID,
        "My Note",
        "hello",
      );
      expect(result.current.notes[0]).toEqual(newNote);
    });

    it("returns a failure result and sets error when create fails", async () => {
      setupResolved();
      apiCreate.mockRejectedValue({
        response: { data: { message: "Cannot create" } },
      });

      const { result } = renderHook(() => usePrivateNotes(CONNECT_REQUEST_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      let response;
      await act(async () => {
        response = await result.current.createNote("Title", "Body");
      });

      expect(response).toEqual({ success: false, message: "Cannot create" });
      expect(result.current.error).toBe("Cannot create");
      expect(result.current.saving).toBe(false);
    });
  });

  describe("updateNote", () => {
    const setupResolved = (existing) =>
      apiGetAll.mockResolvedValue({ notes: existing });

    it("updates the matching note in place on success", async () => {
      const existing = [buildNote({ _id: "n1", title: "Old" })];
      setupResolved(existing);
      const updated = buildNote({ _id: "n1", title: "New" });
      apiUpdate.mockResolvedValue({ note: updated });

      const { result } = renderHook(() => usePrivateNotes(CONNECT_REQUEST_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      let response;
      await act(async () => {
        response = await result.current.updateNote("n1", "New", "content");
      });

      expect(apiUpdate).toHaveBeenCalledWith("n1", "New", "content");
      expect(response).toEqual({ success: true, note: updated });
      expect(result.current.notes).toEqual([updated]);
    });

    it("leaves other notes untouched", async () => {
      const existing = [
        buildNote({ _id: "n1", title: "Keep me" }),
        buildNote({ _id: "n2", title: "Old" }),
      ];
      setupResolved(existing);
      const updated = buildNote({ _id: "n2", title: "New" });
      apiUpdate.mockResolvedValue({ note: updated });

      const { result } = renderHook(() => usePrivateNotes(CONNECT_REQUEST_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.updateNote("n2", "New", "content");
      });

      expect(result.current.notes).toEqual([existing[0], updated]);
    });

    it("returns a failure result and sets error when update fails", async () => {
      setupResolved([buildNote({ _id: "n1" })]);
      apiUpdate.mockRejectedValue({
        response: { data: { message: "Cannot save" } },
      });

      const { result } = renderHook(() => usePrivateNotes(CONNECT_REQUEST_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      let response;
      await act(async () => {
        response = await result.current.updateNote("n1", "T", "C");
      });

      expect(response).toEqual({ success: false, message: "Cannot save" });
      expect(result.current.error).toBe("Cannot save");
    });
  });

  describe("deleteNote", () => {
    it("removes the note by id on success", async () => {
      apiGetAll.mockResolvedValue({
        notes: [buildNote({ _id: "n1" }), buildNote({ _id: "n2" })],
      });
      apiDelete.mockResolvedValue({});

      const { result } = renderHook(() => usePrivateNotes(CONNECT_REQUEST_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      let response;
      await act(async () => {
        response = await result.current.deleteNote("n1");
      });

      expect(apiDelete).toHaveBeenCalledWith("n1");
      expect(response).toEqual({ success: true });
      expect(result.current.notes).toEqual([buildNote({ _id: "n2" })]);
    });

    it("sets an error and keeps state unchanged when delete fails", async () => {
      const existing = [buildNote({ _id: "n1" })];
      apiGetAll.mockResolvedValue({ notes: existing });
      apiDelete.mockRejectedValue({
        response: { data: { message: "Cannot delete" } },
      });

      const { result } = renderHook(() => usePrivateNotes(CONNECT_REQUEST_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      let response;
      await act(async () => {
        response = await result.current.deleteNote("n1");
      });

      expect(response).toEqual({ success: false, message: "Cannot delete" });
      expect(result.current.error).toBe("Cannot delete");
      expect(result.current.notes).toEqual(existing);
    });
  });

  describe("refetch", () => {
    it("re-invokes getPrivateNotes when called", async () => {
      apiGetAll.mockResolvedValue({ notes: [] });

      const { result } = renderHook(() => usePrivateNotes(CONNECT_REQUEST_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      apiGetAll.mockClear();

      await act(async () => {
        await result.current.refetch();
      });

      expect(apiGetAll).toHaveBeenCalledTimes(1);
    });
  });
});
