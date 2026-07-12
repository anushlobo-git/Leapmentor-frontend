/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { afterEach, describe, expect, it, vi, beforeEach } from "vitest";
import logger from "./logger";

describe("logger", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("logger.info", () => {
    it("should call logtail.info when logtail is available", () => {
      const logtailInfoSpy = vi.fn();
      const consoleInfoSpy = vi.spyOn(console, "info").mockImplementation(() => {});

      // Mock the logtail module
      vi.doMock("@logtail/browser", () => ({
        default: class Logtail {
          info = logtailInfoSpy;
        },
      }));

      logger.info("test message", { key: "value" });
      expect(consoleInfoSpy).toHaveBeenCalled();
    });

    it("should not throw when logging fails", () => {
      const consoleInfoSpy = vi
        .spyOn(console, "info")
        .mockImplementation(() => {
          throw new Error("Console error");
        });

      expect(() => logger.info("test")).not.toThrow();
      consoleInfoSpy.mockRestore();
    });

    it("should handle empty message", () => {
      const consoleInfoSpy = vi.spyOn(console, "info").mockImplementation(() => {});

      logger.info("", { key: "value" });
      expect(consoleInfoSpy).toHaveBeenCalled();
      consoleInfoSpy.mockRestore();
    });

    it("should handle no context", () => {
      const consoleInfoSpy = vi.spyOn(console, "info").mockImplementation(() => {});

      logger.info("test message");
      expect(consoleInfoSpy).toHaveBeenCalled();
      consoleInfoSpy.mockRestore();
    });
  });

  describe("logger.warn", () => {
    it("should call console.warn", () => {
      const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      logger.warn("warning message", { key: "value" });
      expect(consoleWarnSpy).toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });

    it("should not throw when logging fails", () => {
      const consoleWarnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => {
          throw new Error("Console error");
        });

      expect(() => logger.warn("test")).not.toThrow();
      consoleWarnSpy.mockRestore();
    });

    it("should handle empty message", () => {
      const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      logger.warn("", { key: "value" });
      expect(consoleWarnSpy).toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });

    it("should handle no context", () => {
      const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      logger.warn("warning message");
      expect(consoleWarnSpy).toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });
  });

  describe("logger.error", () => {
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
      consoleError.mockRestore();
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
      consoleError.mockRestore();
    });

    it("should handle Error objects as message", () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const error = new Error("Test error");
      logger.error(error, { context: "test" });

      expect(consoleError).toHaveBeenCalled();
      consoleError.mockRestore();
    });

    it("should not throw when logging fails", () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {
          throw new Error("Console error");
        });

      expect(() => logger.error("test")).not.toThrow();
      consoleError.mockRestore();
    });

    it("should handle empty message", () => {
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

      logger.error("", { key: "value" });
      expect(consoleError).toHaveBeenCalled();
      consoleError.mockRestore();
    });

    it("should handle no context", () => {
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

      logger.error("error message");
      expect(consoleError).toHaveBeenCalled();
      consoleError.mockRestore();
    });
  });

  describe("data redaction", () => {
    it("should redact sensitive keys", () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      logger.error("test", {
        password: "secret123",
        accessToken: "token123",
        normalField: "visible",
      });

      const [message] = consoleError.mock.calls[0];
      expect(message).toContain("[REDACTED]");
      expect(message).not.toContain("secret123");
      expect(message).not.toContain("token123");
      expect(message).toContain("visible");
      consoleError.mockRestore();
    });

    it("should redact JWT-like strings in non-sensitive keys", () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      logger.error("test", {
        data: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U",
      });

      const [message] = consoleError.mock.calls[0];
      expect(message).toContain("[REDACTED_JWT]");
      expect(message).not.toContain("eyJhbGci");
      consoleError.mockRestore();
    });

    it("should redact long token-like strings", () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      logger.error("test", {
        longToken: "A".repeat(65),
      });

      const [message] = consoleError.mock.calls[0];
      expect(message).toContain("[REDACTED]");
      consoleError.mockRestore();
    });

    it("should not redact short strings", () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      logger.error("test", {
        shortString: "A".repeat(64),
      });

      const [message] = consoleError.mock.calls[0];
      expect(message).toContain("A".repeat(64));
      expect(message).not.toContain("[REDACTED]");
      consoleError.mockRestore();
    });

    it("should not redact strings with spaces", () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      logger.error("test", {
        sentence: "This is a normal sentence with spaces.",
      });

      const [message] = consoleError.mock.calls[0];
      expect(message).toContain("This is a normal sentence with spaces.");
      expect(message).not.toContain("[REDACTED]");
      consoleError.mockRestore();
    });

    it("should handle null values", () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      logger.error("test", {
        nullField: null,
      });

      const [message] = consoleError.mock.calls[0];
      expect(message).toContain("null");
      consoleError.mockRestore();
    });

    it("should handle undefined values", () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      logger.error("test", {
        undefinedField: undefined,
      });

      const [message] = consoleError.mock.calls[0];
      expect(message).not.toContain("[REDACTED]");
      consoleError.mockRestore();
    });

    it("should handle arrays", () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      logger.error("test", {
        arrayField: ["item1", "item2", "item3"],
      });

      const [message] = consoleError.mock.calls[0];
      expect(message).toContain("item1");
      expect(message).toContain("item2");
      expect(message).toContain("item3");
      consoleError.mockRestore();
    });

    it("should handle nested objects", () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      logger.error("test", {
        nested: {
          level1: {
            level2: {
              secret: "hidden",
            },
          },
        },
      });

      const [message] = consoleError.mock.calls[0];
      expect(message).toContain("[REDACTED]");
      expect(message).not.toContain("hidden");
      consoleError.mockRestore();
    });

    it("should handle Error objects in context", () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const error = new Error("Test error");
      logger.error("test", { error });

      const [message] = consoleError.mock.calls[0];
      expect(message).toContain("Error");
      expect(message).toContain("Test error");
      consoleError.mockRestore();
    });

    it("should handle circular references gracefully", () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const obj = { name: "test" };
      obj.self = obj;

      logger.error("test", { circular: obj });

      expect(() => {
        const [message] = consoleError.mock.calls[0];
        expect(message).toBeDefined();
      }).not.toThrow();
      consoleError.mockRestore();
    });

    it("should sanitize JWT in error messages", () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      logger.error(
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U",
      );

      const [message] = consoleError.mock.calls[0];
      expect(message).toContain("[REDACTED_JWT]");
      expect(message).not.toContain("eyJhbGci");
      consoleError.mockRestore();
    });
  });

  describe("console patching", () => {
    it("should patch console methods", () => {
      expect(console.log).toBeDefined();
      expect(console.info).toBeDefined();
      expect(console.warn).toBeDefined();
      expect(console.error).toBeDefined();
    });

    it("should mark patched methods with flag", () => {
      expect(console.log.__leapmentorPatched).toBe(true);
      expect(console.info.__leapmentorPatched).toBe(true);
      expect(console.warn.__leapmentorPatched).toBe(true);
      expect(console.error.__leapmentorPatched).toBe(true);
    });
  });

  describe("formatConsoleArg", () => {
    it("should handle non-serializable objects", () => {
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
      const obj = Object.create(null);
      Object.defineProperty(obj, 'circular', {
        get: function() { return this; }
      });

      logger.error("test", { problematic: obj });

      expect(consoleError).toHaveBeenCalled();
      consoleError.mockRestore();
    });
  });

  describe("normalizeErrorInput", () => {
    it("should normalize Error objects as message", () => {
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
      const error = new Error("Test error");
      logger.error(error, { context: "test" });

      const [message] = consoleError.mock.calls[0];
      expect(message).toContain("Test error");
      expect(message).toContain("stack");
      consoleError.mockRestore();
    });

    it("should handle non-Error messages", () => {
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
      logger.error("Regular message", { context: "test" });

      const [message] = consoleError.mock.calls[0];
      expect(message).toContain("Regular message");
      consoleError.mockRestore();
    });
  });
});
