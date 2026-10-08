/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */
//generally the type for the ui components that the react display
import type { ReactNode } from "react";
import { Provider } from "react-redux";
import { configureStore, combineReducers, type Reducer } from "@reduxjs/toolkit";
import { render, renderHook } from "@testing-library/react";
import notificationsReducer from "@features/notifications/models/notificationsSlice";
import dashboardUserReducer from "@features/profile/models/dashboardUserSlice";
import connectRequestsReducer from "@features/connects/models/connectRequestsSlice";
import walletReducer from "@features/mentee/models/walletSlice";

/** Real reducers, fresh state per call — tests mock the API modules, not Redux. */
//if u want to add extra reducers then u can add in the 1st argument and in the second argument u give the actual
//value that the store must have so that the store doesn't start with the initial value so yeah
// Allows a test to add another reducer if needed.
// Allows a test to give the store some starting data.
export const makeTestStore = (extra: Record<string, Reducer> = {}, preloadedState?: Record<string, unknown>) =>
  configureStore({
    // Combines all these reducers into one Redux state.
    reducer: combineReducers({
      notifications: notificationsReducer,
      connectRequests: connectRequestsReducer,
      dashboardUser: dashboardUserReducer,
      wallet: walletReducer,
      ...extra,
    }) as Reducer<Record<string, unknown>>,
    preloadedState,
  });

/*
* This function is used when we want to test a custom hook.
* It gives the hook access to the Redux store.
*/
export const renderHookWithStore = <T,>(hook: () => T, store = makeTestStore()) => {
  const wrapper = ({ children }: { children: ReactNode }) => <Provider store={store}>{children}</Provider>;
  return { store, ...renderHook(hook, { wrapper }) };
};

/*
* This function is used when we want to test a React component.
* It gives the component access to the Redux store.
*/
export const renderWithStore = (ui: ReactNode, store = makeTestStore()) => ({
  store,
  ...render(<Provider store={store}>{ui}</Provider>),
});
