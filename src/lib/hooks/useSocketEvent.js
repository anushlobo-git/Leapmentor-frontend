/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/lib/hooks/useSocketEvent.js
import { useEffect } from "react";
import logger from "@lib/logger";

const SOCKET_POLL_INTERVAL_MS = 200;

/**
 * Centralizes the "wait for `globalThis.__leapSocket` to connect, then
 * register listeners / clean them up on unmount" pattern that was
 * previously duplicated across several hooks and components.
 *
 * @param {Function} setup - called once per effect run (i.e. whenever
 *   `deps` changes). Must return either:
 *     - `{ events, onConnect, onCleanup }` where `events` is a map of
 *       eventName -> handler, `onConnect(socket)` (optional) fires once,
 *       right after the socket connects and before listeners are attached
 *       (e.g. to emit a "join_room" event), and `onCleanup()` (optional)
 *       fires on teardown, after listeners are removed (e.g. to clear
 *       extra timers or refs); or
 *     - a falsy value to skip subscribing entirely (e.g. while a
 *       required id is not yet available).
 * @param {Array} deps - dependency array controlling when the
 *   subscription is torn down and re-created (same semantics as the
 *   `useEffect` deps array previously used at each call site).
 * @param {string} [logLabel] - label used in log messages, to keep
 *   per-feature log context when debugging.
 */
const useSocketEvent = (setup, deps, logLabel = "Socket") => {
  useEffect(() => {
    const result = setup();
    if (!result?.events) return undefined;

    const { events, onConnect, onCleanup } = result;
    const eventNames = Object.keys(events);

    const waitForSocket = setInterval(() => {
      if (globalThis.__leapSocket?.connected) {
        clearInterval(waitForSocket);
        logger.info(`${logLabel} connected, registering listeners`, {
          events: eventNames,
        });
        onConnect?.(globalThis.__leapSocket);
        eventNames.forEach((eventName) => {
          globalThis.__leapSocket.on(eventName, events[eventName]);
        });
      }
    }, SOCKET_POLL_INTERVAL_MS);

    return () => {
      clearInterval(waitForSocket);
      eventNames.forEach((eventName) => {
        globalThis.__leapSocket?.off(eventName, events[eventName]);
      });
      onCleanup?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};

export default useSocketEvent;
