/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */
//obj used in this file can be of this way logObj={user :"",accessToken:""}

// src/utils/logger.js
//
// Log levels shipped by this app: warn and error only.
// `info` exists as a callable no-op (see below) — success/informational
// events (API 2xx responses, socket connects, SSO redirects, etc.) are not
// sent anywhere, per review: don't ship success/info-level noise (incl.
// 200/204 responses) to Better Stack. Only genuinely actionable signals
// (warn/error) go to Better Stack, and only warn/error are shown in the
// browser console — both per explicit sign-off from the team.
// Whatever IS shipped to Better Stack is ECS (Elastic Common Schema) shaped
// — see buildEcsMeta() below — so every log line has predictable field
// names (`service.*`, `error.*`, `http.*`, `trace.id`) instead of an
// arbitrary bag of per-call-site keys.
import { Logtail } from "@logtail/browser"; // Uses the browser SDK, NOT node

const sourceToken = import.meta.env.VITE_LOGTAIL_SOURCE_TOKEN;

// Initialize Logtail only if the token exists (prevents local dev crashes if token is missing)
const logtail = sourceToken ? new Logtail(sourceToken) : null;

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

//logObj={user :"",accessToken:""} and key =[user,accessToken] ,value .......
function redactValue(key, value) {
  if (value == null) return value;

  // Errors lose their message/stack via Object.entries (non-enumerable is
  // something that exists in the object but when looped we cant find it its lost),
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
      //some returns true or false u give the array ask question if at least one element satisfies then true
      SENSITIVE_KEYS.some((k) => key?.toLowerCase().includes(k.toLowerCase()))
    ) {
      return "[REDACTED]";
    }
    if (isLikelyJwt(value)) return "[REDACTED_JWT]";
    // Only redact strings that are ENTIRELY token-like characters
    // normal sentences/messages/URLs aren't nuked —
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
  //sanitize is to replace the confidential string with redact string
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

//this function is for console.log ,warn ,error or other logging calls in the application
//and then catches the logs and replaces it with redact if it consist sensitive info
//with the help of formatConsoleArg
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

//value in it is replace with redact for the sensitive information
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

//builds the console message to a standardized format
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
      safeContext: redactObject({
        ...context,
        name: message.name,
        stack: message.stack,
      }),
    };
  }
  return {
    safeMessage: sanitizeMessage(message),
    safeContext: redactObject(context),
  };
}

// ─── ECS (Elastic Common Schema) shaping ────────────────────────────────────
// Applies ONLY to what we ship to Better Stack  — not to the human-
// readable browser console line, which stays as plain "[LEVEL] message ctx"
// text for readability. ECS gives every log line a predictable, queryable
// shape (`service.*`, `error.*`, `http.*`, `trace.id`, ...) instead of an
// arbitrary bag of ad-hoc keys, so Better Stack views/alerts can filter on
// consistent field names across the whole app instead of per-call-site keys.
const ECS_VERSION = "8.11.0";
const SERVICE_NAME = "leapmentor-frontend";
const SERVICE_ENVIRONMENT = import.meta.env.MODE; // "development" | "production" | "test"

/**
 * Reshapes a level + message + free-form context into an ECS-ish metadata
 * object suitable for the Logtail SDK's `context` parameter (Logtail itself
 * supplies `@timestamp`/`dt` and the message; this is everything else).
 * Known keys (correlationId, url, method, status, stack) are mapped onto
 * their proper ECS fieldsets (`trace.id`, `url.path`, `http.*`, `error.*`);
 * anything left over that doesn't have a standard ECS home is preserved
 * under `labels` so no context data is silently dropped.
 * @param {"warn"|"error"} level - Severity of this log line.
 * @param {Record<string, any>} context - Already-redacted context object.
 * @returns {Record<string, any>} ECS-shaped metadata for the Logtail context param.
 */
//returns the object meta that has ECS standard items init
function buildEcsMeta(level, context) {
  const meta: Record<string, any> = {
    "log.level": level,
    "ecs.version": ECS_VERSION,
    service: {
      name: SERVICE_NAME,
      environment: SERVICE_ENVIRONMENT,
    },
  };

  if (!context || typeof context !== "object") return meta;

  const {
    correlationId,
    url,
    method,
    status,
    stack,
    name,
    ...rest
  } = context;
  //meta.trace=correlationId
  if (correlationId) meta.trace = { id: correlationId };
  if (url) meta.url = { path: url };
  if (method || status != null) {
    meta.http = {};
    if (method) meta.http.request = { method };
    if (status != null) meta.http.response = { status_code: status };
  }
  if (stack || name) {
    meta.error = { ...(stack && { stack_trace: stack }), ...(name && { type: name }) };
  }
  if (Object.keys(rest).length) meta.labels = rest;

  return meta;
}

const logger = {
  // Intentionally a no-op — see the block comment above this object.
  // Kept as a real (callable) function rather than deleted so the ~35
  // existing call sites across the app (chat/socket lifecycle, SSO
  // redirects, invoice downloads, etc.) don't need to change; they simply
  // stop producing output. This is a one-line revert if info logging is
  // ever needed again — flip the body back to what warn/error do below.
  info: (..._args: any[]) => {},
  warn: (message, context = {}) => {
    const safeMessage = sanitizeMessage(message);
    const safeContext = redactObject(context);
    if (logtail) logtail.warn(safeMessage, buildEcsMeta("warn", safeContext));
    try {
      console.warn(buildConsoleMessage("WARN", safeMessage, safeContext));
    } catch {
      // no-op: logging must never throw and break the caller's flow
    }
  },
  error: (message, context = {}) => {
    const { safeMessage, safeContext } = normalizeErrorInput(message, context);
    if (logtail) logtail.error(safeMessage, buildEcsMeta("error", safeContext));
    try {
      console.error(buildConsoleMessage("ERROR", safeMessage, safeContext));
    } catch {
      // no-op: logging must never throw and break the caller's flow
    }
  },
};

export default logger;
