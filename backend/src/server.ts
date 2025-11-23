import mongoose from "mongoose";
import dotenv from "dotenv";
import { createServer } from "http";
import app from "./app";
import { initializeSocket } from "./socket";
import { startWakeUpService } from "./lib/wake-up.service";
import { validateEnv } from "./lib/envValidation";
import { logger } from "./lib/logger";
import { verifyEmailConnection, closeEmailTransporter } from "./lib/email";

dotenv.config();

// Validate environment variables
validateEnv();

const PORT = process.env.PORT || 5000;

// Set health endpoint for wake-up service
// On Render, use localhost for internal requests (more efficient)
// External URL can be used if you want to test external access
const HEALTH_URL = process.env.HEALTH_ENDPOINT || `http://localhost:${PORT}/api/health`;
process.env.HEALTH_ENDPOINT = HEALTH_URL;

mongoose.connect(process.env.MONGO_URL as string)
  .then(async () => {
    logger.log("MongoDB connected");
    
    // Verify email connection (non-blocking)
    verifyEmailConnection().catch((err) => {
      logger.warn("Email service verification failed (emails may not work):", err);
    });
    
    // Create HTTP server
    const httpServer = createServer(app);
    
    // Initialize Socket.io
    initializeSocket(httpServer);
    
    // Start server
    httpServer.listen(PORT, () => {
      logger.log(`Server running on port ${PORT}`);
      logger.log(`WebSocket server initialized`);

      // Start wake-up service after server is ready
      startWakeUpService();
    });

    // Graceful shutdown - close email connections
    process.on("SIGTERM", async () => {
      logger.log("SIGTERM received, closing connections...");
      await closeEmailTransporter();
      mongoose.connection.close();
      httpServer.close();
      process.exit(0);
    });

    process.on("SIGINT", async () => {
      logger.log("SIGINT received, closing connections...");
      await closeEmailTransporter();
      mongoose.connection.close();
      httpServer.close();
      process.exit(0);
    });
  })
  .catch(err => logger.error("MongoDB connection error:", err));