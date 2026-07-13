/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import sharedDashboardReducer, {
  setConnect,
  setActiveTab,
  resetSharedDashboard,
  selectConnect,
  selectConnectId,
  selectActiveTab,
  selectViewerRole,
  selectConnectStatus,
} from "./sharedDashboardSlice";

describe("sharedDashboardSlice", () => {
  const initialState = {
    connect: null,
    activeTab: "overview",
  };

  describe("initial state", () => {
    it("should return the initial state", () => {
      expect(sharedDashboardReducer(undefined, { type: "unknown" })).toEqual(
        initialState
      );
    });
  });

  describe("setConnect", () => {
    it("should set the connect value", () => {
      const connectData = { _id: "123", status: "ongoing" };
      const action = setConnect(connectData);
      const state = sharedDashboardReducer(initialState, action);

      expect(state.connect).toEqual(connectData);
    });

    it("should replace existing connect value", () => {
      const state = { ...initialState, connect: { _id: "old" } };
      const newConnect = { _id: "new", status: "completed" };
      const action = setConnect(newConnect);
      const newState = sharedDashboardReducer(state, action);

      expect(newState.connect).toEqual(newConnect);
    });

    it("should handle null connect value", () => {
      const state = { ...initialState, connect: { _id: "123" } };
      const action = setConnect(null);
      const newState = sharedDashboardReducer(state, action);

      expect(newState.connect).toBeNull();
    });
  });

  describe("setActiveTab", () => {
    it("should set the activeTab value", () => {
      const action = setActiveTab("messages");
      const state = sharedDashboardReducer(initialState, action);

      expect(state.activeTab).toBe("messages");
    });

    it("should replace existing activeTab value", () => {
      const state = { ...initialState, activeTab: "overview" };
      const action = setActiveTab("files");
      const newState = sharedDashboardReducer(state, action);

      expect(newState.activeTab).toBe("files");
    });

    it("should handle empty string activeTab", () => {
      const action = setActiveTab("");
      const state = sharedDashboardReducer(initialState, action);

      expect(state.activeTab).toBe("");
    });
  });

  describe("resetSharedDashboard", () => {
    it("should reset to initial state", () => {
      const modifiedState = {
        connect: { _id: "123", status: "ongoing" },
        activeTab: "messages",
      };
      const action = resetSharedDashboard();
      const state = sharedDashboardReducer(modifiedState, action);

      expect(state).toEqual(initialState);
    });

    it("should reset connect to null", () => {
      const modifiedState = {
        connect: { _id: "123", status: "ongoing" },
        activeTab: "messages",
      };
      const action = resetSharedDashboard();
      const state = sharedDashboardReducer(modifiedState, action);

      expect(state.connect).toBeNull();
    });

    it("should reset activeTab to overview", () => {
      const modifiedState = {
        connect: { _id: "123", status: "ongoing" },
        activeTab: "messages",
      };
      const action = resetSharedDashboard();
      const state = sharedDashboardReducer(modifiedState, action);

      expect(state.activeTab).toBe("overview");
    });
  });

  describe("selectors", () => {
    const mockState = {
      sharedDashboard: {
        connect: {
          _id: "connect123",
          status: "ongoing",
          viewerRole: "mentor",
        },
        activeTab: "messages",
      },
    };

    describe("selectConnect", () => {
      it("should return the connect value", () => {
        expect(selectConnect(mockState)).toEqual(mockState.sharedDashboard.connect);
      });

      it("should return null when connect is null", () => {
        const state = {
          sharedDashboard: {
            connect: null,
            activeTab: "overview",
          },
        };
        expect(selectConnect(state)).toBeNull();
      });
    });

    describe("selectConnectId", () => {
      it("should return the connect _id", () => {
        expect(selectConnectId(mockState)).toBe("connect123");
      });

      it("should return null when connect is null", () => {
        const state = {
          sharedDashboard: {
            connect: null,
            activeTab: "overview",
          },
        };
        expect(selectConnectId(state)).toBeNull();
      });

      it("should return null when connect._id is undefined", () => {
        const state = {
          sharedDashboard: {
            connect: { status: "ongoing" },
            activeTab: "overview",
          },
        };
        expect(selectConnectId(state)).toBeNull();
      });

      it("should return null when connect is missing", () => {
        const state = {
          sharedDashboard: {
            activeTab: "overview",
          },
        };
        expect(selectConnectId(state)).toBeNull();
      });
    });

    describe("selectActiveTab", () => {
      it("should return the activeTab value", () => {
        expect(selectActiveTab(mockState)).toBe("messages");
      });

      it("should return default activeTab when state is initial", () => {
        expect(selectActiveTab({ sharedDashboard: initialState })).toBe(
          "overview"
        );
      });
    });

    describe("selectViewerRole", () => {
      it("should return the viewerRole from connect", () => {
        expect(selectViewerRole(mockState)).toBe("mentor");
      });

      it("should return mentee as default when viewerRole is not set", () => {
        const state = {
          sharedDashboard: {
            connect: { _id: "123", status: "ongoing" },
            activeTab: "overview",
          },
        };
        expect(selectViewerRole(state)).toBe("mentee");
      });

      it("should return mentee as default when connect is null", () => {
        const state = {
          sharedDashboard: {
            connect: null,
            activeTab: "overview",
          },
        };
        expect(selectViewerRole(state)).toBe("mentee");
      });

      it("should return mentee as default when connect is missing", () => {
        const state = {
          sharedDashboard: {
            activeTab: "overview",
          },
        };
        expect(selectViewerRole(state)).toBe("mentee");
      });
    });

    describe("selectConnectStatus", () => {
      it("should return the status from connect", () => {
        expect(selectConnectStatus(mockState)).toBe("ongoing");
      });

      it("should return null when status is not set", () => {
        const state = {
          sharedDashboard: {
            connect: { _id: "123" },
            activeTab: "overview",
          },
        };
        expect(selectConnectStatus(state)).toBeNull();
      });

      it("should return null when connect is null", () => {
        const state = {
          sharedDashboard: {
            connect: null,
            activeTab: "overview",
          },
        };
        expect(selectConnectStatus(state)).toBeNull();
      });

      it("should return null when connect is missing", () => {
        const state = {
          sharedDashboard: {
            activeTab: "overview",
          },
        };
        expect(selectConnectStatus(state)).toBeNull();
      });
    });
  });

  describe("action creators", () => {
    it("should create setConnect action", () => {
      const connectData = { _id: "123" };
      const action = setConnect(connectData);

      expect(action.type).toBe("sharedDashboard/setConnect");
      expect(action.payload).toEqual(connectData);
    });

    it("should create setActiveTab action", () => {
      const tab = "messages";
      const action = setActiveTab(tab);

      expect(action.type).toBe("sharedDashboard/setActiveTab");
      expect(action.payload).toBe(tab);
    });

    it("should create resetSharedDashboard action", () => {
      const action = resetSharedDashboard();

      expect(action.type).toBe("sharedDashboard/resetSharedDashboard");
      expect(action.payload).toBeUndefined();
    });
  });
});
