/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/utils/logger.js
import { Logtail } from "@logtail/browser"; // Uses the browser SDK, NOT node

const sourceToken = import.meta.env.VITE_LOGTAIL_SOURCE_TOKEN;

// Initialize Logtail only if the token exists (prevents local dev crashes if token is missing)
const logtail = sourceToken ? new Logtail(sourceToken) : null;

// Info-level console output (e.g. every API request/response) is dev-only —
// it's not something we want visible to real users in production. Logtail
// still receives info logs unconditionally, since that's the actual
// production observability channel.
const isDev = import.meta.env.DEV;

const SENSITIVE_KEYS = [
  "accessToken",
  "refreshToken",
  "token",
  "authorization",
  "password",
  "credential",
  "code",
  "secret",
  "apiKey",
  "api_key",
  "auth",
  "cookie",
];

const isLikelyJwt = (str) => {
  if (typeof str !== "string") return false;
  // crude JWT check: three base64url segments separated by dots
  return /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(str);
};

function redactValue(key, value) {
  if (value == null) return value;

  // Errors lose their message/stack via Object.entries (non-enumerable),
  // so handle them explicitly instead of falling through to redactObject.
  if (value instanceof Error) {
    return {
      name: value.name,
      message: sanitizeMessage(value.message),
      stack: value.stack,
    };
  }

  if (typeof value === "string") {
    if (
      SENSITIVE_KEYS.some((k) => key?.toLowerCase().includes(k.toLowerCase()))
    ) {
      return "[REDACTED]";
    }
    if (isLikelyJwt(value)) return "[REDACTED_JWT]";
    // Only redact strings that are ENTIRELY token-like characters (no spaces/
    // punctuation). Anchored so normal sentences/messages/URLs aren't nuked —
    // the previous unanchored regex matched any string containing at least
    // one alphanumeric char, which meant almost every long string qualified.
    if (value.length > 64 && /^[A-Za-z0-9+/=_-]+$/.test(value))
      return "[REDACTED]";
    return value;
  }
  if (typeof value === "object") return redactObject(value);
  return value;
}

function redactObject(obj) {
  if (obj == null) return obj;
  if (obj instanceof Error) return redactValue(null, obj);
  if (Array.isArray(obj)) return obj.map((v) => redactValue(null, v));
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    try {
      out[k] = redactValue(k, v);
    } catch {
      out[k] = "[REDACTED]";
    }
  }
  return out;
}

function sanitizeMessage(message) {
  if (typeof message !== "string") return message;
  // remove JWT-like substrings
  return message.replace(
    /[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/g,
    "[REDACTED_JWT]",
  );
}

function formatConsoleArg(value) {
  if (value == null) return "";
  if (typeof value === "string") return sanitizeMessage(value);
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  if (typeof value === "bigint") return value.toString();
  if (typeof value === "symbol") return value.toString();
  if (value instanceof Error)
    return sanitizeMessage(value.stack || value.message || value.name);
  try {
    return JSON.stringify(redactObject(value));
  } catch {
    return Object.prototype.toString.call(value);
  }
}

function patchConsoleMethod(methodName) {
  const original = console[methodName];
  if (!original || original.__leapmentorPatched) return;

  const patched = (...args) => {
    const safeArgs = args.map(formatConsoleArg);
    try {
      return original.apply(console, safeArgs);
    } catch (error) {
      try {
        return original.call(
          console,
          "[console] Unable to log",
          error?.message || String(error),
        );
      } catch {
        // no-op
      }
    }
  };

  patched.__leapmentorPatched = true;
  console[methodName] = patched;
}

["log", "info", "warn", "error"].forEach(patchConsoleMethod);

function formatLogValue(value) {
  if (value == null) return "";
  if (typeof value === "string") return sanitizeMessage(value);
  if (value instanceof Error) return sanitizeMessage(value.message);
  try {
    return JSON.stringify(redactObject(value));
  } catch {
    return "[UNSERIALIZABLE]";
  }
}

function buildConsoleMessage(level, message, context) {
  const parts = [];
  const messageText = formatLogValue(message);
  if (messageText) parts.push(`[${level}] ${messageText}`);
  else parts.push(`[${level}]`);

  const contextText = formatLogValue(context);
  if (contextText) parts.push(contextText);

  return parts.join(" ");
}

/**
 * Normalizes the (message, context) pair for error-style logging.
 * If `message` is an Error, its `.message` becomes the log message and its
 * `.stack` is folded into context so the trace is never silently dropped.
 */
function normalizeErrorInput(message, context) {
  if (message instanceof Error) {
    return {
      safeMessage: sanitizeMessage(message.message),
      safeContext: redactObject({ ...context, stack: message.stack }),
    };
  }
  return {
    safeMessage: sanitizeMessage(message),
    safeContext: redactObject(context),
  };
}

const logger = {
  info: (message, context = {}) => {
    const safeMessage = sanitizeMessage(message);
    const safeContext = redactObject(context);
    if (logtail) logtail.info(safeMessage, safeContext);
    // Dev-only: keep console logging for local debugging, but never in prod
    if (isDev) {
      try {
        // This is the app's single sanctioned console wrapper; info-level
        // logs must show as info, not warnings, in the browser console.
        // eslint-disable-next-line no-console
        console.info(buildConsoleMessage("INFO", safeMessage, safeContext));
      } catch {
        // no-op: logging must never throw and break the caller's flow
      }
    }
  },
  warn: (message, context = {}) => {
    const safeMessage = sanitizeMessage(message);
    const safeContext = redactObject(context);
    if (logtail) logtail.warn(safeMessage, safeContext);
    try {
      console.warn(buildConsoleMessage("WARN", safeMessage, safeContext));
    } catch {
      // no-op: logging must never throw and break the caller's flow
    }
  },
  error: (message, context = {}) => {
    const { safeMessage, safeContext } = normalizeErrorInput(message, context);
    if (logtail) logtail.error(safeMessage, safeContext);
    try {
      console.error(buildConsoleMessage("ERROR", safeMessage, safeContext));
    } catch {
      // no-op: logging must never throw and break the caller's flow
    }
  },
};

export default logger;
