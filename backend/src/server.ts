import mongoose from "mongoose";
import dotenv from "dotenv";
import { createServer } from "http";
import app from "./app";
import { initializeSocket } from "./socket";

dotenv.config();

const PORT = process.env.PORT || 5000;

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
    });
  })
  .catch(err => console.error("MongoDB connection error:", err));