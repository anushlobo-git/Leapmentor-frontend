/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/hooks/__tests__/useNotes.test.js
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import useNotes from "./useNotes";
import {
  getNotes as apiGetNotes,
  uploadNote as apiUploadNote,
  deleteNote as apiDeleteNote,
  getPrivateNotes as apiGetPrivateNotes,
} from "@features/notes/api/notes.api";
import logger from "@lib/logger";

// Mock dependencies
vi.mock("@features/notes/api/notes.api", () => ({
  getNotes: vi.fn(),
  uploadNote: vi.fn(),
  deleteNote: vi.fn(),
  getPrivateNotes: vi.fn(),
}));

vi.mock("@lib/logger", () => ({
  default: {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

const CONNECT_REQUEST_ID = "connect-123";

const buildNote = (overrides = {}) => ({
  _id: "note-1",
  title: "Untitled",
  ...overrides,
});

describe("useNotes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("initial fetch", () => {
    it("does nothing when connectRequestId is falsy", () => {
      renderHook(() => useNotes(undefined));
      expect(apiGetNotes).not.toHaveBeenCalled();
      expect(apiGetPrivateNotes).not.toHaveBeenCalled();
    });

    it("fetches shared and private notes on mount and updates state", async () => {
      apiGetNotes.mockResolvedValue({ notes: [buildNote({ _id: "n1" })] });
      apiGetPrivateNotes.mockResolvedValue({
        notes: [buildNote({ _id: "p1" })],
      });

      const { result } = renderHook(() => useNotes(CONNECT_REQUEST_ID));

      expect(result.current.loading).toBe(true);
      expect(result.current.privateLoading).toBe(true);

      await waitFor(() => expect(result.current.loading).toBe(false));
      await waitFor(() => expect(result.current.privateLoading).toBe(false));

      expect(apiGetNotes).toHaveBeenCalledWith(CONNECT_REQUEST_ID);
      expect(apiGetPrivateNotes).toHaveBeenCalledWith(CONNECT_REQUEST_ID);
      expect(result.current.notes).toEqual([buildNote({ _id: "n1" })]);
      expect(result.current.privateNotes).toEqual([buildNote({ _id: "p1" })]);
      expect(result.current.error).toBeNull();
    });

    it("defaults notes to an empty array when the API returns no notes field", async () => {
      apiGetNotes.mockResolvedValue({});
      apiGetPrivateNotes.mockResolvedValue({});

      const { result } = renderHook(() => useNotes(CONNECT_REQUEST_ID));

      await waitFor(() => expect(result.current.loading).toBe(false));
      await waitFor(() => expect(result.current.privateLoading).toBe(false));

      expect(result.current.notes).toEqual([]);
      expect(result.current.privateNotes).toEqual([]);
    });

    it("sets a global error when fetching shared notes fails", async () => {
      apiGetNotes.mockRejectedValue({
        response: { data: { message: "Server exploded" } },
      });
      apiGetPrivateNotes.mockResolvedValue({ notes: [] });

      const { result } = renderHook(() => useNotes(CONNECT_REQUEST_ID));

      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.error).toBe("Server exploded");
    });

    it("falls back to a generic message when the shared notes error has no response message", async () => {
      apiGetNotes.mockRejectedValue(new Error("network down"));
      apiGetPrivateNotes.mockResolvedValue({ notes: [] });

      const { result } = renderHook(() => useNotes(CONNECT_REQUEST_ID));

      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.error).toBe("Failed to load notes.");
    });

    it("logs (but does not set global error) when fetching private notes fails", async () => {
      apiGetNotes.mockResolvedValue({ notes: [] });
      apiGetPrivateNotes.mockRejectedValue({
        response: { data: { message: "Private notes down" } },
      });

      const { result } = renderHook(() => useNotes(CONNECT_REQUEST_ID));

      await waitFor(() => expect(result.current.privateLoading).toBe(false));

      expect(result.current.error).toBeNull();
      expect(logger.warn).toHaveBeenCalledWith("Private notes fetch failed:", {
        error: "Private notes down",
      });
    });
  });

  describe("uploadNote", () => {
    const setupResolved = () => {
      apiGetNotes.mockResolvedValue({ notes: [] });
      apiGetPrivateNotes.mockResolvedValue({ notes: [] });
    };

    it("does nothing when file or connectRequestId is missing", async () => {
      setupResolved();
      const { result } = renderHook(() => useNotes(CONNECT_REQUEST_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      let response;
      await act(async () => {
        response = await result.current.uploadNote(null, "title", false);
      });

      expect(response).toBeUndefined();
      expect(apiUploadNote).not.toHaveBeenCalled();
    });

    it("uploads a shared note and prepends it to notes", async () => {
      setupResolved();
      const newNote = buildNote({ _id: "new-shared" });
      apiUploadNote.mockResolvedValue({ note: newNote });

      const { result } = renderHook(() => useNotes(CONNECT_REQUEST_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      let response;
      await act(async () => {
        response = await result.current.uploadNote(
          new File(["x"], "f.pdf"),
          "My Title",
          false,
        );
      });

      expect(response).toEqual({ success: true });
      expect(result.current.notes[0]).toEqual(newNote);
      expect(result.current.uploading).toBe(false);
    });

    it("uploads a private note and prepends it to privateNotes instead", async () => {
      setupResolved();
      const newNote = buildNote({ _id: "new-private" });
      apiUploadNote.mockResolvedValue({ note: newNote });

      const { result } = renderHook(() => useNotes(CONNECT_REQUEST_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.uploadNote(
          new File(["x"], "f.pdf"),
          "Title",
          true,
        );
      });

      expect(result.current.privateNotes[0]).toEqual(newNote);
      expect(result.current.notes).toEqual([]);
    });

    it("returns a failure result and sets error when upload fails", async () => {
      setupResolved();
      apiUploadNote.mockRejectedValue({
        response: { data: { message: "Too large" } },
      });

      const { result } = renderHook(() => useNotes(CONNECT_REQUEST_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      let response;
      await act(async () => {
        response = await result.current.uploadNote(new File(["x"], "f.pdf"));
      });

      expect(response).toEqual({ success: false, message: "Too large" });
      expect(result.current.error).toBe("Too large");
      expect(result.current.uploading).toBe(false);
    });
  });

  describe("deleteNote", () => {
    const setupResolved = () => {
      apiGetNotes.mockResolvedValue({ notes: [buildNote({ _id: "n1" })] });
      apiGetPrivateNotes.mockResolvedValue({
        notes: [buildNote({ _id: "p1" })],
      });
    };

    it("removes a shared note by id on success", async () => {
      setupResolved();
      apiDeleteNote.mockResolvedValue({});

      const { result } = renderHook(() => useNotes(CONNECT_REQUEST_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      let response;
      await act(async () => {
        response = await result.current.deleteNote("n1", false);
      });

      expect(response).toEqual({ success: true });
      expect(result.current.notes).toEqual([]);
    });

    it("removes a private note by id on success", async () => {
      setupResolved();
      apiDeleteNote.mockResolvedValue({});

      const { result } = renderHook(() => useNotes(CONNECT_REQUEST_ID));
      await waitFor(() => expect(result.current.privateLoading).toBe(false));

      await act(async () => {
        await result.current.deleteNote("p1", true);
      });

      expect(result.current.privateNotes).toEqual([]);
    });

    it("sets an error and does not mutate state when delete fails", async () => {
      setupResolved();
      apiDeleteNote.mockRejectedValue({
        response: { data: { message: "Cannot delete" } },
      });

      const { result } = renderHook(() => useNotes(CONNECT_REQUEST_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      let response;
      await act(async () => {
        response = await result.current.deleteNote("n1", false);
      });

      expect(response).toEqual({ success: false, message: "Cannot delete" });
      expect(result.current.error).toBe("Cannot delete");
      expect(result.current.notes).toHaveLength(1);
    });
  });

  describe("refetch / refetchPrivate", () => {
    it("exposes refetch and refetchPrivate that re-invoke the respective API calls", async () => {
      apiGetNotes.mockResolvedValue({ notes: [] });
      apiGetPrivateNotes.mockResolvedValue({ notes: [] });

      const { result } = renderHook(() => useNotes(CONNECT_REQUEST_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      apiGetNotes.mockClear();
      apiGetPrivateNotes.mockClear();

      await act(async () => {
        await result.current.refetch();
      });
      expect(apiGetNotes).toHaveBeenCalledTimes(1);

      await act(async () => {
        await result.current.refetchPrivate();
      });
      expect(apiGetPrivateNotes).toHaveBeenCalledTimes(1);
    });
  });
});
