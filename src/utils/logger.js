// src/utils/logger.js
import { Logtail } from "@logtail/browser"; // ✅ Uses the browser SDK, NOT node

const sourceToken = import.meta.env.VITE_LOGTAIL_SOURCE_TOKEN;

// Initialize Logtail only if the token exists (prevents local dev crashes if token is missing)
const logtail = sourceToken ? new Logtail(sourceToken) : null;

const logger = {
  info: (message, context = {}) => {
    if (logtail) logtail.info(message, context);
    console.log(`[INFO] ${message}`, context); // Still prints to browser dev tools console
  },
  warn: (message, context = {}) => {
    if (logtail) logtail.warn(message, context);
    console.warn(`[WARN] ${message}`, context);
  },
  error: (message, context = {}) => {
    if (logtail) logtail.error(message, context);
    console.error(`[ERROR] ${message}`, context);
  },
};

export default logger;
