import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ── Mock Core Application Side Effects & External Services ──
const mockRender = vi.fn();
vi.mock("react-dom/client", () => ({
  createRoot: vi.fn(() => ({
    render: mockRender,
  })),
}));

vi.mock("@store/index", () => ({
  default: { id: "mock-redux-store-instance" },
}));

vi.mock("@lib/axiosInstance", () => ({
  injectStore: vi.fn(),
}));

vi.mock("@lib/sentry", () => ({
  initializeSentry: vi.fn(),
}));

// Ignore CSS side effect import compilation pathways inside test environments
vi.mock("./index.css", () => ({}));

describe("Application Root Entry Point (main.jsx)", () => {
  let rootElement;
  let moduleVersion = 0;
  const originalStore = globalThis.store;
  const originalEnvDev = import.meta.env.DEV;

  beforeEach(() => {
    vi.clearAllMocks();
    delete globalThis.store;

    // Create a target anchor element node in the test document body
    rootElement = document.createElement("div");
    rootElement.id = "root";
    document.body.appendChild(rootElement);
  });

  afterEach(() => {
    if (document.body.contains(rootElement)) {
      document.body.removeChild(rootElement);
    }
    globalThis.store = originalStore;
    import.meta.env.DEV = originalEnvDev;
  });

  // ── Branch Path 1: Core Initializations ────────────────────────────────────
  it("should inject the store reference into Axios, initialize Sentry metrics, and render into the DOM", async () => {
    const { injectStore } = await import("@lib/axiosInstance");
    const { initializeSentry } = await import("@lib/sentry");
    const { createRoot } = await import("react-dom/client");
    const storeModule = await import("@store/index");

    // Fixed: Pair resetModules with a query string to force re-evaluation safely
    vi.resetModules();
    await import(`./main?v=${moduleVersion++}`);

    expect(injectStore).toHaveBeenCalledWith(storeModule.default);
    expect(initializeSentry).toHaveBeenCalledTimes(1);
    expect(createRoot).toHaveBeenCalledWith(rootElement);
    expect(mockRender).toHaveBeenCalledTimes(1);
  });

  // ── Branch Path 2: Development Environment State ───────────────────────────
  it("should bind the store module instance directly onto globalThis if DEV flags match true", async () => {
    import.meta.env.DEV = true;
    const storeModule = await import("@store/index");

    vi.resetModules();
    await import(`./main?v=${moduleVersion++}`);

    expect(globalThis.store).toBe(storeModule.default);
  });

  // ── Branch Path 3: Production Environment State ────────────────────────────
  it("should skip global store object reference bindings completely if DEV flags evaluate to false", async () => {
    import.meta.env.DEV = false;

    vi.resetModules();
    await import(`./main?v=${moduleVersion++}`);

    expect(globalThis.store).toBeUndefined();
  });
});
