/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { createBrowserRouter } from "react-router-dom";
import { appRoutes } from "./routes";

// Built inside a function, not at module scope: createBrowserRouter reads
// window.location the moment it's created, and tests (App.test.jsx) change
// the path per test via createMemoryRouter instead — this keeps the two
// from fighting over when the router snapshots the URL.
//
// Kept out of App.tsx so that file exports only the <App> component, which
// satisfies react-refresh/only-export-components (fast refresh).
export const createAppRouter = () => createBrowserRouter(appRoutes);
