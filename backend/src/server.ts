import mongoose from "mongoose";
import dotenv from "dotenv";
import { createServer } from "http";
import app from "./app";
import { initializeSocket } from "./socket";
import { startWakeUpService } from "./lib/wake-up.service";

dotenv.config();

const PORT = process.env.PORT || 5000;

// Set health endpoint for wake-up service
// On Render, use localhost for internal requests (more efficient)
// External URL can be used if you want to test external access
const HEALTH_URL = process.env.HEALTH_ENDPOINT || `http://localhost:${PORT}/api/health`;
process.env.HEALTH_ENDPOINT = HEALTH_URL;

mongoose.connect(process.env.MONGO_URL as string)
  .then(() => {
    console.log("MongoDB connected");
    
    // Create HTTP server
    const httpServer = createServer(app);
    
    // Initialize Socket.io
    initializeSocket(httpServer);
    
    // Start server
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`WebSocket server initialized`);

      // Start wake-up service after server is ready
      startWakeUpService();
    });
  })
  .catch(err => console.error("MongoDB connection error:", err));