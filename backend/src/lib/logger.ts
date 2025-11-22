/**
 * Production-ready logger
 * Logs important events in all environments, detailed logs only in development
 */

const isProduction = process.env.NODE_ENV === "production";

export const logger = {
  log: (...args: unknown[]) => {
    // Always log important events (like MongoDB connection)
    console.log(...args);
  },
  
  info: (...args: unknown[]) => {
    // Always log info messages
    console.info(...args);
  },
  
  warn: (...args: unknown[]) => {
    // Always log warnings
    console.warn(...args);
  },
  
  error: (...args: unknown[]) => {
    // Always log errors, even in production
    console.error(...args);
  },
  
  debug: (...args: unknown[]) => {
    // Only log debug messages in development
    if (!isProduction) {
      console.debug(...args);
    }
  },
};

