import { afterEach, describe, expect, it, vi } from "vitest";
import logger from "./logger";

describe("logger", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does not throw when the error message is an object", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() =>
      logger.error({ foo: "bar" }, { user: { name: "Ada" } }),
    ).not.toThrow();
    expect(consoleError).toHaveBeenCalled();
    const [message] = consoleError.mock.calls[0];
    expect(typeof message).toBe("string");
    expect(message).toContain("[ERROR]");
  });

  it("stringifies log context into a single console argument", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    logger.error("boom", { user: { name: "Ada" } });

    expect(consoleError).toHaveBeenCalledTimes(1);
    const [message] = consoleError.mock.calls[0];
    expect(typeof message).toBe("string");
    expect(message).toContain("boom");
    expect(message).toContain("user");
  });
});
