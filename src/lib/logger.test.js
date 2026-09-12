/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { afterEach, describe, expect, it, vi, beforeEach } from "vitest";
import logger from "./logger";

// Stub the Logtail SDK so tests never hit the real network regardless of
// whatever VITE_LOGTAIL_SOURCE_TOKEN is set to in this environment, and so
// we can assert on exactly what payload logger.ts would ship to Better Stack.
// vi.mock calls are hoisted above imports by Vitest, so this takes effect
// before logger.ts (imported above) evaluates `new Logtail(sourceToken)`.
const { logtailInstance } = vi.hoisted(() => ({
  logtailInstance: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));
vi.mock("@logtail/browser", () => ({
  Logtail: vi.fn(function Logtail() {
    return logtailInstance;
  }),
}));

describe("logger", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("logger.info (disabled — no-op per review)", () => {
    it("should not write to the browser console", () => {
      const consoleInfoSpy = vi
        .spyOn(console, "info")
        .mockImplementation(() => {});

      logger.info("test message", { key: "value" });

      expect(consoleInfoSpy).not.toHaveBeenCalled();
    });

    it("should not send anything to Better Stack (Logtail)", () => {
      logger.info("test message", { key: "value" });

      expect(logtailInstance.info).not.toHaveBeenCalled();
    });

    it("should never throw, regardless of arguments", () => {
      expect(() => logger.info()).not.toThrow();
      expect(() => logger.info("msg", { anything: true })).not.toThrow();
      expect(() => logger.info(new Error("boom"))).not.toThrow();
    });
  });

  describe("logger.warn", () => {
    it("should call console.warn", () => {
      const consoleWarnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      logger.warn("warning message", { key: "value" });
      expect(consoleWarnSpy).toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });

    it("should ship an ECS-shaped payload to Logtail", () => {
      vi.spyOn(console, "warn").mockImplementation(() => {});

      logger.warn("Refresh token expired — redirecting to login", {
        correlationId: "abc-123",
        url: "/auth/refresh",
        method: "post",
        status: 401,
      });

      expect(logtailInstance.warn).toHaveBeenCalledTimes(1);
      const [message, meta] = logtailInstance.warn.mock.calls[0];

      expect(message).toBe("Refresh token expired — redirecting to login");
      expect(meta).toMatchObject({
        "log.level": "warn",
        "ecs.version": "8.11.0",
        service: { name: "leapmentor-frontend" },
        trace: { id: "abc-123" },
        url: { path: "/auth/refresh" },
        http: {
          request: { method: "post" },
          response: { status_code: 401 },
        },
      });
    });

    it("should fold unrecognized context keys into ECS `labels`", () => {
      vi.spyOn(console, "warn").mockImplementation(() => {});

      logger.warn("Socket toast waiting for access token", {
        roomId: "room-42",
        attempt: 2,
      });

      const [, meta] = logtailInstance.warn.mock.calls[0];
      expect(meta.labels).toEqual({ roomId: "room-42", attempt: 2 });
      // These aren't standard ECS fields, so they must not leak onto the
      // top-level meta object outside of `labels`.
      expect(meta.roomId).toBeUndefined();
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
      const consoleWarnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      logger.warn("", { key: "value" });
      expect(consoleWarnSpy).toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });

    it("should handle no context", () => {
      const consoleWarnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      logger.warn("warning message");
      expect(consoleWarnSpy).toHaveBeenCalled();

      const [, meta] = logtailInstance.warn.mock.calls[0];
      expect(meta).toEqual({
        "log.level": "warn",
        "ecs.version": "8.11.0",
        service: {
          name: "leapmentor-frontend",
          environment: expect.any(String),
        },
      });
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

    it("should ship an ECS-shaped payload to Logtail, with error.type/stack_trace populated", () => {
      vi.spyOn(console, "error").mockImplementation(() => {});

      logger.error("Server internal error response", {
        correlationId: "corr-9",
        url: "/mentor/sessions",
        status: 500,
        stack: "Error: boom\n  at foo.js:1:1",
        name: "Error",
      });

      expect(logtailInstance.error).toHaveBeenCalledTimes(1);
      const [, meta] = logtailInstance.error.mock.calls[0];

      expect(meta["log.level"]).toBe("error");
      expect(meta.trace).toEqual({ id: "corr-9" });
      expect(meta.url).toEqual({ path: "/mentor/sessions" });
      expect(meta.http.response).toEqual({ status_code: 500 });
      expect(meta.error).toEqual({
        stack_trace: "Error: boom\n  at foo.js:1:1",
        type: "Error",
      });
    });

    it("should not throw when logging fails", () => {
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => {
        throw new Error("Console error");
      });

      expect(() => logger.error("test")).not.toThrow();
      consoleError.mockRestore();
    });

    it("should handle empty message", () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      logger.error("", { key: "value" });
      expect(consoleError).toHaveBeenCalled();
      consoleError.mockRestore();
    });

    it("should handle no context", () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

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
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const obj = Object.create(null);
      Object.defineProperty(obj, "circular", {
        get: function () {
          return this;
        },
      });

      logger.error("test", { problematic: obj });

      expect(consoleError).toHaveBeenCalled();
      consoleError.mockRestore();
    });
  });

  describe("normalizeErrorInput", () => {
    it("should normalize Error objects as message", () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const error = new Error("Test error");
      logger.error(error, { context: "test" });

      const [message] = consoleError.mock.calls[0];
      expect(message).toContain("Test error");
      expect(message).toContain("stack");
      consoleError.mockRestore();
    });

    it("should handle non-Error messages", () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      logger.error("Regular message", { context: "test" });

      const [message] = consoleError.mock.calls[0];
      expect(message).toContain("Regular message");
      consoleError.mockRestore();
    });
  });
});
