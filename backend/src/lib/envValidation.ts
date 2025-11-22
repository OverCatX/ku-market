/**
 * Environment variable validation for production
 */
import { logger } from "./logger";

export function validateEnv(): void {
  // Basic validation - only check critical variables
  const criticalVars = ["MONGO_URL", "JWT_SECRET"];
  const missing: string[] = [];

  criticalVars.forEach((varName) => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  if (missing.length > 0) {
    logger.error("❌ Missing critical environment variables:");
    missing.forEach((varName) => {
      logger.error(`   - ${varName}`);
    });
    logger.error("⚠️  Application cannot start without these variables.");
    process.exit(1);
  }

  logger.log("✅ Critical environment variables are set");
}

