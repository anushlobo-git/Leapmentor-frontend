/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import type { ReactNode } from "react";
import { Provider } from "react-redux";
import { configureStore, combineReducers, type Reducer } from "@reduxjs/toolkit";
import { render, renderHook } from "@testing-library/react";
import notificationsReducer from "@features/notifications/models/notificationsSlice";
import connectRequestsReducer from "@features/connects/models/connectRequestsSlice";

/** Real reducers, fresh state per call — tests mock the API modules, not Redux. */
export const makeTestStore = (extra: Record<string, Reducer> = {}, preloadedState?: any) =>
  configureStore({
    reducer: combineReducers({
      notifications: notificationsReducer,
      connectRequests: connectRequestsReducer,
      ...extra,
    }) as Reducer<any>,
    preloadedState,
  });

export const renderHookWithStore = <T,>(hook: () => T, store = makeTestStore()) => {
  const wrapper = ({ children }: { children: ReactNode }) => <Provider store={store}>{children}</Provider>;
  return { store, ...renderHook(hook, { wrapper }) };
};

export const renderWithStore = (ui: ReactNode, store = makeTestStore()) => ({
  store,
  ...render(<Provider store={store}>{ui}</Provider>),
});
