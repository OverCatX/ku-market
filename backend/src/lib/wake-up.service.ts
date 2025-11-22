/**
 * Wake-up service to keep the server alive on Render
 * This service pings the health endpoint every 14 minutes
 * to prevent the server from going to sleep
 */

import { logger } from "./logger";

const WAKE_UP_INTERVAL_MS = 14 * 60 * 1000; // 14 minutes in milliseconds

let wakeUpInterval: NodeJS.Timeout | null = null;

const getHealthEndpoint = (): string => {
  // Try environment variable first (set in server.ts)
  if (process.env.HEALTH_ENDPOINT) {
    return process.env.HEALTH_ENDPOINT;
  }
  
  // Fallback: use Render external URL if available
  if (process.env.RENDER_EXTERNAL_URL) {
    return `${process.env.RENDER_EXTERNAL_URL}/api/health`;
  }
  
  // Final fallback: localhost with PORT
  const port = process.env.PORT || 5000;
  return `http://localhost:${port}/api/health`;
};

const wakeUp = async () => {
  const healthEndpoint = getHealthEndpoint();
  
  try {
    const response = await fetch(healthEndpoint, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });
    
    if (response.ok) {
      const data = await response.json() as { timestamp: string };
      logger.log(`[Wake-up] Server pinged successfully at ${data.timestamp}`);
    } else {
      logger.warn(`[Wake-up] Health check returned status ${response.status}`);
    }
  } catch (error) {
    logger.error(`[Wake-up] Failed to ping server at ${healthEndpoint}:`, error);
  }
};

export const startWakeUpService = () => {
  // Only start if we're in production (deployed on Render)
  // Render automatically sets RENDER=true and NODE_ENV=production
  // For local testing, you can set ENABLE_WAKE_UP=true in your .env file
  // Note: RENDER=true is set automatically by Render, no need to add it manually
  const shouldStart = 
    process.env.NODE_ENV === "production" || 
    process.env.RENDER === "true" ||
    process.env.ENABLE_WAKE_UP === "true";
  
  if (shouldStart) {
    const intervalMinutes = WAKE_UP_INTERVAL_MS / 1000 / 60;
    logger.log(`[Wake-up] Starting wake-up service. Pinging every ${intervalMinutes} minutes`);
    logger.log(`[Wake-up] Health endpoint: ${getHealthEndpoint()}`);
    
    // Initial ping after 1 minute (give server time to fully start)
    setTimeout(wakeUp, 60 * 1000);
    
    // Schedule periodic pings
    wakeUpInterval = setInterval(wakeUp, WAKE_UP_INTERVAL_MS);
  } else {
    logger.log("[Wake-up] Service disabled (set ENABLE_WAKE_UP=true to enable)");
  }
};

export const stopWakeUpService = () => {
  if (wakeUpInterval) {
    clearInterval(wakeUpInterval);
    wakeUpInterval = null;
    logger.log("[Wake-up] Service stopped");
  }
};

