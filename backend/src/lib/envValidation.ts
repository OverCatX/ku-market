/**
 * Environment variable validation for production
 */
import { logger } from "./logger";

const requiredEnvVars = [
  "MONGO_URL",
  "JWT_SECRET",
  "PORT",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "STRIPE_SECRET_KEY",
  "SMTP_USER",
  "SMTP_PASS",
  "FRONTEND_URL",
  "SESSION_SECRET",
];

const optionalEnvVars = [
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_REDIRECT_URI",
  "CORS_ORIGIN",
  "NODE_ENV",
  "HEALTH_ENDPOINT",
];

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

